// TODO: Move to npm package

import Species from './Species';
import Transition_Rule from './Transition_Rule';
import Colour_Map from './Colour_Map';
import Colour from './Colour';
import {parse_import_files, parse_code} from './Parser';


export default class Surface_CRN {
	initial_state : Species[][] = [];
	rules : Transition_Rule[] = [];
	colour_map : Colour_Map = new Colour_Map();
	options : Map<string, string> = new Map();
	grid_type : 'square'|'hex' = 'square';
	
	static parser = {parse_import_files, parse_code};
	
	constructor() {
	}
	
}

export {Species as SCRN_Species, Transition_Rule as SCRN_Transition_Rule, Colour_Map as SCRN_Colour_Map, Colour as SCRN_Colour}