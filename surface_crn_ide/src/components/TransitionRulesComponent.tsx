import React from 'react';

import {Species_Matcher, Transition_Rule, Colour_Map, Colour} from 'surface_crn';

export default class TransitionRulesComponent extends React.Component {
	rules_list : Transition_Rule[];

	constructor(rules_list : Transition_Rule[]) {
		super(rules_list);
		this.rules_list = rules_list;
	}

	render() {
		return <div className="grid panel rules_panel">
			<h3 className="panel_header"> Transition Rules </h3>
			
			<div id="rule_container">
				<table id="rule_list">
					
				</table>
			</div>
		</div>;
	}
}