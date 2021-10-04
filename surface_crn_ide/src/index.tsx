import React from 'react';
import ReactDOM from 'react-dom';
import {SCRN_Species, SCRN_Transition_Rule, SCRN_Colour_Map, SCRN_Colour} from 'surface_crn';
import Surface_CRN from 'surface_crn';
import './index.css';
import HeaderComponent from './components/HeaderComponent';
import InitialStateComponent from './components/InitialStateComponent';
import TransitionRulesComponent from './components/TransitionRulesComponent';
import SimulatorOptionsComponent from './components/SimulatorOptionsComponent';
import ColourMappingComponent from './components/ColourMappingComponent';
import ImportExportComponent from './components/ImportExportComponent';

let current_model : Surface_CRN = new Surface_CRN();

ReactDOM.render(
	<React.StrictMode>
		<title> Surface CRN Simulator </title>
		<div className="main_grid grid">
			<HeaderComponent />
			<InitialStateComponent model={current_model} />
			<TransitionRulesComponent />
			<SimulatorOptionsComponent />
			<ColourMappingComponent />
			<ImportExportComponent import_code={import_code}/>
		</div>
	</React.StrictMode>,
	document.getElementById('root')
);

async function import_code() {
	const files = (document.getElementById("import_input") as HTMLInputElement).files;
	if (files === null) return;
	
	let new_model = await Surface_CRN.parser.parse_import_files([...files]);
	
	if (new_model === false) {
		//show errors
	} else {
		current_model = new_model;
		update_page();
	}
}

function update_page() {
	update_rules(current_model.rules);
	update_colour_map(current_model.colour_map);
	update_init_state(current_model.initial_state, current_model.colour_map);
}

function update_rules(rules:SCRN_Transition_Rule[]) {
	// TODO: convert to React style
	var rule_list = document.getElementById("rule_list");

	if (rule_list === null) return;
	
	rule_list.textContent = '';
	
	for (let r of rules) {
		var row = document.createElement("tr");
		for (var [i, type] of [r.reactants, r.products].entries()) {
			var item;
			if (i === 1) {
				item = document.createElement("td");
				item.textContent = '=>';
				row.appendChild(item);
			}
			for (var [j, species] of type.entries()) {
				if (j === 1) {
					item = document.createElement("td");
					item.textContent = '+';
					row.appendChild(item);
				}
				item = document.createElement("td");
				var inp = document.createElement("input");
				inp.type = "text";
				inp.value = species.matcher;
				item.appendChild(inp);
				row.appendChild(item);
			}
		}
		rule_list.appendChild(row);
	}
}

function update_colour_map(colour_map:SCRN_Colour_Map) {
	// TODO: convert to React style
	var colour_list = document.getElementById("colour_list");
	if (colour_list == null) return;
	
	colour_list.textContent = '';
	
	for (let [name, c] of colour_map) {
		var row = document.createElement("tr");
		var item;
		item = document.createElement("td");
		var inp = document.createElement("input");
		inp.type = "text";
		inp.value = name;
		item.appendChild(inp);
		row.appendChild(item);

		item = document.createElement("td");
		item.textContent = '('+c.rgb().join(',')+')';
		row.appendChild(item);
		for (var species of c.species) {
			item = document.createElement("td");
			inp = document.createElement("input");
			inp.type = "text";
			inp.value = species.matcher;
			item.appendChild(inp);
			row.appendChild(item);
		}
		colour_list.appendChild(row);
	}
}

function update_init_state(init_state:SCRN_Species[][], colour_map:SCRN_Colour_Map) {
	
}