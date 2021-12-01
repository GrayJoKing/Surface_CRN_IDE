
import Species_Matcher from './Species_Matcher';

export default class Transition_Rule {
	is_mono : boolean = true;
	reactants : Species_Matcher[] = [];
	products : Species_Matcher[] = [];
	
	decomposed : [string, string, string, string][] = [];
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
		this.is_mono = this.reactants.length < 2 && this.products.length < 2;
	}
	
	static blankRule() : Transition_Rule {
		return new Transition_Rule({is_mono : true, reactants : [new Species_Matcher('')], products : [new Species_Matcher('')]})
	}
	
	public matches(x : string, y ?: string) : false | string[] {
		if (this.is_mono === (y !== undefined)) return false;
		
		if (this.is_mono) {
			if (this.reactants[0].includes(x)) {
				return [this.products[0].original_string];
			}
		} else {
			if (this.reactants[0].includes(x) && this.reactants[1].includes(y!)) {
				return [this.products[0].original_string, this.products[1].original_string];
			}
		}
		
		return false;
	}
}