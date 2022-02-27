"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const xregexp_1 = __importDefault(require("xregexp"));
class Custom_Regex_Decomposer {
    static decompose(init) {
        // Validate brackets are all balanced
        var brackets = [];
        for (var c of init) {
            if ("([{".includes(c)) {
                brackets.push(c);
            }
            else if (")]}".includes(c)) {
                if (!"() {} []".includes(brackets.pop() + c)) {
                    throw "Unbalanced brackets";
                }
            }
        }
        if (brackets.length !== 0)
            throw "Unbalanced brackets";
        return this.parse(init);
    }
    static parse(s, matches = 1, curly_group = NaN) {
        var r;
        if (s === "") {
            return [""];
        }
        else if (r = s.match(/^((?:\w|\\\d+|\\<\d+>))\?(.*)$/)) {
            return this.parse(r[2], matches, curly_group).map(x => [r[1] + x, x]).flat();
        }
        else if (r = s.match(/^((?:\w|\\\d+|\\<\d+>| \+ | \-> )+)(?!\?)(.*)$/)) {
            return this.parse(r[2], matches, curly_group).map(x => r[1] + x);
        }
        else if (s[0] === "{") {
            var t = xregexp_1.default.matchRecursive(s, "\\{", "\\}\\??", 'g', { valueNames: ['between', 'left', 'match', 'right'] });
            var rest = t.slice(3).map(x => x.value).join('');
            if (isNaN(curly_group)) {
                var i = 0;
                var b = t[1].value.match(/^\w+$/) ? t[1].value.split('').map(r => [r]) : t[1].value.split('|').map(x => this.parse(x, matches, i++));
                i = 0;
                return b.map(c => {
                    var posts = this.parse(rest, matches, i++);
                    var result = posts.map(x => c.map(r => r + x)).flat();
                    if (t[2]['value'] === "}?")
                        result = result.concat(posts);
                    return result;
                }).flat();
            }
            else {
                var branches = t[1].value.match(/^\w+$/) ? t[1].value.split('') : t[1].value.split('|').map(x => this.parse(x, matches, curly_group)).flat();
                if (curly_group > branches.length)
                    throw "Uneven_Curly_Groups";
                var posts = this.parse(rest, matches, curly_group);
                var result = posts.map(x => this.parse(branches[curly_group], matches, curly_group) + x);
                if (t[2]['value'] === "}?")
                    result = result.concat(posts);
                return result;
            }
        }
        else if (s[0] === "[") {
            var t = xregexp_1.default.matchRecursive(s, "\\[", "\\]\\??", 'g', { valueNames: ['between', 'left', 'match', 'right'] });
            var branches = t[1].value.match(/^\w+$/) ? t[1].value.split('') : t[1].value.split('|').map(x => this.parse(x, matches, curly_group)).flat();
            if (t[2]['value'] === "]?")
                branches.push("");
            return this.parse(t.slice(3).map(x => x.value).join(''), matches, curly_group).map(x => branches.map(z => z + x)).flat();
        }
        else if (s[0] === "(") {
            // TODO: Handle nested brackets properly
            var t = xregexp_1.default.matchRecursive(s, "\\(", "\\)\\??", 'g', { valueNames: ['between', 'left', 'match', 'right'] });
            var branches = t[1].value.match(/^\w+$/) ? t[1].value.split('') : t[1].value.split('|').map(x => this.parse(x, matches, curly_group)).flat();
            if (t[2]['value'] === ")?")
                branches.push("");
            return this.parse(t.slice(3).map(x => x.value).join(''), matches + 1, curly_group).map(x => branches.map(z => z + x.replace(new RegExp("\\\\" + matches + "|\\\\<" + matches + ">", 'g'), z))).flat();
        }
        else {
            throw "Unknown Character " + s[0];
        }
    }
}
exports.default = Custom_Regex_Decomposer;
