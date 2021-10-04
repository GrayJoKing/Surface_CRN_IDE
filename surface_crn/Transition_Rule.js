"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Transition_Rule {
    constructor(init) {
        this.is_mono = true;
        this.reactants = [];
        this.products = [];
        this.rate = 1;
        Object.assign(this, init);
    }
}
exports.default = Transition_Rule;
