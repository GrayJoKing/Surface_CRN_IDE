"use strict";
// TODO: Move to npm package
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SCRN_Colour = exports.SCRN_Colour_Map = exports.SCRN_Transition_Rule = exports.SCRN_Species = void 0;
const Species_1 = __importDefault(require("./Species"));
exports.SCRN_Species = Species_1.default;
const Transition_Rule_1 = __importDefault(require("./Transition_Rule"));
exports.SCRN_Transition_Rule = Transition_Rule_1.default;
const Colour_Map_1 = __importDefault(require("./Colour_Map"));
exports.SCRN_Colour_Map = Colour_Map_1.default;
const Colour_1 = __importDefault(require("./Colour"));
exports.SCRN_Colour = Colour_1.default;
const Parser_1 = require("./Parser");
class Surface_CRN {
    constructor() {
        this.initial_state = [];
        this.rules = [];
        this.colour_map = new Colour_Map_1.default();
        this.options = new Map();
    }
}
exports.default = Surface_CRN;
Surface_CRN.parser = { parse_import_files: Parser_1.parse_import_files, parse_code: Parser_1.parse_code };
