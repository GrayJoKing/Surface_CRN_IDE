"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Species_Matcher {
    constructor(init) {
        this.original_string = "";
        this.matched = [];
        this.update_matched(init);
        this.original_string = init;
    }
    includes(s) {
        return s === this.original_string;
        //return this.matched.includes(s);
    }
    is_pure() {
        return this.original_string.match(/^\w+$/) === null;
    }
    toString() {
        return this.original_string;
    }
    update_matched(s) {
        this.matched = this.decompose_matcher(s);
    }
    decompose_matcher(s, matches = []) {
        var r;
        var x;
        if (r = s.match(/^(.*)\[[^[]+\](.*)$/)) {
            var rs = r[2].split(r[2].match('|') ? '|' : '');
            // Check count of ()s are same
            return rs.map(a => this.decompose_matcher(r[1] + a + r[2])).flat();
        }
        else if (x = s.matchAll(/\{[^}]+\}/g)) {
            // Check each contain same amount of ()s
            // Check all splits are the same size
            // map over each split and replace with each indexed
        }
        else if (r = s.match(/^(.*)\([^(]+\)(.*)$/)) {
            var rs = r[2].split('|');
            // Check count of ()s are same
            // Pass contained value onwards (or return it?)
            return rs.map(a => this.decompose_matcher(r[1] + a + r[2])).flat();
        }
        return [s];
    }
}
exports.default = Species_Matcher;
