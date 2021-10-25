

export default class Transition_State {
	old_cells : [number, number, string][] = [];
	new_cells : [number, number, string][] = [];
	update_time : number;
	execution_time : number;
	new_transitions : Transition_State[] | null = null;
	
	constructor(update_time : number, execution_time : number) {
		this.update_time = update_time;
		this.execution_time = execution_time;
	}
	
	add_old_cell(x : number, y : number, old_val : string) {
		this.old_cells.push([x,y,old_val]);
	}
	
	add_new_cell(x : number, y : number, new_val : string) {
		this.new_cells.push([x,y,new_val]);
	}
	
	add_future_transitions(t : Transition_State[]) {
		this.new_transitions = t;
	}
}