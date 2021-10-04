import React, {useRef, useEffect} from 'react';
import Surface_CRN, {SCRN_Species, SCRN_Transition_Rule, SCRN_Colour_Map, SCRN_Colour} from 'surface_crn';

interface InitialStateProps {
	model : Surface_CRN
}

export default class InitialStateComponent extends React.Component<InitialStateProps> {	
	public constructor(props: InitialStateProps) {
		super(props);
	}
	
	render() {
		return <div className="grid panel state_panel">
			<h3 className="panel_header"> Initial State </h3>
			
			<CanvasGrid
				model = {this.props.model}
			/>
		</div>;
	}
}

interface CanvasGridProps {
	model : Surface_CRN,
}

interface CanvasGridState extends React.ComponentState {
	canvas_state : SCRN_Species[][];
	colour_map: SCRN_Colour_Map,
	grid_type: 'square'|'hex'
}

class CanvasGrid extends React.Component<CanvasGridProps, CanvasGridState> {
	canvas_ref : HTMLCanvasElement|null = null;
	
	public constructor(props: CanvasGridProps) {
		super(props);
		let {model} = props;
		this.setState({canvas_state: model.initial_state, colour_map: model.colour_map, grid_type: model.grid_type});
	}
	
	public updateGrid(x : number, y: number, s : SCRN_Species) {
		
		let c = this.state.colour_map.find_colour(s);
		if (c === null) c = new SCRN_Colour({name: "white", red:0, green:0, blue:0});;
		
		this.draw(x,y,c);
	}
	
	private draw(x : number, y: number, c : SCRN_Colour) {
		
	}
	
	render() {
		/*
		for (let [x, row] of this.state.canvas_state) {
			for (let [y, elem] of row) {
				
			}
		}*/
		return <canvas ref={r => this.canvas_ref = r}>
				
			</canvas>
		
	}
}