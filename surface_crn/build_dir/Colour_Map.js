"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Colour_Map {
    constructor(init) {
        this.colours = new Set();
        this.example_colours = ['#ffffff', '#000000', '#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#42d4f4', '#f032e6', '#bfef45', '#fabed4', '#469990', '#dcbeff', '#9A6324', '#fffac8', '#800000', '#aaffc3', '#808000', '#ffd8b1', '#000075', '#a9a9a9'];
        this.temp_colours = new Map();
        if (init)
            this.colours = init;
    }
    find_colour(s) {
        for (let c of this.colours) {
            if ([...c.species.values()].some((s1) => s1.includes(s))) {
                return c;
            }
        }
        let b = this.temp_colours.get(s);
        return b === undefined ? null : b;
    }
    export() {
        return [...this.colours.values()].map(c => '{' + c.name + '} ' + [...c.species.values()].map(s => s.toString()).join(' ') + ' : (' + c.rgb().join(',') + ')');
    }
    new_colour() {
        let c = this.example_colours.find((a) => {
            if ([...this.temp_colours.values(), ...this.colours.values()].find((c) => c.hex() === a) !== undefined)
                return false;
            return true;
        });
        if (c === undefined) {
            return "#000000";
        }
        else {
            return c;
        }
    }
    add(c) {
        this.colours.add(c);
    }
    delete(c) {
        this.colours.delete(c);
    }
    add_temp(s, c) {
        this.temp_colours.set(s, c);
    }
    clear_temp() {
        this.temp_colours.clear();
    }
}
exports.default = Colour_Map;
