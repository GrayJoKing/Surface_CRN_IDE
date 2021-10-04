
import Colour from './Colour';
import Species from './Species';

export default class Colour_Map extends Map<string, Colour> {
	public constructor(init?:Partial<Colour_Map>) {
		super();
		Object.assign(this, init);
	}
	
	public find_colour(s : Species) : Colour|null {
		for (let [_, c] of this) {
			if (c.species.some((s1 : Species) => s1.includes(s))) {
				return c;
			}
		}
		return null;
	}
}