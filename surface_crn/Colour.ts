
import Species from './Species';

export default class Colour {
	red:number = 0;
	green:number = 0;
	blue:number = 0;
	
	species:Species[] = [];
	name:string = "";
	
	public constructor(init?:Partial<Colour>) {
		Object.assign(this, init);
	}
	
	public rgb() : number[] {
		return [this.red,this.green,this.blue];
	}
	
}