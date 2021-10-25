
export default class Species_Matcher {
	original_string : string = "";
	matcher : string = "";
	
	public constructor(init : string) {
		this.update_matcher(init)
	}
	
	public includes(s : string) : boolean {
		return (new RegExp(this.matcher)).exec(s) !== null;
	}
	
	public is_pure() {
		return this.original_string.match(/^\w+$/) === null;
	}
	
	public toString() {
		return this.original_string;
	}
	
	public update_matcher(s : string) {
		this.original_string = s;
		
		if (s.match(/\\(\d|\(\d+\))/) !== null) throw Error();
		
		// Todo: handle {} []
		
		s = s.replace(/\\\((\d+)\)/g, "(?:\\$1)");
		
		this.matcher = '^(?:' + s + ')$';
	}
}