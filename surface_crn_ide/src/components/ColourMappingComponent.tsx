import React from 'react';
import SurfaceCRN, {Colour, Species_Matcher, Colour_Map} from 'surface_crn';
import { HexColorPicker } from "react-colorful";
import ArrowDropDownCircleTwoToneIcon from '@mui/icons-material/ArrowDropDownCircleTwoTone';
import ArrowDropDownCircleOutlinedIcon from '@mui/icons-material/ArrowDropDownCircleOutlined';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';

import Grid from "@mui/material/Grid";
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardHeader from '@mui/material/CardHeader';
import TextField from '@mui/material/TextField';
import Collapse from '@mui/material/Collapse';
import { TransitionGroup } from 'react-transition-group';

interface ColourMappingProps {
	model : SurfaceCRN
	colour_map : Colour_Map
	refreshColour : () => void
	addColour : () => void
	deleteColour : (c : Colour) => void
}

export default class ColourMappingComponent extends React.Component<ColourMappingProps, {}> {

	render() {
		return <Grid item xs={12} sm={4}>
			<Card>
				<CardHeader title="Colour Mapping" />
				<Grid container item sx={{"overflow-y" : "auto", "max-height" : "20rem"}}>
					<TransitionGroup>
						{[...this.props.colour_map.colours.values()].map((v, i) =>
							<Collapse>
								<ColourRowComponent colour={v} onChange={this.props.refreshColour} deleteColour={this.props.deleteColour}/>
							</Collapse>
						)}
					</TransitionGroup>
				</Grid>
				<CardActions>
					<Button variant="outlined" onClick={this.props.addColour.bind(this)}> Add Colour </Button>
				</CardActions>
			</Card>
		</Grid>;
	}
}

interface ColourRowState {
	colour : string
	isOpen : boolean
	species : Set<Species_Matcher>
	name : string
	showList : boolean
}

interface ColourRowProps {
	colour : Colour
	onChange : () => void
	deleteColour : (c : Colour) => void
}

class ColourRowComponent extends React.Component<ColourRowProps,ColourRowState> {
	pickerRef : HTMLDivElement | null = null;
	mouseDownInElement : boolean = false;

	constructor(p : ColourRowProps) {
		super(p);
		this.state = {colour : p.colour.hex(), isOpen : false, species : p.colour.species, name: p.colour.name, showList : false};

		this.handleClickOutside = this.handleClickOutside.bind(this);
	}

	handleClickOutside(event : MouseEvent) {
		// TODO:  fix click on swatch to close picker
		if (!this.mouseDownInElement && this.pickerRef && !this.pickerRef.contains(event.target as Node)) {
			this.setState({isOpen : false});
		}
	}

	handleDownClick(event : MouseEvent) {
		this.mouseDownInElement = (!this.pickerRef || this.pickerRef.contains(event.target as Node));
	}

	componentDidMount() {
		document.addEventListener('mousedown', this.handleDownClick.bind(this));
		document.addEventListener('mouseup', this.handleClickOutside.bind(this));
	}

	componentWillUnmount() {
		document.removeEventListener('mousedown', this.handleDownClick);
		document.removeEventListener('mouseup', this.handleClickOutside);
	}

	render() {
		// TODO: disallow invalid chars in name
		// TODO: make swatch more integrated (background colour of text? left tab thing)
		return <Grid item xs={12}>
			<div className="picker">
				<div
					className="swatch"
					style={{ backgroundColor: this.props.colour.hex() }}
					onClick={() => !this.state.isOpen && this.setState({isOpen : !this.state.isOpen})}
				/>
				<TextField variant="filled" fullWidth margin="none" label="Name" value={this.state.name} onChange={(e) => {let s = e.currentTarget.value; this.setState({name : s}); this.props.colour.name = s}} />
				<IconButton onClick={_ => this.setState({showList : !this.state.showList})}>
					{this.state.showList ? <ArrowDropDownCircleTwoToneIcon /> : <ArrowDropDownCircleOutlinedIcon />}
				</IconButton>
				<IconButton onClick={_ => this.props.deleteColour(this.props.colour)}>
					<DeleteIcon />
				</IconButton>
			</div>
			{this.state.isOpen && (
				<div className="popover" ref={(elem) => this.pickerRef = elem} >
					<HexColorPicker color={this.props.colour.hex()} onChange={(s) => {this.setState({colour : s}); this.updateColour(s)}}/>
				</div>
			)}
			<TransitionGroup>
				{this.state.showList &&
					<Collapse>
						<TransitionGroup>
							{[...this.state.species.values()].map((a : Species_Matcher) =>
								<Collapse>
									<TextField value={a.original_string} onChange={this.updateSpecies(a).bind(this)} inputProps={{style: {"padding" : "5px"}}}/>
									<IconButton onClick={() => this.deleteMatcher(a)}> <DeleteIcon /> </IconButton>
								</Collapse>
							)}
						</TransitionGroup>
						<Button variant="outlined" onClick = {this.addMatcher.bind(this)}> Add Species </Button>
					</Collapse>
				}
			</TransitionGroup>
		</Grid>;
	}

	updateColour(s : string) {
		this.props.colour.update_colour(Colour.hex2rgb(s));
		this.props.onChange();
	}

	updateSpecies(a : Species_Matcher) {
		return (e : React.ChangeEvent<HTMLInputElement>) => {
			a.update_matched(e.target.value);
			this.setState({species : this.props.colour.species});
			this.props.onChange();
		}
	}

	addMatcher() {
		this.props.colour.add_matcher("");
		this.setState({species : this.props.colour.species});
	}
	deleteMatcher(m : Species_Matcher) {
		this.props.colour.delete_matcher(m);
		this.setState({species : this.props.colour.species});
	}
}
