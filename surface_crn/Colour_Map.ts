
import Colour from './Colour';
import Species_Matcher from './Species_Matcher';

export default class Colour_Map extends Map<string, Colour> {
	public constructor(init?:Partial<Colour_Map>) {
		super();
		Object.assign(this, init);
	}

	public find_colour(s : string) : Colour|null {
		for (let [_, c] of this) {
			if (c.species.some((s1 : Species_Matcher) => s1.includes(s))) {
				return c;
			}
		}
		return null;
	}
}