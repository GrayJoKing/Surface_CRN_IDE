
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
	grid_type : 'square'|'hex'
}

export default class Surface_CRN {
	initial_state : string[][] = [];
	rules : Transition_Rule[] = [];
	colour_map : Colour_Map = new Colour_Map();
	options : Map<string, string> = new Map();
	grid_type : 'square'|'hex' = 'square';
	random_seed : number | null = null;
	
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
	
	export() : string {
		let output = [];
		
		// Options here
		
		// Transition rules here
		output.push("!START_TRANSITION_RULES")
		output.push(...this.rules.map(a => a.toString()));
		output.push("!END_TRANSITION_RULES")
		
		// Colour mapping
		output.push(["!START_COLORMAP"])
		output.push(...this.colour_map.export());
		output.push(["!END_COLORMAP"])
		
		// Initial State
		output.push(["!START_INIT_STATE"])
		output.push(...this.initial_state.map(a => a.join(' ')));
		output.push(["!END_INIT_STATE"])
		
		return output.join("\n");
	}
	
	current_state : string[][] = [];
	last_updated : number[][] = [];
	sim_time : number = 0;
	sim_queue : PriorityQueue<Transition_State> | null = null;
	sim_history : Transition_State[] = [];
	
	start_sim() {
		this.current_state = this.initial_state.map(a => [...a]);
		if (this.random_seed !== null) random.clone(this.random_seed);
		this.sim_history = [];
		
		let initial_changes : Transition_State[] = [];
		let ignore : [number,number][] = [];
		this.initial_state.forEach((s : string[], y : number) => {
			this.last_updated.push(Array(s.length).fill(0));
			s.forEach((_, x : number) => {
				let r = this.find_next_transition(x,y, ignore);
				if (r) {
					initial_changes.push(r);
					ignore.push([x,y]);
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
				let ignore : [number,number][] = [];
				t.new_cells.forEach(([x,y,_]) => {
					let newT = this.find_next_transition(x,y, ignore);
					if (newT !== null) {
						this.sim_queue!.queue(newT);
						t && t.new_transitions!.push(newT);
						ignore.push([x,y]);
					}
				});
			} else {
				t.new_transitions.forEach((newT) => {
					this.sim_queue!.queue(newT)
				});
			}
			this.sim_history.push(t);
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
	
	find_next_transition(x : number, y : number, ignore : [number, number][] = []) : Transition_State | null {
		let current_cell = this.current_state[y][x];
		let best_transition : Transition_State | null = null;
		for (let rule of this.rules) {
			if (rule.is_mono) {
				let r = rule.matches(current_cell)
				if (r) {
					let t = this.sim_time + Math.log(1 / random.float()) / rule.rate;
					if (best_transition !== null && best_transition.execution_time > t) continue;
					best_transition = new Transition_State(this.sim_time, t);
					best_transition.add_old_cell(x, y, current_cell);
					best_transition.add_new_cell(x, y, r[0]);
				}
			} else {
				let neighbour_offsets : [number, number][] = [];
				if (this.grid_type == 'square') {
					neighbour_offsets = [[-1,0], [0,-1], [1,0], [0,1]]
				} else {
					//TODO: hex offsets
				}
				for (let [xd,yd] of neighbour_offsets) {
					if (y+yd >= 0 && y+yd < this.current_state.length && x+xd >= 0 && x+xd < this.current_state[y+yd].length) {
						if (ignore.some(([xi,yi]) => xi == x+xd && yi == y+yd)) continue;
						let other_cell = this.current_state[y+yd][x+xd];
						let r = rule.matches(current_cell, other_cell);
						if (r) {
							let t = this.sim_time + Math.log(1 / random.float()) / rule.rate;
							if (best_transition && best_transition.execution_time > t) continue;
							best_transition = new Transition_State(this.sim_time, t);
							best_transition.add_old_cell(x, y, current_cell);
							best_transition.add_old_cell(x+xd, y+yd, other_cell);
							best_transition.add_new_cell(x, y, r[0]);
							best_transition.add_new_cell(x+xd, y+yd, r[1]);
						}
						r = rule.matches(other_cell, current_cell);
						if (r) {
							let t = this.sim_time + Math.log(1 / random.float()) / rule.rate;
							if (best_transition && best_transition.execution_time > t) continue;
							best_transition = new Transition_State(this.sim_time, t);
							best_transition.add_old_cell(x, y, current_cell);
							best_transition.add_old_cell(x+xd, y+yd, other_cell);
							best_transition.add_new_cell(x, y, r[1]);
							best_transition.add_new_cell(x+xd, y+yd, r[0]);
						}
					}
				}
			}
		}
		return best_transition;
	}
	
	sim_started() : boolean {
		return this.sim_queue != null;
	}
}

export {Species_Matcher, Transition_Rule, Colour_Map, Colour}