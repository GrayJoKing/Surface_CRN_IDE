
import Species_Matcher from './Species_Matcher';
import Transition_Rule from './Transition_Rule';
import Colour_Map from './Colour_Map';
import Colour from './Colour';
import {parse_import_files, parse_code} from './Parser';

interface Surface_CRN_State {
	current_state : string[][],
	rules : Transition_Rule[],
	colour_map : Colour_Map,
	options : Map<string, string>,
	grid_type : 'square'|'hex'
}

export default class Surface_CRN {
	current_state : string[][] = [];
	rules : Transition_Rule[] = [];
	colour_map : Colour_Map = new Colour_Map();
	options : Map<string, string> = new Map();
	grid_type : 'square'|'hex' = 'square';
	
	static parser = {parse_import_files, parse_code};
	
	constructor(p : Partial<Surface_CRN_State> = {}) {
		Object.assign(this, p);
	}
	
}

export {Species_Matcher, Transition_Rule, Colour_Map, Colour}