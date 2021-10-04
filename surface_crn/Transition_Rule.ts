
import Species from './Species';

export default class Transition_Rule {
	is_mono:boolean = true;
	reactants:Species[] = [];
	products:Species[] = [];
	rate:number = 1;
	public constructor(init?:Partial<Transition_Rule>) {
		Object.assign(this, init);
	}
}