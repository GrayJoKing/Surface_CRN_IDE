
export default class Species_Matcher {
	original_string : string;
	matcher : string;
	
	public constructor(init : string) {
		this.original_string = init;
		
		if (init.match(/\\(\d|\(\d+\))/) !== null) throw Error();
		// Square brackets must contain only \w (WRONG, can contain same as normal() )
		//if (init.match(/\[\w+[^\]\w]/) !== null) throw Error();
		// Todo: handle {}
		
		init = init.replace(/\\\((\d+)\)/g, "(?:\\$1)");
		
		this.matcher = '^(?:' + init + ')$';
	}
	
	public includes(s : string) : boolean {
		return (new RegExp(this.matcher)).exec(s) !== null;
	}
	
	public is_pure() {
		return this.original_string.match(/^\w+$/) === null;
	}
}