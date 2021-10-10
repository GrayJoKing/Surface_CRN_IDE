import React from 'react';
import ReactDOM from 'react-dom';
import Surface_CRN, {Species_Matcher, Transition_Rule, Colour_Map, Colour} from 'surface_crn';
import './index.css';
import HeaderComponent from './components/HeaderComponent';
import CRN_GridComponent from './components/Grid_StateComponent';
import TransitionRulesComponent from './components/TransitionRulesComponent';
import SimulatorOptionsComponent from './components/SimulatorOptionsComponent';
import ColourMappingComponent from './components/ColourMappingComponent';
import ImportExportComponent from './components/ImportExportComponent';

interface SurfaceCRNappState {
	model : Surface_CRN
}

export default class SurfaceCRNapp extends React.Component<{}, SurfaceCRNappState> {
	
	initial_state_component : CRN_GridComponent | null = null;

	constructor(p : {}) {
		super(p);
		this.state = {model : new Surface_CRN({current_state : Array(5).fill(Array(5).fill('I'))})};
	}

	render() {
		return <div className="main_grid grid">
				<HeaderComponent />
				<CRN_GridComponent model={this.state.model} ref={elem => this.initial_state_component = elem}/>
				<TransitionRulesComponent />
				<SimulatorOptionsComponent />
				<ColourMappingComponent />
				<ImportExportComponent import_code={this.import_code.bind(this)}/>
			</div>
		}

	async import_code() {
		const files = (document.getElementById("import_input") as HTMLInputElement).files;
		if (files === null) return;
		
		let new_model : Surface_CRN|false = await Surface_CRN.parser.parse_import_files([...files]);
		
		if (new_model === false) {
			//show errors
		} else {
			this.setState({model : new_model});
			this.update_page();
		}
	}

	update_page() {
		// TODO: move all these to component render sections
		this.update_rules(this.state.model.rules);
		this.update_colour_map(this.state.model.colour_map);
		this.update_init_state(this.state.model.current_state, this.state.model.colour_map, this.state.model.grid_type);
	}

	update_rules(rules : Transition_Rule[]) {
		// TODO: convert to jsx style
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
					inp.value = species.original_string;
					item.appendChild(inp);
					row.appendChild(item);
				}
			}
			rule_list.appendChild(row);
		}
	}

	update_colour_map(colour_map : Colour_Map) {
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
				inp.value = species.original_string;
				item.appendChild(inp);
				row.appendChild(item);
			}
			colour_list.appendChild(row);
		}
	}

	update_init_state(init_state : string[][], colour_map : Colour_Map, grid_type : 'hex'|'square') {
		this.initial_state_component!.setState({current_state: init_state, colour_map: colour_map, grid_type: grid_type});
		this.initial_state_component!.updateColsAndData(init_state);
	}
}