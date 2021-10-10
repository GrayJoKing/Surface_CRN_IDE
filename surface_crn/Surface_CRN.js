"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Colour = exports.Colour_Map = exports.Transition_Rule = exports.Species_Matcher = void 0;
const Species_Matcher_1 = __importDefault(require("./Species_Matcher"));
exports.Species_Matcher = Species_Matcher_1.default;
const Transition_Rule_1 = __importDefault(require("./Transition_Rule"));
exports.Transition_Rule = Transition_Rule_1.default;
const Colour_Map_1 = __importDefault(require("./Colour_Map"));
exports.Colour_Map = Colour_Map_1.default;
const Colour_1 = __importDefault(require("./Colour"));
exports.Colour = Colour_1.default;
const Parser_1 = require("./Parser");
class Surface_CRN {
    constructor(p = {}) {
        this.current_state = [];
        this.rules = [];
        this.colour_map = new Colour_Map_1.default();
        this.options = new Map();
        this.grid_type = 'square';
        Object.assign(this, p);
    }
}
exports.default = Surface_CRN;
Surface_CRN.parser = { parse_import_files: Parser_1.parse_import_files, parse_code: Parser_1.parse_code };
