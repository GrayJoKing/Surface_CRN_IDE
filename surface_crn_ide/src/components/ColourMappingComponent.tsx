import React from 'react';
import SurfaceCRN, {Colour_Map, Colour, Species_Matcher} from 'surface_crn';
import { HexColorPicker } from "react-colorful";
import { FaAngleRight, FaTrash } from "react-icons/fa";

interface ColourMappingProps {
	model : SurfaceCRN
	refreshColour : () => void
	addColour : () => void
	deleteColour : (c : Colour) => void
}

export default class ColourMappingComponent extends React.Component<ColourMappingProps, {colours : Set<Colour>}> {
	
	constructor(props : ColourMappingProps) {
		super(props);
		this.state = {colours : this.props.model.colour_map.colours};
	}
	
	render() {
		return <div className="grid panel colour_panel">
			<h3> Colour Mapping </h3>
			
			<div id="colour_container">
				{[...this.state.colours.values()].map(v =>
					<ColourRowComponent colour={v} key={v.name} onChange={this.props.refreshColour}/>
				)}
				<div onClick={this.props.addColour.bind(this)} style={{cursor: "pointer"}}> Add Colour </div>
			</div>
		</div>;
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
		return <div>
			<div className="picker">
				<div
					className="swatch"
					style={{ backgroundColor: this.props.colour.hex() }}
					onClick={() => !this.state.isOpen && this.setState({isOpen : !this.state.isOpen})}
				/>
				<input value={this.state.name} onChange={(e) => {let s = e.currentTarget.value; this.setState({name : s}); this.props.colour.name = s}} />
				<FaAngleRight size={25} style={{cursor : 'pointer'}} onClick={(_) => {this.setState({showList : !this.state.showList})}} />
			</div>
			{this.state.isOpen && (
				<div className="popover" ref={(elem) => this.pickerRef = elem} >
				<HexColorPicker color={this.props.colour.hex()} onChange={(s) => {this.setState({colour : s}); this.updateColour(s)}}/>
				</div>
			)}
			{this.state.showList && 
				<div className="flexBox">
					{[...this.state.species.values()].map((a : Species_Matcher) => <div> <input value={a.original_string} className="" onChange={this.updateSpecies(a).bind(this)}/> <FaTrash onClick={() => this.deleteMatcher(a)} /></div>)}
					<div style = {{cursor : "pointer"}} onClick = {this.addMatcher.bind(this)}> Add Species </div>
					<hr/>
				</div>
			}
		</div>;
	}
	
	updateColour(s : string) {
		this.props.colour.update_colour(Colour.hex2rgb(s));
		this.props.onChange();
	}
	
	updateSpecies(a : Species_Matcher) {
		return (e : React.ChangeEvent<HTMLInputElement>) => {
			a.update_matcher(e.target.value);
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