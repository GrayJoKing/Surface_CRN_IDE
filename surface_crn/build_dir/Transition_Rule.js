"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Custom_Regex_Decomposer_1 = __importDefault(require("./Custom_Regex_Decomposer"));
class Transition_Rule {
    constructor(init) {
        this.is_mono = true;
        this.reactants = [];
        this.products = [];
        this.decomposed = [];
        this.rate = 1;
        this.update(init);
    }
    toString() {
        return '(' + this.rate.toString() + ') ' + [this.reactants, this.products].map(x => x.map(a => a.toString()).join(' + ')).join(' -> ');
    }
    update(p) {
        // TODO: add error checking
        Object.assign(this, p);
        if (this.reactants.length !== this.products.length)
            throw "Reactants and products are not equal length";
        this.is_mono = this.reactants.length < 2 && this.products.length < 2;
        this.decomposed = Custom_Regex_Decomposer_1.default.decompose(this.reactants.join(' + ') + " -> " + this.products.join(' + ')).map(a => a.split(/ \+ | \-> /)).filter(a => a.every(x => x !== ""));
    }
    static blankRule() {
        return new Transition_Rule({ is_mono: true, reactants: [''], products: [''] });
    }
    matches(x, y) {
        if (this.is_mono === (y !== undefined))
            return [];
        if (this.is_mono) {
            return this.decomposed.filter(a => a[0] === x).map(a => [a[1]]);
        }
        else {
            return this.decomposed.filter(a => a[0] === x && a[1] === y).map(a => [a[2], a[3]]);
        }
    }
}
exports.default = Transition_Rule;
