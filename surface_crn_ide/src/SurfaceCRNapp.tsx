import React from 'react';
import Surface_CRN, {Transition_Rule, Colour, Colour_Map} from 'surface_crn';
import './index.css';
import HeaderComponent from './components/HeaderComponent';
import GridDisplayComponent from './components/GridDisplayComponent';
import TransitionRulesComponent from './components/TransitionRulesComponent';
import ColourMappingComponent from './components/ColourMappingComponent';
import ImportExportComponent from './components/ImportExportComponent';
import Point from './components/PointClass';

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import CssBaseline from "@mui/material/CssBaseline";
import Grid from "@mui/material/Grid";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Card from "@mui/material/Card";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import InputAdornment from '@mui/material/InputAdornment';
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

import HexagonIcon from '@mui/icons-material/Hexagon';
import SquareIcon from '@mui/icons-material/Square';
import IconButton from "@mui/material/IconButton";

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
	geometry : "hex" | "square"
	colour_map : Colour_Map
	rules : Transition_Rule[]

	playing_simulation : boolean

	editValue : string
	selectedCells : Point[]
	rngSeed : string
	fps : number
	speedup_factor : number
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
		let model = new Surface_CRN({geometry : "square", initial_state : Array.from({length:20}, () => (Array.from({length:20}, () => 'I')))});
		this.state = {
			shown_tab : 0,

			model : model,
			sim_size : model.pixels_per_node,
			geometry : model.geometry,
			colour_map : model.colour_map,
			rules : model.rules,

			playing_simulation : false,

			editValue : "",
			selectedCells : [],
			rngSeed : (model.rng_seed || "").toString(),
			fps : model.fps,
			speedup_factor : model.speedup_factor
		};
	}

	render() {
		return <ThemeProvider theme={theme}>
				<CssBaseline />
				<Grid container spacing={1} sx={{"margin" : "auto", "width":"98%", "height": "98%"}}>
					<HeaderComponent playPressed={this.playPressed.bind(this)} stepBackPressed={this.stepBackwardPressed.bind(this)} stepForwardPressed={this.stepForwardPressed.bind(this)} fastBackwardPressed={this.fastBackwardPressed.bind(this)} fastForwardPressed={this.fastForwardPressed.bind(this)} stopPressed={this.stopPressed.bind(this)} simPlaying={this.state.playing_simulation} ref={elem => this.header_component = elem}/>
					<Grid item xs={12} sm={8}>
						<Card sx={{"height" : "35rem"}}>
							<Grid container sx={{height : "100%"}}>
								<Grid item xs={12} sx={{height : "20%"}}>
									<Tabs value={this.state.shown_tab} onChange={this.onTabSelect.bind(this)}>
										<Tab label="Initial State"></Tab>
										<Tab label="Simulator"></Tab>
									</Tabs>
									<Box style={{display:"inline"}}>
									{ this.state.shown_tab === 0 &&
										<Box>
											<Typography variant="overline" sx={{"font-size": 20, "margin" : "5px"}}> Editing Options </Typography>
											<TextField label="" size="small" variant="filled" value={this.state.editValue} onChange={this.updateSelectedCells.bind(this)} inputRef={e => this.toolbarInput = e}/>
											<IconButton aria-label="Type" onClick={this.changeGeometry.bind(this)}>{this.state.model.geometry === "hex" ?  <HexagonIcon /> : <SquareIcon /> }</IconButton>
											<TextField label="Random Seed" value={this.state.rngSeed} onChange={this.setRNGseed.bind(this)} size="small"/>
										</ Box>
									}

									{ this.state.shown_tab === 1 &&
										<Box>
											<Typography variant="overline" sx={{"font-size": 20, "margin" : "5px"}}> Playback Options </Typography>
											<TextField label="Speed" size="small" variant="filled" value={this.state.speedup_factor} onChange={this.updateSpeedUp.bind(this)} InputProps={{type : "number"}} style={{width : "10%"}}/>
											<TextField label="FPS" size="small" variant="filled" value={this.state.fps} onChange={this.updateFPS.bind(this)} InputProps={{type : "number"}} style={{width : "10%"}}/>
											<TextField label="Random Seed" value={this.state.shown_tab === 1 ? this.state.model.random?.seed.toString() : this.state.rngSeed} onChange={this.setRNGseed.bind(this)} disabled={this.state.shown_tab === 1} InputProps={{endAdornment:this.state.shown_tab === 1 ? <InputAdornment position="end"><Button onClick={this.copyRNGseed.bind(this)} >Set</Button></InputAdornment> : null}} size="small"/>
										</ Box>
									}
									</Box>
								</Grid>

								<Grid item xs={12} sx={{height : "80%"}}>
									{this.state.shown_tab === 0 &&
										<GridDisplayComponent current_state={this.state.model.initial_state} model={this.state.model} geometry={this.state.geometry} ref={elem => this.initial_state_component = elem} size={this.state.sim_size} zoom={this.zoom.bind(this)} selectedCells={this.selectedCells.bind(this)}/>
									}
									{this.state.shown_tab === 1 &&
										<GridDisplayComponent current_state={this.state.model.sim_started() ? this.state.model.current_state : this.state.model.initial_state} model={this.state.model} geometry={this.state.geometry} ref={elem => this.simulator_component = elem} size={this.state.sim_size} zoom={this.zoom.bind(this)} selectedCells={this.selectedCells.bind(this)} simulation/>
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
		this.setState({shown_tab : 0, playing_simulation : false, model : new_model, geometry : new_model.geometry, sim_size : new_model.pixels_per_node, colour_map : new_model.colour_map, rules : [...new_model.rules], editValue : "", selectedCells : [], rngSeed : (new_model.rng_seed || "").toString(), fps : new_model.fps, speedup_factor : new_model.speedup_factor});
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
			sim.setState({colour_map: model.colour_map, size: model.pixels_per_node, data : sim.createData(model.sim_started() ? model.current_state : model.initial_state), sim_time : model.sim_time});
		}
	}

	refreshColour() {
		this.refreshInitState();
		this.refreshSimState();
	}

	startSimulation() {
		this.state.model.start_sim();
		this.refreshSimState();
		this.setState({rngSeed : this.state.model.random!.seed.toString()});
	}

	showSimulation() {
		if (this.state.shown_tab !== 1) this.setState({shown_tab : 1})
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
		this.state.model.step_forward()
		this.refreshSimState();
	}

	stepBackwardPressed(e : PointerEvent) {
		e.preventDefault();
		this.showSimulation();
		this.state.model.step_backward();
		this.refreshSimState();
	}

	fastForwardPressed(e : PointerEvent) {
		e.preventDefault();
		this.showSimulation();
		this.state.model.next_frame();
		this.refreshSimState();
	}

	fastBackwardPressed(e : PointerEvent) {
		e.preventDefault();
		this.showSimulation();
		this.state.model.prev_frame();
		this.refreshSimState();
	}

	stopPressed(e : PointerEvent) {
		e.preventDefault();
		this.setPlaying(false);
		this.state.model.stop_sim();
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
		return oldZoom/this.state.model.pixels_per_node;
	}

	selectedCells(selected : Point[], value : string) {
		this.setState({selectedCells : selected, editValue : value});
		this.toolbarInput && this.toolbarInput.focus();
	}

	updateSelectedCells(e : React.ChangeEvent<HTMLInputElement>) {
		if (e.target.value.match(/^\w*$/)) {
			this.setState({editValue : e.target.value});
			this.state.model.set_cells(this.state.selectedCells.map(p => [p.x, p.y]), e.target.value);
			this.refreshInitState();
		}
	}

	setRNGseed(e : React.ChangeEvent<HTMLInputElement>) {
		let n = e.target.value;
		if (n === '') {
			this.setState({rngSeed : n});
			this.state.model.rng_seed = null;
		} else {
			let x = parseInt(n);
			this.setState({rngSeed : n});
			this.state.model.rng_seed = x;
		}
	}

	copyRNGseed() {
		this.state.model.rng_seed = this.state.model.random!.seed;
		this.setState({rngSeed : this.state.model.rng_seed.toString()});
	}

	updateFPS(e : React.ChangeEvent<HTMLInputElement>) {
		let n = e.target.value;
		let x = parseFloat(n);
		this.setState({fps : x});
		this.state.model.fps = x;
	}

	updateSpeedUp(e : React.ChangeEvent<HTMLInputElement>) {
		let n = e.target.value;
		let x = parseFloat(n);
		this.setState({speedup_factor : x});
		this.state.model.speedup_factor = x;
	}
}
