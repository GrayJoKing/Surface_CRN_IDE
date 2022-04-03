
import Colour from './Colour';
import Species_Matcher from './Species_Matcher';

export default class Colour_Map {
	colours : Set<Colour> = new Set<Colour>();

	public constructor(init ?: Set<Colour>) {
		if (init) this.colours = init;
	}

	public equals(c : Colour_Map) : boolean {
		return !!([...c.colours].filter(a => !this.colours.has(a)) || [...this.colours].filter(a => !c.colours.has(a)));
	}

	cache : Map<string, Colour> = new Map();
	public find_colour(s : string) : Colour | null {
		let r = this.cache.get(s);
		if (r === undefined) {
			for (let c of this.colours) {
				if ([...c.species.values()].some((s1 : Species_Matcher) => s1.includes(s))) {
					r = c;
					break;
				}
			}
			if (r === undefined) {
				r = this.temp_colours.get(s);
				if (r === undefined) {
					r = this.new_colour();
					if (r === undefined) r = new Colour("#FFFFFF");
					this.add_temp(s, r);
					this.cache.set(s, r);
				}
			}
		}
		return r;
	}

	public export() {
		return [...this.colours.values()].map(c => '{' + c.name + '} ' + [...c.species.values()].map(s => s.toString()).join(' ') + ' : (' + c.rgb().join(',') + ')');
	}

	example_colours : Colour[] = ['#ffffff', '#000000', '#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#42d4f4', '#f032e6', '#bfef45', '#fabed4', '#469990', '#dcbeff', '#9A6324', '#fffac8', '#800000', '#aaffc3', '#808000', '#ffd8b1', '#000075', '#a9a9a9'].map(c=>new Colour(c));

	temp_colours : Map<string, Colour> = new Map<string, Colour>();

	public new_colour() : Colour {
		this.cache.clear();
		let c = this.example_colours.find((a : Colour) => {
			if ([...this.temp_colours.values(), ...this.colours.values()].find((c : Colour) => c.hex() === a.hex()) !== undefined) return false;
			return true;
		});
		if (c === undefined) {
			return new Colour("#000000");
		} else {
			return c;
		}
	}

	public add(c : Colour) {
		this.cache.clear();
		this.colours.add(c);
	}
	public delete(c : Colour) {
		this.cache.clear();
		this.colours.delete(c);
	}

	public add_temp(s : string, c : Colour) {
		this.cache.clear();
		this.temp_colours.set(s, c);
	}
	public clear_temp() {
		this.cache.clear();
		this.temp_colours.clear();
	}
}
