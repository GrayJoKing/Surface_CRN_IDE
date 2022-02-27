import Custom_Regex_Decomposer from './Custom_Regex_Decomposer';

export default class Species_Matcher {
	original_string : string = "";
	matched : string[] = [];

	public constructor(init : string) {
		this.update_matched(init);
	}

	public includes(s : string) : boolean {
		return this.matched.includes(s);
	}

	public is_pure() {
		return this.original_string.match(/^\w+$/) === null;
	}

	public toString() {
		return this.original_string;
	}

	public update_matched(s : string) {
		this.original_string = s;
		this.matched = Custom_Regex_Decomposer.decompose(s);
	}
}
