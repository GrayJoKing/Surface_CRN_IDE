
export default class Species_Matcher {
	original_string : string = "";
	matched : string[] = [];
	
	public constructor(init : string) {
		this.update_matched(init);
	}
	
	public includes(s : string) : boolean {
		return s === this.original_string;
		//return this.matched.includes(s);
	}
	
	public is_pure() {
		return this.original_string.match(/^\w+$/) === null;
	}
	
	public toString() {
		return this.original_string;
	}
	
	public update_matched(s : string) {
		this.original_string = s;
		this.matched = this.decompose_matcher(s);
	}
	
	public decompose_matcher(s : string, matches : string[] = []) : string[] {
		var r : RegExpMatchArray | null;
		var x : IterableIterator<RegExpMatchArray>;
		if (r = s.match(/^(.*)\[[^[]+\](.*)$/)) {
			var rs = r[2].split(r[2].match('|') ? '|' : '');
			// Check count of ()s are same
			return rs.map(a => this.decompose_matcher(r![1]+a+r![2])).flat();
		} else if (x = s.matchAll(/\{[^}]+\}/g)) {
			// Check each contain same amount of ()s
			// Check all splits are the same size
			// map over each split and replace with each indexed
			
		} else if (r = s.match(/^(.*)\([^(]+\)(.*)$/)) {
			var rs = r[2].split('|')
			// Check count of ()s are same
			// Pass contained value onwards (or return it?)
			return rs.map(a => this.decompose_matcher(r![1]+a+r![2])).flat();
		}
		return [s];
	}
}