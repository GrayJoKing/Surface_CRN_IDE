import React from 'react';

export default class ColourMappingComponent extends React.Component {
	render() {
		return <div className="grid panel colour_panel">
			<h3> Colour Mapping </h3>
			
			<div id="colour_container">
				<table id="colour_list">
					
				</table>
			</div>
		</div>;
	}
}