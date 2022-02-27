
import Species_Matcher from './Species_Matcher';
import Transition_Rule from './Transition_Rule';
import Colour_Map from './Colour_Map';
import Colour from './Colour';
import Transition_State from './Transition_State';
import {parse_import_files, parse_code} from './Parser';
import PriorityQueue from 'ts-priority-queue';
import random from 'random';

interface Surface_CRN_State {
	initial_state : string[][]
	current_state : string[][]
	rules : Transition_Rule[]
	colour_map : Colour_Map
	options : Map<string, string>
	geometry : 'square'|'hex'
}

export default class Surface_CRN {
	initial_state : string[][] = [];
	rules : Transition_Rule[] = [];
	colour_map : Colour_Map = new Colour_Map();
	options : Map<string, string> = new Map();
	geometry : 'square'|'hex' = 'square';
	rng_seed : number | null = null;
	pixels_per_node : number = 20;
	speedup_factor : number = 0.5;
	fps : number = 30;

	static parser = {parse_import_files, parse_code};

	constructor(p : Partial<Surface_CRN_State> = {}) {
		Object.assign(this, p);
	}

	remove_rule(r : Transition_Rule) {
		this.rules.splice(this.rules.indexOf(r), 1);
	}

	add_rule() {
		this.rules.push(Transition_Rule.blankRule());
	}

	set_option(key : string, value : string) {
		switch (key) {
			case "geometry":
				if (value === "square" || value === "hex") {
					this.geometry = value;
				} else {
					throw "Invalid option: Geometry"
				}
				break;
			case "rng_seed":
				var i = parseInt(value);
				this.rng_seed = i;
				break;
			case "pixels_per_node":
				var i = parseInt(value);
				this.pixels_per_node = i;
				break;
			case "speedup_factor":
				var i = parseInt(value);
				this.speedup_factor = i;
				break;
			case "fps":
				var i = parseInt(value);
				this.fps = i;
				break;
		}
		this.options.set(key, value);
	}

	export() : string {
		let output = [];

		// Options here
		for (let [k,v] of this.options) {
			output.push(k + " = " + v);
		}

		// Transition rules here
		output.push("!START_TRANSITION_RULES");
		output.push(...this.rules.map(a => a.toString()));
		output.push("!END_TRANSITION_RULES\n");

		// Colour mapping
		output.push(["!START_COLORMAP"]);
		output.push(...this.colour_map.export());
		output.push(["!END_COLORMAP\n"]);

		// Initial State
		output.push(["!START_INIT_STATE"]);
		output.push(...this.initial_state.map(a => a.join(' ')));
		output.push(["!END_INIT_STATE\n"]);

		return output.join("\n");
	}

	current_state : string[][] = [];
	last_updated : number[][] = [];
	sim_time : number = 0;
	sim_queue : PriorityQueue<Transition_State> | null = null;
	sim_history : Transition_State[] = [];
	rule_check_cache : {[key : string] : Transition_Rule[]} = {};

	stop_sim() {
		this.current_state = [];
		this.last_updated = [];
		this.sim_time = 0;
		this.sim_queue = null;
		this.sim_history = [];
		this.rule_check_cache = {};
		this.colour_map.clear_temp();
	}

	start_sim() {
		this.stop_sim();
		if (this.rng_seed !== null) random.clone(this.rng_seed);
		this.sim_queue = new PriorityQueue<Transition_State>({comparator : (a,b) => a.execution_time-b.execution_time});

		let initial_changes : Transition_State[] = [];
		this.initial_state.forEach((s : string[], y : number) => {
			this.last_updated.push(Array(s.length).fill(0));
			this.current_state.push([]);
			s.forEach((_, x : number) => {
				this.current_state[this.current_state.length-1].push(this.initial_state[y][x]);
				let r = this.find_next_transitions(x,y);
				for (let t of r) {
					initial_changes.push(t);
				}
			})
		})
		this.sim_queue = new PriorityQueue<Transition_State>({comparator : (a,b) => a.execution_time-b.execution_time, initialValues : initial_changes})
	}

	get_next_transition() : Transition_State | false {
		if (this.sim_started()) {
			while (this.sim_queue!.length != 0) {
				let t = this.sim_queue!.peek();
				let b = t.new_cells.every(([x,y,_]) => {
					return this.last_updated[y][x] <= t.update_time;
				});
				if (b) break;
				this.sim_queue!.dequeue();
			}
			if (this.sim_queue!.length == 0) return false;

			return this.sim_queue!.peek();
		}
		return false;
	}

	run_upto(time : number) : boolean {
		while (this.sim_time < time) {
			let t = this.get_next_transition();
			if (t === false) return false;
			if (t.execution_time > time) break;
			this.step_forward();
		}
		this.sim_time = time;
		return true;
	}

	run_backto(time : number) : boolean {
		while (this.sim_time > time) {
			let t = this.step_backward();
			if (t === false) return false;
		}
		this.sim_time = time;
		return true;
	}

	next_frame() : boolean {
		return this.run_upto(this.sim_time + this.speedup_factor*1/this.fps);
	}

	prev_frame() : boolean {
		return this.run_backto(this.sim_time - this.speedup_factor*1/this.fps);
	}

	step_forward() : boolean {
		if (this.sim_started()) {
			let t = this.get_next_transition();
			if (t === false) return false;
			this.sim_queue!.dequeue();

			this.sim_time = t.execution_time;
			t.new_cells.forEach(([x,y,s]) => {
				this.current_state[y][x] = s;
				this.last_updated[y][x] = this.sim_time;
			});
			if (t.new_transitions === null) {
				t.new_transitions = [];
				let ignore : Set<[number,number]> = new Set<[number, number]>();
				t.new_cells.forEach(([x,y,_]) => {
					let newT = this.find_next_transitions(x,y, ignore);
					for (var tr of newT) {
						this.sim_queue!.queue(tr);
						t && t.new_transitions!.push(tr);
					}
					ignore.add([x,y]);
				});
			} else {
				t.new_transitions.forEach((newT) => {
					this.sim_queue!.queue(newT)
				});
			}
			this.sim_history.push(t);
			//console.log(...t.old_cells, '=>', ...t.new_cells);
			return this.sim_queue!.length != 0;
		} else {
			return false;
		}
	}

	step_backward() : boolean {
		if (this.sim_started()) {
			let t = this.sim_history.pop();
			if (t === undefined) return false;

			this.sim_time = t.execution_time;

			t.old_cells.forEach(([x,y,s]) => {
				this.current_state[y][x] = s;
				this.last_updated[y][x] = 0;
			});

			this.sim_queue!.queue(t);
			return true;
		}
		return false;
	}

	find_next_transitions(x : number, y : number, ignore : Set<[number, number]> = new Set()) : Transition_State[] {
		let current_cell = this.current_state[y][x];
		let possible_transitions : Transition_State[] = [];
		let rs = [];

		let z = this.rule_check_cache[current_cell];
		if (z === undefined) {
			/*
			for (let rule of this.rules) {
				if (rule.is_mono && rule.matches(current_cell)) {
					rs.push(rule);
				} else if (!rule.is_mono && rule.m) {

				}
			}
			this.rule_check_cache[current_cell] = rs;
			*/
			rs = this.rules;
		} else {
			rs = z;
		}


		for (let rule of rs) {
			if (rule.is_mono) {
				let m = rule.matches(current_cell)
				for (const r of m) {
					let t = this.sim_time + Math.log(1 / random.float()) / rule.rate;
					// if (best_mono_transition !== null && best_mono_transition.execution_time > t) continue;
					let tr = new Transition_State(this.sim_time, t);
					tr.add_old_cell(x, y, current_cell);
					tr.add_new_cell(x, y, r[0]);
					possible_transitions.push(tr);
				}
			} else {
				let neighbour_offsets : [number, number][] = [];
				if (this.geometry == 'square') {
					neighbour_offsets = [[-1,0], [0,-1], [1,0], [0,1]]
				} else {
					//TODO: hex offsets
				}
				for (let [xd,yd] of neighbour_offsets) {
					if (y+yd >= 0 && y+yd < this.current_state.length && x+xd >= 0 && x+xd < this.current_state[y+yd].length) {
						if (ignore.has([x+xd, y+yd])) continue;
						let other_cell = this.current_state[y+yd][x+xd];
						let m = rule.matches(current_cell, other_cell);
						for (const r of m) {
							let t = this.sim_time + Math.log(1 / random.float()) / rule.rate;
							//if (best_transition && best_transition.execution_time > t) continue;
							let tr = new Transition_State(this.sim_time, t);
							tr.add_old_cell(x, y, current_cell);
							tr.add_old_cell(x+xd, y+yd, other_cell);
							tr.add_new_cell(x, y, r[0]);
							tr.add_new_cell(x+xd, y+yd, r[1]);
							possible_transitions.push(tr);
						}
						m = rule.matches(other_cell, current_cell);
						for (const r of m) {
							let t = this.sim_time + Math.log(1 / random.float()) / rule.rate;
							//if (best_transition && best_transition.execution_time > t) continue;
							let tr = new Transition_State(this.sim_time, t);
							tr.add_old_cell(x, y, current_cell);
							tr.add_old_cell(x+xd, y+yd, other_cell);
							tr.add_new_cell(x, y, r[1]);
							tr.add_new_cell(x+xd, y+yd, r[0]);
							possible_transitions.push(tr);
						}
					}
				}
			}
		}
		return possible_transitions;
	}

	sim_started() : boolean {
		return this.sim_queue !== null;
	}

	increase_size() {
		this.pixels_per_node += 1;
	}
	decrease_size() {
		if (this.pixels_per_node <= 1) {
			this.pixels_per_node -= 0.1;
		} else {
			this.pixels_per_node -= 1;
		}
	}
}

export {Species_Matcher, Transition_Rule, Colour_Map, Colour}
