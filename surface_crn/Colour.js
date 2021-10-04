"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Colour {
    constructor(init) {
        this.red = 0;
        this.green = 0;
        this.blue = 0;
        this.species = [];
        Object.assign(this, init);
    }
    rgb() {
        return [this.red, this.green, this.blue];
    }
}
exports.default = Colour;
