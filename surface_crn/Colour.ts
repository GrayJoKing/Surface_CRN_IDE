
import Species_Matcher from './Species_Matcher';

export default class Colour {
	red : number = 0;
	green : number = 0;
	blue : number = 0;

	species : Set<Species_Matcher> = new Set<Species_Matcher>();
	name : string = "";
	hexString : string = "";

	static white() {return new Colour({red:256,green:256,blue:256})}

	public constructor(init : Partial<Colour>|string) {
		if (typeof(init) === 'string') {
			init = Colour.hex2rgb(init);
		}
		this.update_colour(init);
	}

	public rgb() : [number,number,number] {
		return [this.red,this.green,this.blue];
	}
	public hex() : string {
		return this.hexString;
	}

	public update_colour(c : Partial<Colour>) {
		Object.assign(this, c);
		this.hexString = '#' + this.rgb().map(a => ("0"+a.toString(16)).slice(-2)).join('');
	}
	public add_matcher(s : string) {this.species.add(new Species_Matcher(s));}
	public delete_matcher(m : Species_Matcher) {this.species.delete(m);}

	static hex2rgb(s : string) : {red : number, green : number, blue : number} {
		s = s.replace(/^#/,'');
		let r = s.match(/^([A-Fa-f\d]{2})([A-Fa-f\d]{2})([A-Fa-f\d]{2})$/);

		if (r) {
			return {red : parseInt(r[1], 16), green : parseInt(r[2], 16), blue : parseInt(r[3], 16)};
		} else {
			// TODO: setup fail state
			return {red : 256, green : 256, blue : 256};
		}
	}
}
