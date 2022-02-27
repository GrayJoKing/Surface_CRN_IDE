"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Custom_Regex_Decomposer_1 = __importDefault(require("./Custom_Regex_Decomposer"));
class Species_Matcher {
    constructor(init) {
        this.original_string = "";
        this.matched = [];
        this.update_matched(init);
    }
    includes(s) {
        return this.matched.includes(s);
    }
    is_pure() {
        return this.original_string.match(/^\w+$/) === null;
    }
    toString() {
        return this.original_string;
    }
    update_matched(s) {
        this.original_string = s;
        this.matched = Custom_Regex_Decomposer_1.default.decompose(s);
    }
}
exports.default = Species_Matcher;
