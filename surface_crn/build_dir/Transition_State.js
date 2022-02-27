"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Transition_State {
    constructor(update_time, execution_time) {
        this.old_cells = [];
        this.new_cells = [];
        this.new_transitions = null;
        this.update_time = update_time;
        this.execution_time = execution_time;
    }
    add_old_cell(x, y, old_val) {
        this.old_cells.push([x, y, old_val]);
    }
    add_new_cell(x, y, new_val) {
        this.new_cells.push([x, y, new_val]);
    }
    add_future_transitions(t) {
        this.new_transitions = t;
    }
}
exports.default = Transition_State;
