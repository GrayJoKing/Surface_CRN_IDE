
import Species_Matcher from './Species_Matcher';

export default class Transition_Rule {
	is_mono:boolean = true;
	reactants:Species_Matcher[] = [];
	products:Species_Matcher[] = [];
	rate:number = 1;
	public constructor(init?:Partial<Transition_Rule>) {
		Object.assign(this, init);
	}
}