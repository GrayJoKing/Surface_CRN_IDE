import React from 'react';

export default class TransitionRulesComponent extends React.Component {
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