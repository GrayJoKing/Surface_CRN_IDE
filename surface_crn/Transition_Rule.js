"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Species_Matcher_1 = __importDefault(require("./Species_Matcher"));
class Transition_Rule {
    constructor(init) {
        this.is_mono = true;
        this.reactants = [];
        this.products = [];
        this.rate = 1;
        this.update(init);
    }
    toString() {
        return '(' + this.rate.toString() + ') ' + [this.reactants, this.products].map(x => x.map(a => a.toString()).join(' + ')).join(' -> ');
    }
    update(p) {
        // TODO: add error checking
        Object.assign(this, p);
        this.is_mono = this.reactants.length < 2 && this.products.length < 2;
    }
    static blankRule() {
        return new Transition_Rule({ is_mono: true, reactants: [new Species_Matcher_1.default('')], products: [new Species_Matcher_1.default('')] });
    }
    matches(x, y) {
        if (this.is_mono == (y !== undefined))
            return false;
        if (this.is_mono) {
            if (this.reactants[0].includes(x)) {
                return [this.products[0].original_string];
            }
        }
        else {
            if (this.reactants[0].includes(x) && this.reactants[1].includes(y)) {
                return [this.products[0].original_string, this.products[1].original_string];
            }
        }
        return false;
    }
}
exports.default = Transition_Rule;
