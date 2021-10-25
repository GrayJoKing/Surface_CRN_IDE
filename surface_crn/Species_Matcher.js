"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Species_Matcher {
    constructor(init) {
        this.original_string = "";
        this.matcher = "";
        this.update_matcher(init);
    }
    includes(s) {
        return (new RegExp(this.matcher)).exec(s) !== null;
    }
    is_pure() {
        return this.original_string.match(/^\w+$/) === null;
    }
    toString() {
        return this.original_string;
    }
    update_matcher(s) {
        this.original_string = s;
        if (s.match(/\\(\d|\(\d+\))/) !== null)
            throw Error();
        // Todo: handle {} []
        s = s.replace(/\\\((\d+)\)/g, "(?:\\$1)");
        this.matcher = '^(?:' + s + ')$';
    }
}
exports.default = Species_Matcher;
