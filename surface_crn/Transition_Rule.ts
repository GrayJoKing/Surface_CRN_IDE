import Custom_Regex_Decomposer from './Custom_Regex_Decomposer';

export default class Transition_Rule {
	is_mono : boolean = true;
	reactants : string[] = [];
	products : string[] = [];

	decomposed : string[][] = [];
	rate : number = 1;
	public constructor(init : Partial<Transition_Rule>) {
		this.update(init);
	}

	public toString() {
		return '('+this.rate.toString() +') ' + [this.reactants, this.products].map(x => x.map(a => a.toString()).join(' + ')).join(' -> ')
	}

	public update(p : Partial<Transition_Rule>) {
		// TODO: add error checking
		Object.assign(this, p);
		if (this.reactants.length !== this.products.length) throw "Reactants and products are not equal length";
		this.is_mono = this.reactants.length < 2 && this.products.length < 2;
		this.decomposed = Custom_Regex_Decomposer.decompose(this.reactants.join(' + ') + " -> " + this.products.join(' + ')).map(a => a.split(/ \+ | \-> /)).filter(a => a.every(x => x !== ""))
	}

	static blankRule() : Transition_Rule {
		return new Transition_Rule({is_mono : true, reactants : [''], products : ['']})
	}

	public matches(x : string, y ?: string) : string[][] {
		if (this.is_mono === (y !== undefined)) return [];

		if (this.is_mono) {
			return this.decomposed.filter(a => a[0] === x).map(a => [a[1]]);
		} else {
			return this.decomposed.filter(a => a[0] === x && a[1] === y).map(a => [a[2], a[3]]);
		}
	}
}
