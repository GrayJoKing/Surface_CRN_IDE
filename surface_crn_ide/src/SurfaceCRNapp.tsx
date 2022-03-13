import React from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import Surface_CRN, {Transition_Rule, Colour} from 'surface_crn';
import './index.css';
import HeaderComponent from './components/HeaderComponent';
import CRN_GridComponent from './components/Grid_StateComponent';
import TransitionRulesComponent from './components/TransitionRulesComponent';
import ColourMappingComponent from './components/ColourMappingComponent';
import ImportExportComponent from './components/ImportExportComponent';

interface SurfaceCRNappState {
	model : Surface_CRN
	playing_simulation : boolean
	sim_size : number
	sim_time : number
}

export default class SurfaceCRNapp extends React.Component<{}, SurfaceCRNappState> {

	initial_state_component : CRN_GridComponent | null = null;
	transition_state_component : TransitionRulesComponent | null = null;
	colour_map_component : ColourMappingComponent | null = null;
	simulator_component : CRN_GridComponent | null = null;
	header_component : HeaderComponent | null = null;

	model_tabs : Tabs | null = null;
	playing_simulation : boolean = false;

	constructor(_ : {}) {
		super(_);
		let model = new Surface_CRN({geometry : "square", initial_state : Array.from({length:5}, () => (Array.from({length:5}, () => 'I')))});
		this.state = {
			model : model,
			playing_simulation : false,
			sim_size : model.pixels_per_node,
			sim_time : 0
		};
	}

	render() {
		return <div className="main_grid grid">
				<HeaderComponent playPressed={this.playPressed.bind(this)} stepBackPressed={this.stepBackwardPressed.bind(this)} stepForwardPressed={this.stepForwardPressed.bind(this)} fastBackwardPressed={this.fastBackwardPressed.bind(this)} fastForwardPressed={this.fastForwardPressed.bind(this)} stopPressed={this.stopPressed.bind(this)} ref={elem => this.header_component = elem}/>
				<Tabs className="panel state_panel" ref={elem => this.model_tabs = elem} onSelect={this.onTabSelect.bind(this)}>
					<TabList>
						<Tab>Initial State</Tab>
						<Tab>Simulator</Tab>
					</TabList>

					<TabPanel style={{height:"100%"}}>
						<CRN_GridComponent current_state={this.state.model.initial_state} colour_map={this.state.model.colour_map} geometry={this.state.model.geometry} ref={elem => this.initial_state_component = elem} update_state={this.updateInitState.bind(this)} size={this.state.sim_size} zoom={this.zoom.bind(this)} sim_time={null}/>
					</TabPanel>
					<TabPanel style={{height:"100%", position:"relative"}}>
						<CRN_GridComponent current_state={this.state.model.sim_started() ? this.state.model.current_state : this.state.model.initial_state} colour_map={this.state.model.colour_map} geometry={this.state.model.geometry} ref={elem => this.simulator_component = elem} update_state={this.updateSimState.bind(this)} size={this.state.sim_size} zoom={this.zoom.bind(this)} sim_time={0}/>
					</TabPanel>
				</Tabs>
				<ColourMappingComponent ref={elem => this.colour_map_component = elem} model={this.state.model} refreshColour={this.refreshColour.bind(this)} addColour={this.addColour.bind(this)} deleteColour={this.deleteColour.bind(this)}/>
				<TransitionRulesComponent ref={elem => this.transition_state_component = elem} model={this.state.model} addRule={this.addRule.bind(this)} deleteRule={this.deleteRule.bind(this)}/>
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

	setPlaying(sim_playing : boolean) {
		this.playing_simulation = sim_playing;
		this.header_component!.setState({simPlaying : sim_playing});

	}

	update_page(new_model : Surface_CRN) {
		this.setPlaying(false);

		this.model_tabs!.setState({selectedIndex : 0});
		this.setState({model : new_model, sim_size : new_model.pixels_per_node, sim_time : 0});
		this.transition_state_component!.setState({rules_list : this.state.model.rules});
		this.colour_map_component!.setState({colours : this.state.model.colour_map.colours});

		//this.refreshInitState();
	}

	refreshInitState() {
		if (this.initial_state_component !== null) {
			this.initial_state_component!.setState({
				colour_map: this.state.model.colour_map,
				geometry: this.state.model.geometry,
				size: this.state.model.pixels_per_node,
				data : this.initial_state_component.createData(this.state.model.initial_state)
			});
		}
	}

	refreshSimState() {
		const sim = this.simulator_component;
		const model = this.state.model;
		if (sim !== null) {
			sim.setState({colour_map: model.colour_map, size: model.pixels_per_node, sim_time: model.sim_time, data : sim.createData(model.sim_started() ? model.current_state : model.initial_state)});
		}
	}

	updateInitState(x : number, y : number, s : string) {
		this.state.model.set_cell(x, y, s);
		this.refreshInitState();
	}

	updateSimState(x : number, y : number, s : string) {
		//this.state.model.current_state[x][y] = s;
		this.refreshSimState();
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
		if (index !== lastIndex) {
			if (index === 1) {
				this.startSimulation();
			}
		}
	}

	playPressed() {
		this.showSimulation();
		if (this.playing_simulation) {
			this.setPlaying(false);
		} else {
			this.setPlaying(true);
			this.playSimulation(true);
		}
	}

	playSimulation(started? : boolean) {
		if (!started && !this.playing_simulation) return;
		let b = this.state.model.next_frame();
		this.refreshSimState();
		if (!b) {
			this.setPlaying(false);
		} else {
			window.setTimeout(this.playSimulation.bind(this), 1/this.state.model.fps)
		}
	}

	stepForwardPressed() {
		this.showSimulation();
		if (!this.state.model.step_forward()) {
			console.log('sim finished');
		}
		this.refreshSimState();
		console.log('step forward');
	}

	stepBackwardPressed() {
		this.showSimulation();
		if (!this.state.model.step_backward()) {
			console.log('sim start');
		}
		this.refreshSimState();
		console.log('step backward');
	}

	fastForwardPressed() {
		this.showSimulation();
		if (!this.state.model.next_frame()) {
			console.log('sim finished');
		}
		this.refreshSimState();
		console.log('fast forward');
	}

	fastBackwardPressed() {
		this.showSimulation();
		if (!this.state.model.prev_frame()) {
			console.log('sim start');
		}
		this.refreshSimState();
		console.log('fast backward');
	}

	stopPressed() {
		this.setPlaying(false);
		//this.model_tabs!.setState({selectedIndex : 0});
		this.state.model.stop_sim();
		this.refreshSimState();
	}

	addColour() {
		let c : Colour = this.state.model.colour_map.new_colour();
		this.state.model.colour_map.add(Object.assign(c, {"name" : "New"}));

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

	zoom(out : boolean) {
		if (out) this.state.model.increase_size();
		else this.state.model.decrease_size();
		this.setState({sim_size : this.state.model.pixels_per_node});
		this.refreshSimState();
		this.refreshInitState();
	}
}
