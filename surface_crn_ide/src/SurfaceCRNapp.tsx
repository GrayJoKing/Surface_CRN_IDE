import React from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import Surface_CRN, {Colour_Map, Transition_Rule, Colour} from 'surface_crn';
import './index.css';
import HeaderComponent from './components/HeaderComponent';
import CRN_GridComponent from './components/Grid_StateComponent';
import TransitionRulesComponent from './components/TransitionRulesComponent';
import ColourMappingComponent from './components/ColourMappingComponent';
import ImportExportComponent from './components/ImportExportComponent';

interface SurfaceCRNappState {
	model : Surface_CRN
}

export default class SurfaceCRNapp extends React.Component<{}, SurfaceCRNappState> {
	
	initial_state_component : CRN_GridComponent | null = null;
	transition_state_component : TransitionRulesComponent | null = null;
	colour_map_component : ColourMappingComponent | null = null;
	simulator_component : CRN_GridComponent | null = null;
	simulation_running : boolean = false;
	
	model_tabs : Tabs | null = null;
	playing_simulation : boolean = false;
	step_time : number = 0.5;

	constructor(_ : {}) {
		super(_);
		this.state = {model : new Surface_CRN({initial_state : Array.from({length:5}, () => (Array.from({length:5}, () => 'I')))})};
	}

	render() {
		return <div className="main_grid grid">
				<HeaderComponent playPressed={this.playPressed.bind(this)} stepBackPressed={this.stepBackPressed.bind(this)} stepForwardPressed={this.stepForwardPressed.bind(this)} />
				<Tabs className="panel state_panel" ref={elem => this.model_tabs = elem} forceRenderTabPanel={true}>
					<TabList>
						<Tab>Initial State</Tab>
						<Tab>Simulator</Tab>
					</TabList>
					
					<TabPanel style={{height:"100%"}}>
						<CRN_GridComponent current_state={this.state.model.initial_state} colour_map={this.state.model.colour_map} grid_type={this.state.model.grid_type} ref={elem => this.initial_state_component = elem} update_state={this.updateInitState.bind(this)}/>
					</TabPanel>
					<TabPanel style={{height:"100%"}}>
						<CRN_GridComponent current_state={this.state.model.current_state} colour_map={this.state.model.colour_map} grid_type={this.state.model.grid_type} ref={elem => this.simulator_component = elem} update_state={this.updateSimState.bind(this)}/>
					</TabPanel>
				</Tabs>
				<ColourMappingComponent ref={elem => this.colour_map_component = elem} model={this.state.model} refreshColour={this.refreshColour.bind(this)} addColour={this.addColour.bind(this)} deleteColour={this.deleteColour.bind(this)}/>
				<TransitionRulesComponent ref={elem => this.transition_state_component = elem} model={this.state.model} addRule={this.addRule} deleteRule={this.deleteRule}/>
				<ImportExportComponent export_code={this.export_code.bind(this)} import_code={this.import_code.bind(this)} import_example={this.import_example.bind(this)}/>
			</div>
	}

	async import_code() {
		const files = (document.getElementById("import_input") as HTMLInputElement).files;
		if (files === null) return;
		
		let new_model : Surface_CRN|false = await Surface_CRN.parser.parse_import_files([...files]);
		
		if (new_model === false) {
			//show errors
		} else {
			this.update_page(new_model);
		}
	}
	
	export_code() {
		let r = this.state.model.export(),
			blob = new Blob([r], { type: 'text/plain' }),
			anchor = document.createElement('a');
		anchor.download = "surface_crn_export.txt";
		anchor.href = (window.webkitURL || window.URL).createObjectURL(blob);
		anchor.dataset.downloadurl = ['text/plain', anchor.download, anchor.href].join(':');
		anchor.click();
	}
	
	import_example(file : string | null) {
		if (file === null || file === "") return;
		console.log(file);
		let r = this;
		fetch(file,
			{headers : { 
				'Content-Type': 'application/text',
				'Accept': 'application/text'
			}}
		).then(function(response : Response){
			return response.text();
		}).then(function(s : string) {
			let new_model = Surface_CRN.parser.parse_code(s.split("\n"));
			
			r.update_page(new_model);
		});
	}

	update_page(new_model : Surface_CRN) {
		this.playing_simulation = false;
		this.model_tabs!.setState({selectedIndex : 0});
		this.setState({model : new_model});
		this.transition_state_component!.setState({rules_list : this.state.model.rules});
		this.colour_map_component!.setState({colours : this.state.model.colour_map.colours});

		this.update_init_state(this.state.model.initial_state, this.state.model.colour_map, this.state.model.grid_type);
	}

	update_init_state(init_state : string[][], colour_map : Colour_Map, grid_type : 'hex'|'square') {
		this.initial_state_component!.setState({colour_map: colour_map, grid_type: grid_type});
		this.initial_state_component!.updateColsAndData(init_state);
	}
	
	refreshInitState() {
		// TODO: redo this to avoid re-rendering the whole state?
		this.update_init_state(this.state.model.initial_state, this.state.model.colour_map, this.state.model.grid_type);
	}
	
	updateInitState(x : number, y : number, s : string) {
		this.state.model.initial_state[x][y] = s;
		this.refreshInitState();
	}
	
	updateSimState(x : number, y : number, s : string) {
		this.state.model.current_state[x][y] = s;
		this.refreshSimState();
	}
	
	refreshSimState() {
		this.simulator_component!.setState({colour_map: this.state.model.colour_map});
		this.simulator_component!.updateColsAndData(this.state.model.current_state);
	}
	
	refreshColour() {
		this.refreshInitState();
		this.refreshSimState();
	}
	
	startSimulation() {
		this.state.model.start_sim();
		this.refreshSimState();
		console.log('sim started');
	}
	
	showSimulation() {
		this.model_tabs!.setState({selectedIndex : 1});
		if (!this.state.model.sim_started()) {
			this.startSimulation();
		}
	}
	
	onTabSelect(index: number, lastIndex: number, event: Event) {
		if (index != lastIndex) {
			if (index == 1) {
				this.startSimulation();
			}
		}
	}
	
	playPressed() {
		this.showSimulation();
		if (this.playing_simulation) {
			this.playing_simulation = false;
		} else {
			this.playing_simulation = true;
			this.playSimulation(true);
		}
	}
	
	playSimulation(started? : boolean) {
		if (!this.playing_simulation) return;
		let b = this.state.model.run_upto(this.state.model.sim_time + this.step_time);
		this.simulator_component!.updateColsAndData(this.state.model.current_state);
		if (!b) {
			this.playing_simulation = false;
		} else {
			window.setTimeout(this.playSimulation.bind(this), 1)
		}
	}
	
	stepForwardPressed() {
		this.showSimulation();
		if (!this.state.model.step_forward()) {
			console.log('sim finished');
		}
		this.simulator_component!.updateColsAndData(this.state.model.current_state);
		console.log('step forward');
	}
	
	stepBackPressed() {
		this.showSimulation();
		if (!this.state.model.step_backward()) {
			console.log('sim start');
		}
		this.simulator_component!.updateColsAndData(this.state.model.current_state);
		console.log('step backward');
	}
	
	addColour() {
		let c : string = this.state.model.colour_map.new_colour();
		this.state.model.colour_map.add(new Colour(Object.assign(Colour.hex2rgb(c), {"name" : "New"})));
		
		this.colour_map_component!.setState({colours : this.state.model.colour_map.colours})
	}
	
	deleteColour(c : Colour) {
		this.state.model.colour_map.delete(c);
		this.colour_map_component!.setState({colours : this.state.model.colour_map.colours})
	}
	
	deleteRule(r : Transition_Rule) {
		this.state.model.remove_rule(r);
		this.transition_state_component!.setState({rules_list : [...this.state.model.rules]});
	}
	
	addRule() {
		this.state.model.add_rule();
		this.transition_state_component!.setState({rules_list : [...this.state.model.rules]});
	}
}