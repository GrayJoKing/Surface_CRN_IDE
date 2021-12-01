"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Colour = exports.Colour_Map = exports.Transition_Rule = exports.Species_Matcher = void 0;
const Species_Matcher_1 = __importDefault(require("./Species_Matcher"));
exports.Species_Matcher = Species_Matcher_1.default;
const Transition_Rule_1 = __importDefault(require("./Transition_Rule"));
exports.Transition_Rule = Transition_Rule_1.default;
const Colour_Map_1 = __importDefault(require("./Colour_Map"));
exports.Colour_Map = Colour_Map_1.default;
const Colour_1 = __importDefault(require("./Colour"));
exports.Colour = Colour_1.default;
const Transition_State_1 = __importDefault(require("./Transition_State"));
const Parser_1 = require("./Parser");
const ts_priority_queue_1 = __importDefault(require("ts-priority-queue"));
const random_1 = __importDefault(require("random"));
class Surface_CRN {
    constructor(p = {}) {
        this.initial_state = [];
        this.rules = [];
        this.colour_map = new Colour_Map_1.default();
        this.options = new Map();
        this.geometry = 'square';
        this.rng_seed = null;
        this.pixels_per_node = 20;
        this.speedup_factor = 0.5;
        this.fps = 30;
        this.current_state = [];
        this.last_updated = [];
        this.sim_time = 0;
        this.sim_queue = null;
        this.sim_history = [];
        this.rule_check_cache = {};
        Object.assign(this, p);
    }
    remove_rule(r) {
        this.rules.splice(this.rules.indexOf(r), 1);
    }
    add_rule() {
        this.rules.push(Transition_Rule_1.default.blankRule());
    }
    set_option(key, value) {
        switch (key) {
            case "geometry":
                if (value === "square" || value === "hex") {
                    this.geometry = value;
                }
                else {
                    throw "Invalid option: Geometry";
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
            default:
                this.options.set(key, value);
        }
    }
    export() {
        let output = [];
        // Options here
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
        if (this.rng_seed !== null)
            random_1.default.clone(this.rng_seed);
        this.sim_queue = new ts_priority_queue_1.default({ comparator: (a, b) => a.execution_time - b.execution_time });
        let initial_changes = [];
        this.initial_state.forEach((s, y) => {
            this.last_updated.push(Array(s.length).fill(0));
            this.current_state.push([]);
            s.forEach((_, x) => {
                this.current_state[this.current_state.length - 1].push(this.initial_state[y][x]);
                let r = this.find_next_transitions(x, y);
                for (let t of r) {
                    initial_changes.push(t);
                }
            });
        });
        this.sim_queue = new ts_priority_queue_1.default({ comparator: (a, b) => a.execution_time - b.execution_time, initialValues: initial_changes });
    }
    get_next_transition() {
        if (this.sim_started()) {
            while (this.sim_queue.length != 0) {
                let t = this.sim_queue.peek();
                let b = t.new_cells.every(([x, y, _]) => {
                    return this.last_updated[y][x] <= t.update_time;
                });
                if (b)
                    break;
                this.sim_queue.dequeue();
            }
            if (this.sim_queue.length == 0)
                return false;
            return this.sim_queue.peek();
        }
        return false;
    }
    run_upto(time) {
        while (this.sim_time < time) {
            let t = this.get_next_transition();
            if (t === false)
                return false;
            if (t.execution_time > time)
                break;
            this.step_forward();
        }
        this.sim_time = time;
        return true;
    }
    run_backto(time) {
        while (this.sim_time > time) {
            let t = this.step_backward();
            if (t === false)
                return false;
        }
        this.sim_time = time;
        return true;
    }
    next_frame() {
        return this.run_upto(this.sim_time + this.speedup_factor * 1 / this.fps);
    }
    prev_frame() {
        return this.run_backto(this.sim_time - this.speedup_factor * 1 / this.fps);
    }
    step_forward() {
        if (this.sim_started()) {
            let t = this.get_next_transition();
            if (t === false)
                return false;
            this.sim_queue.dequeue();
            this.sim_time = t.execution_time;
            t.new_cells.forEach(([x, y, s]) => {
                this.current_state[y][x] = s;
                this.last_updated[y][x] = this.sim_time;
            });
            if (t.new_transitions === null) {
                t.new_transitions = [];
                let ignore = new Set();
                t.new_cells.forEach(([x, y, _]) => {
                    let newT = this.find_next_transitions(x, y, ignore);
                    for (var tr of newT) {
                        this.sim_queue.queue(tr);
                        t && t.new_transitions.push(tr);
                    }
                    ignore.add([x, y]);
                });
            }
            else {
                t.new_transitions.forEach((newT) => {
                    this.sim_queue.queue(newT);
                });
            }
            this.sim_history.push(t);
            //console.log(...t.old_cells, '=>', ...t.new_cells);
            return this.sim_queue.length != 0;
        }
        else {
            return false;
        }
    }
    step_backward() {
        if (this.sim_started()) {
            let t = this.sim_history.pop();
            if (t === undefined)
                return false;
            this.sim_time = t.execution_time;
            t.old_cells.forEach(([x, y, s]) => {
                this.current_state[y][x] = s;
                this.last_updated[y][x] = 0;
            });
            this.sim_queue.queue(t);
            return true;
        }
        return false;
    }
    find_next_transitions(x, y, ignore = new Set()) {
        let current_cell = this.current_state[y][x];
        let possible_transitions = [];
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
        }
        else {
            rs = z;
        }
        for (let rule of rs) {
            if (rule.is_mono) {
                let r = rule.matches(current_cell);
                if (r) {
                    let t = this.sim_time + Math.log(1 / random_1.default.float()) / rule.rate;
                    // if (best_mono_transition !== null && best_mono_transition.execution_time > t) continue;
                    let tr = new Transition_State_1.default(this.sim_time, t);
                    tr.add_old_cell(x, y, current_cell);
                    tr.add_new_cell(x, y, r[0]);
                    possible_transitions.push(tr);
                }
            }
            else {
                let neighbour_offsets = [];
                if (this.geometry == 'square') {
                    neighbour_offsets = [[-1, 0], [0, -1], [1, 0], [0, 1]];
                }
                else {
                    //TODO: hex offsets
                }
                for (let [xd, yd] of neighbour_offsets) {
                    if (y + yd >= 0 && y + yd < this.current_state.length && x + xd >= 0 && x + xd < this.current_state[y + yd].length) {
                        if (ignore.has([x + xd, y + yd]))
                            continue;
                        let other_cell = this.current_state[y + yd][x + xd];
                        let r = rule.matches(current_cell, other_cell);
                        if (r) {
                            let t = this.sim_time + Math.log(1 / random_1.default.float()) / rule.rate;
                            //if (best_transition && best_transition.execution_time > t) continue;
                            let tr = new Transition_State_1.default(this.sim_time, t);
                            tr.add_old_cell(x, y, current_cell);
                            tr.add_old_cell(x + xd, y + yd, other_cell);
                            tr.add_new_cell(x, y, r[0]);
                            tr.add_new_cell(x + xd, y + yd, r[1]);
                            possible_transitions.push(tr);
                        }
                        r = rule.matches(other_cell, current_cell);
                        if (r) {
                            let t = this.sim_time + Math.log(1 / random_1.default.float()) / rule.rate;
                            //if (best_transition && best_transition.execution_time > t) continue;
                            let tr = new Transition_State_1.default(this.sim_time, t);
                            tr.add_old_cell(x, y, current_cell);
                            tr.add_old_cell(x + xd, y + yd, other_cell);
                            tr.add_new_cell(x, y, r[1]);
                            tr.add_new_cell(x + xd, y + yd, r[0]);
                            possible_transitions.push(tr);
                        }
                    }
                }
            }
        }
        return possible_transitions;
    }
    sim_started() {
        return this.sim_queue !== null;
    }
    increase_size() {
        this.pixels_per_node += 1;
    }
    decrease_size() {
        if (this.pixels_per_node <= 1) {
            this.pixels_per_node -= 0.1;
        }
        else {
            this.pixels_per_node -= 1;
        }
    }
}
exports.default = Surface_CRN;
Surface_CRN.parser = { parse_import_files: Parser_1.parse_import_files, parse_code: Parser_1.parse_code };
