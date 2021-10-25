
import Colour from './Colour';
import Species_Matcher from './Species_Matcher';

export default class Colour_Map {
	colours : Set<Colour> = new Set<Colour>();
	
	public constructor(init ?: Set<Colour>) {
		if (init) this.colours = init;
	}

	public find_colour(s : string) : Colour | null {
		for (let c of this.colours) {
			if ([...c.species.values()].some((s1 : Species_Matcher) => s1.includes(s))) {
				return c;
			}
		}
		let b = this.temp_colours.get(s);
		return b === undefined ? null : b;
	}

	public export() {
		return [...this.colours.values()].map(c => '{' + c.name + '} ' + [...c.species.values()].map(s => s.toString()).join(' ') + ' : (' + c.rgb().join(',') + ')');
	}

	example_colours : string[] = ['#ffffff', '#000000', '#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#42d4f4', '#f032e6', '#bfef45', '#fabed4', '#469990', '#dcbeff', '#9A6324', '#fffac8', '#800000', '#aaffc3', '#808000', '#ffd8b1', '#000075', '#a9a9a9'];

	temp_colours : Map<string, Colour> = new Map<string, Colour>();

	public new_colour() : string {
		let c = this.example_colours.find((a : string) => {
			if ([...this.temp_colours.values(), ...this.colours.values()].find((c : Colour) => c.hex() === a) !== undefined) return false;
			return true;
		});
		if (c === undefined) {
			return "#000000";
		} else {
			return c;
		}
	}
	
	public add(c : Colour) {
		this.colours.add(c);
	}
	public delete(c : Colour) {
		this.colours.delete(c);
	}
	
	public add_temp(s : string, c : Colour) {
		this.temp_colours.set(s, c);
	}
	public clear_temp() {
		this.temp_colours.clear();
	}
}