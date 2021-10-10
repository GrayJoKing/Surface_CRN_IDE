"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Colour_Map extends Map {
    constructor(init) {
        super();
        Object.assign(this, init);
    }
    find_colour(s) {
        for (let [_, c] of this) {
            if (c.species.some((s1) => s1.includes(s))) {
                return c;
            }
        }
        return null;
    }
}
exports.default = Colour_Map;
