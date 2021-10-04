

export default class Species {
	original_string : string;
	matcher:string;
	
	public constructor(init : string) {
		this.original_string = init;
		
		// Convert init to regex
		
		// Throw error if there is a backslash followed by something other than a number or a bracketed number
		if (init.match(/\\(\d|\(\d+\))/) !== null) throw Error();
		// Square brackets must contain only \w
		if (init.match(/\[\w+[^\]\w]/) !== null) throw Error();
		
		// Todo: handle {}
		
		init = init.replace(/\\\((\d+)\)/g, "(?:\\$1)");
		
		this.matcher = init;
	}
	
	public includes(s:Species) : boolean {
		if (!s.is_pure) return false;
		
		return (new RegExp(this.matcher)).exec(s.original_string) !== null;
	}
	
	public is_pure() {
		return this.original_string.match(/^\w+$/) === null;
	}
}