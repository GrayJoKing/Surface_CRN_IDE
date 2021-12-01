
import Species_Matcher from './Species_Matcher';
import Transition_Rule from './Transition_Rule';
import Colour from './Colour';
import Surface_CRN from './Surface_CRN';

function parse_rule(line:string): Transition_Rule|false {
	
	if ((line.match(/->/g)||[]).length != 1) return false;
	
	let rate = 1;
	line = line.replace(/\((\d*(?:\.\d+)?)\)/, (_,x)=>{rate = +x; return ''});

	let [start, end] = line.split('->').map(a=>a.split('+').map(b=>new Species_Matcher(b.trim())));		// Note change how transition rules are formed

	//TODO: add more conditions (and error messages?)
	if (start.length != end.length || start.length > 2 || start.length == 0) return false;

	return new Transition_Rule({reactants: start, products: end, rate: rate, is_mono: start.length==1});
}

function parse_option(line:string):string[]|false {

	if ((line.match(/=/g)||[]).length != 1) return false;
	
	return line.split('=').map(a=>a.trim());
}

function parse_colour(line : string) : Colour | false {

	let vars : RegExpMatchArray|null = line.match(/^(?:\{([^}]+)\})? *((?: *[^,: ]+,? *?)+) *: *\((\d+) *, *(\d+) *, *(\d+)\)$/);
	
	if (vars == null) return false;
	
	var sp : Species_Matcher[] = vars[2].split(/,\s*|\s+/).map(a => new Species_Matcher(a.trim()))
	
	return new Colour({name: vars[1]||vars[2], species: new Set<Species_Matcher>(sp), red: +vars[3], green: +vars[4], blue: +vars[5]});
}

function parse_line(line:string, program:Surface_CRN): boolean {
	
	var rule = parse_rule(line);
	if (rule !== false) {
		program.rules.push(rule)
		return true;
	}
	
	var name_colour = parse_colour(line);
	if (name_colour !== false) {
		program.colour_map.add(name_colour);
		return true;
	}
	
	var option = parse_option(line);
	if (option !== false) {
		let [key,val] = option;
		program.set_option(key, val);
		return true;
	}
	
	return false;
}

function parse_init_state(line : string) : string[] {
	// TODO: add more error checking
	return line.split(/\s+|,/);
}


export function parse_code(data:string[]) : Surface_CRN {
	let init_state_section:boolean = false;

	let program = new Surface_CRN();

	for (let line of data) {
		line = line.trim().replace(/#.*/,"");
		if (line == "") continue;
		
		if (!init_state_section) {
			if (line == "!START_INIT_STATE") {
				init_state_section = true;
				continue;
			}
			parse_line(line, program)
		} else {
			if (line == "!END_INIT_STATE") {
				init_state_section = false;
				continue;
			}
			let val : string[] = parse_init_state(line);
			program.initial_state.push(val);
		}
	}
	
	return program;
}

// Import project as a list of files
// TODO: change false to list of warnings
export async function parse_import_files(input_files: File[]):Promise<Surface_CRN|false> {
	
	if (!input_files) {
		//show error
		console.log("No input files")
		return false;
	}
	
	class Manifest_File {
		data: string[] = [];
		imported: boolean = false;
	}
	
	let manifest_maps = new Map<string, Manifest_File>(); ;
	
	for (let file of input_files) {
		var m = new Manifest_File();
		m.data = (await file.text()).split("\n").map(a => a.trim().replace(/#.*/,''))
		manifest_maps.set(file.name, m)
	}
	
	for (let [key, m] of manifest_maps) {
		for (let s of m.data) {
			if (s.match(/^!INCLUDE /)) {
				//TODO: replace includes
			}
		}
	}
	
	let lines:string[] = [];
	
	for (let [_, m] of manifest_maps) {
		if (!m.imported) lines.push(...m.data);
	}
	
	return parse_code(lines);
}