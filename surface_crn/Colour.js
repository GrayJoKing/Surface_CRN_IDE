"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Species_Matcher_1 = __importDefault(require("./Species_Matcher"));
class Colour {
    constructor(init) {
        this.red = 0;
        this.green = 0;
        this.blue = 0;
        this.species = new Set();
        this.name = "";
        if (typeof (init) === 'string') {
            init = Colour.hex2rgb(init);
        }
        this.update_colour(init);
    }
    static white() { return new Colour({ red: 256, green: 256, blue: 256 }); }
    rgb() {
        return [this.red, this.green, this.blue];
    }
    hex() {
        return '#' + this.rgb().map(a => ("0" + a.toString(16)).slice(-2)).join('');
    }
    update_colour(c) {
        Object.assign(this, c);
    }
    add_matcher(s) { this.species.add(new Species_Matcher_1.default(s)); }
    delete_matcher(m) { this.species.delete(m); }
    static hex2rgb(s) {
        s = s.replace(/^#/, '');
        let r = s.match(/^([A-Fa-f\d]{2})([A-Fa-f\d]{2})([A-Fa-f\d]{2})$/);
        if (r) {
            return { red: parseInt(r[1], 16), green: parseInt(r[2], 16), blue: parseInt(r[3], 16) };
        }
        else {
            // TODO: setup fail state
            return { red: 256, green: 256, blue: 256 };
        }
    }
}
exports.default = Colour;
