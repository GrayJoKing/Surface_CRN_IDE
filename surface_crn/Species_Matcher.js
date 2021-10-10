"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Species_Matcher {
    constructor(init) {
        this.original_string = init;
        if (init.match(/\\(\d|\(\d+\))/) !== null)
            throw Error();
        // Square brackets must contain only \w (WRONG, can contain same as normal() )
        //if (init.match(/\[\w+[^\]\w]/) !== null) throw Error();
        // Todo: handle {}
        init = init.replace(/\\\((\d+)\)/g, "(?:\\$1)");
        this.matcher = '^(?:' + init + ')$';
    }
    includes(s) {
        return (new RegExp(this.matcher)).exec(s) !== null;
    }
    is_pure() {
        return this.original_string.match(/^\w+$/) === null;
    }
}
exports.default = Species_Matcher;
