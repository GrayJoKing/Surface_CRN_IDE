
import Species_Matcher from './Species_Matcher';

export default class Colour {
	red:number = 0;
	green:number = 0;
	blue:number = 0;

	species:Species_Matcher[] = [];
	name:string = "";

	static white = new Colour({red:256,green:256,blue:256});

	public constructor(init?:Partial<Colour>) {
		Object.assign(this, init);
	}

	public rgb() : [number,number,number] {
		return [this.red,this.green,this.blue];
	}
}