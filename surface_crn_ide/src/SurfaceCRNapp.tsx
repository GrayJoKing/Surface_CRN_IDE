import React from 'react';
import Surface_CRN, {Transition_Rule, Colour, Colour_Map} from 'surface_crn';
import './index.css';
import HeaderComponent from './components/HeaderComponent';
import GridDisplayComponent from './components/GridDisplayComponent';
import TransitionRulesComponent from './components/TransitionRulesComponent';
import ColourMappingComponent from './components/ColourMappingComponent';
import ImportExportComponent from './components/ImportExportComponent';
import Point from './components/PointClass';

//now import CSS files:
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import CssBaseline from "@mui/material/CssBaseline";
import Grid from "@mui/material/Grid";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Card from "@mui/material/Card";

import { createTheme, ThemeProvider } from '@mui/material/styles';
const theme = createTheme({
	palette: {
		mode: 'dark',
		primary: {
			main: '#2e7d32',
		},
		secondary: {
			main: '#f50057',
		},
	},
});


interface SurfaceCRNappState {
	shown_tab : number

	model : Surface_CRN
	sim_size : number
	sim_time : number
	geometry : "hex" | "square"
	colour_map : Colour_Map
	rules : Transition_Rule[]

	playing_simulation : boolean
	sim_started : boolean

	editValue : string
	selectedCells : Point[]
}

export default class SurfaceCRNapp extends React.Component<{}, SurfaceCRNappState> {

	initial_state_component : GridDisplayComponent | null = null;
	transition_state_component : TransitionRulesComponent | null = null;
	simulator_component : GridDisplayComponent | null = null;
	header_component : HeaderComponent | null = null;

	model_tabs : HTMLButtonElement | null = null;
	toolbarInput : HTMLInputElement | null = null;

	constructor(_ : {}) {
		super(_);
		let model = new Surface_CRN({geometry : "square", initial_state : Array.from({length:5}, () => (Array.from({length:5}, () => 'I')))});
		this.state = {
			shown_tab : 0,

			model : model,
			sim_size : model.pixels_per_node,
			sim_time : 0,
			geometry : model.geometry,
			colour_map : model.colour_map,
			rules : model.rules,

			playing_simulation : false,
			sim_started : false,

			editValue : "",
			selectedCells : []
		};
	}

	render() {
		return <ThemeProvider theme={theme}>
				<CssBaseline />
				<Grid container spacing={1}>
					<HeaderComponent playPressed={this.playPressed.bind(this)} stepBackPressed={this.stepBackwardPressed.bind(this)} stepForwardPressed={this.stepForwardPressed.bind(this)} fastBackwardPressed={this.fastBackwardPressed.bind(this)} fastForwardPressed={this.fastForwardPressed.bind(this)} stopPressed={this.stopPressed.bind(this)} simPlaying={this.state.playing_simulation} ref={elem => this.header_component = elem}/>
					<Grid item xs={12} sm={8}>
						<Card sx={{"height" : "28rem"}}>
							<Grid container sx={{height : "100%"}}>
								<Grid item xs={12} sx={{height : "20%"}}>
									<Tabs value={this.state.shown_tab} onChange={this.onTabSelect.bind(this)}>
										<Tab label="Initial State"></Tab>
										<Tab label="Simulator"></Tab>
									</Tabs>
									<div style={{display:"inline"}}>
										<input type={"text"} value={this.state.editValue} onChange={this.updateSelectedCells.bind(this)} ref={e => this.toolbarInput = e}></input>
										<button onClick={this.changeGeometry.bind(this)}>{this.state.model.geometry === "hex" ? "Square" : "Hex"}</button>
									</div>
								</Grid>

								<Grid item xs={12} sx={{height : "80%"}}>
									{this.state.shown_tab === 0 &&
										<GridDisplayComponent current_state={this.state.model.initial_state} colour_map={this.state.colour_map} geometry={this.state.geometry} ref={elem => this.initial_state_component = elem} size={this.state.sim_size} zoom={this.zoom.bind(this)} sim_time={null} selectedCells={this.selectedCells.bind(this)}/>
									}
									{this.state.shown_tab === 1 &&
										<GridDisplayComponent current_state={this.state.sim_started ? this.state.model.current_state : this.state.model.initial_state} colour_map={this.state.colour_map} geometry={this.state.geometry} ref={elem => this.simulator_component = elem} size={this.state.sim_size} zoom={this.zoom.bind(this)} sim_time={this.state.sim_time} selectedCells={this.selectedCells.bind(this)}/>
									}
								</Grid>
							</Grid>
						</Card>
					</Grid>
					<ColourMappingComponent model={this.state.model} refreshColour={this.refreshColour.bind(this)} addColour={this.addColour.bind(this)} deleteColour={this.deleteColour.bind(this)} colour_map={this.state.colour_map}/>
					<TransitionRulesComponent ref={elem => this.transition_state_component = elem} model={this.state.model} addRule={this.addRule.bind(this)} deleteRule={this.deleteRule.bind(this)} rules={this.state.rules}/>
					<ImportExportComponent export_code={this.export_code.bind(this)} import_code={this.import_code.bind(this)} import_example={this.import_example.bind(this)}/>
				</Grid>
			</ThemeProvider>
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

	import_example(file : string) {
		if (file === "") return;

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
		this.setState({playing_simulation : sim_playing});
	}

	update_page(new_model : Surface_CRN) {
		this.setState({shown_tab : 0, playing_simulation : false, model : new_model, geometry : new_model.geometry, sim_size : new_model.pixels_per_node, sim_time : 0, colour_map : new_model.colour_map, rules : [...new_model.rules]});
		//this.refreshInitState();
	}

	changeGeometry() {
		if (this.state.model.geometry === "hex") {
			this.state.model.geometry = "square";
		} else if (this.state.model.geometry === "square") {
			this.state.model.geometry = "hex";
		}
		this.setState({geometry : this.state.model.geometry});
		this.refreshSimState();
		this.refreshInitState();
	}

	refreshInitState() {
		if (this.initial_state_component !== null) {
			//this.state.model.colour_map.clear_temp();
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
			this.setState({sim_time : model.sim_time});
			sim.setState({colour_map: model.colour_map, size: model.pixels_per_node, data : sim.createData(model.sim_started() ? model.current_state : model.initial_state)});
		}
	}

/*
	updateInitState(x : number, y : number, s : string) {
		this.state.model.set_cell(x, y, s);
		this.refreshInitState();
	}
	updateSimState(x : number, y : number, s : string) {
		this.state.model.current_state[x][y] = s;
		this.refreshSimState();
	}
*/

	refreshColour() {
		this.refreshInitState();
		this.refreshSimState();
	}

	startSimulation() {
		this.state.model.start_sim();
		this.refreshSimState();
		this.setState({sim_started : true});
		console.log('sim started');
	}

	showSimulation() {
		this.setState({shown_tab : 1})
		if (!this.state.model.sim_started()) {
			this.startSimulation();
		}
	}

	onTabSelect(e : React.SyntheticEvent, value : number) {
		this.setState({shown_tab : value});
		if (value === 1) {
			this.startSimulation();
		}
	}

	playPressed(e : MouseEvent) {
		e.preventDefault();
		this.showSimulation();
		if (this.state.playing_simulation) {
			this.setPlaying(false);
		} else {
			this.setPlaying(true);
			this.playSimulation(true);
		}
	}

	playSimulation(started? : boolean) {
		if (!started && !this.state.playing_simulation) return;
		let b = this.state.model.next_frame();
		this.refreshSimState();
		if (!b) {
			this.setPlaying(false);
		} else {
			window.setTimeout(this.playSimulation.bind(this), 1/this.state.model.fps)
		}
	}

	stepForwardPressed(e : PointerEvent) {
		e.preventDefault();
		this.showSimulation();
		if (!this.state.model.step_forward()) {
			console.log('sim finished');
		}
		this.refreshSimState();
		console.log('step forward');
	}

	stepBackwardPressed(e : PointerEvent) {
		e.preventDefault();
		this.showSimulation();
		if (!this.state.model.step_backward()) {
			console.log('sim start');
		}
		this.refreshSimState();
		console.log('step backward');
	}

	fastForwardPressed(e : PointerEvent) {
		e.preventDefault();
		this.showSimulation();
		if (!this.state.model.next_frame()) {
			console.log('sim finished');
		}
		this.refreshSimState();
		console.log('fast forward');
	}

	fastBackwardPressed(e : PointerEvent) {
		e.preventDefault();
		this.showSimulation();
		if (!this.state.model.prev_frame()) {
			console.log('sim start');
		}
		this.refreshSimState();
		console.log('fast backward');
	}

	stopPressed(e : PointerEvent) {
		e.preventDefault();
		this.setPlaying(false);
		//this.model_tabs!.setState({selectedIndex : 0});
		this.state.model.stop_sim();
		this.setState({sim_started : false});
		this.refreshSimState();
	}

	addColour() {
		let c : Colour = this.state.model.colour_map.new_colour();
		this.state.model.colour_map.add(Object.assign(c, {"name" : "New"}));

		this.setState({colour_map : this.state.model.colour_map});
	}

	deleteColour(c : Colour) {
		this.state.model.colour_map.delete(c);
		this.setState({colour_map : this.state.model.colour_map});
	}

	deleteRule(r : Transition_Rule) {
		this.state.model.remove_rule(r);
		this.setState({rules : [...this.state.model.rules]});
	}

	addRule() {
		this.state.model.add_rule();
		this.setState({rules : [...this.state.model.rules]});
	}

	zoom(out : boolean) {
		const oldZoom = this.state.model.pixels_per_node;
		if (out) this.state.model.increase_size();
		else this.state.model.decrease_size();
		this.setState({sim_size : this.state.model.pixels_per_node});
		this.refreshSimState();
		this.refreshInitState();
		return oldZoom/this.state.model.pixels_per_node;
	}

	selectedCells(selected : Point[], value : string) {
		this.setState({selectedCells : selected, editValue : value});
		this.toolbarInput!.focus();
	}

	updateSelectedCells(e : React.ChangeEvent<HTMLInputElement>) {
		if (e.target.value.match(/^\w*$/)) {
			this.setState({editValue : e.target.value});
			for (let p of this.state.selectedCells) {
				this.state.model.set_cell(p.x, p.y, e.target.value);
			}
			this.refreshInitState();
		}
	}
}
