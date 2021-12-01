import React from 'react';
import SurfaceCRN, {Species_Matcher, Transition_Rule, Colour_Map, Colour} from 'surface_crn';
import {FaPlus, FaMinus} from 'react-icons/fa';

interface ModelStatsProps {
	model : SurfaceCRN
	sim_time : number
	zoomOut : () => void
	zoomIn : () => void
}

interface ModelStatsState {
	sim_time : number
}

export default class ModelStatsComponent extends React.Component<ModelStatsProps, ModelStatsState> {
	
	constructor(p : ModelStatsProps) {
		super(p);
		this.state = {sim_time : 0};
	}
	
	render() {
		
		return <div style={{position: "absolute", bottom: 0}}>
				<FaMinus onClick={this.props.zoomIn}/>
				<FaPlus  onClick={this.props.zoomOut}/>
				
				<div style={{float: "right"}}> {this.state.sim_time.toFixed(2)} </div>
		</div>
	}

}