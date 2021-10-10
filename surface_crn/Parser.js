"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parse_import_files = exports.parse_code = void 0;
const Species_Matcher_1 = __importDefault(require("./Species_Matcher"));
const Transition_Rule_1 = __importDefault(require("./Transition_Rule"));
const Colour_1 = __importDefault(require("./Colour"));
const Surface_CRN_1 = __importDefault(require("./Surface_CRN"));
function parse_rule(line) {
    if ((line.match(/->/g) || []).length != 1)
        return false;
    let rate = 1;
    line = line.replace(/\((\d+)\)/, (_, x) => { rate = +x; return ''; });
    let [start, end] = line.split('->').map(a => a.split('+').map(b => new Species_Matcher_1.default(b.trim()))); // Note change how transition rules are formed
    //TODO: add more conditions (and error messages?)
    if (start.length != end.length || start.length > 2 || start.length == 0)
        return false;
    return new Transition_Rule_1.default({ reactants: start, products: end, rate: rate, is_mono: start.length == 1 });
}
function parse_option(line) {
    if ((line.match(/=/g) || []).length != 1)
        return false;
    return line.split('=').map(a => a.trim());
}
function parse_colour(line) {
    let vars = line.match(/^(?:\{([^}]+)\})? *((?: *[^,: ]+,? *)+) *: *\((\d+) *, *(\d+) *, *(\d+)\)$/);
    if (vars == null)
        return false;
    var sp = vars[2].split(/,\s*|\s+/).map(a => new Species_Matcher_1.default(a.trim()));
    return [vars[1], new Colour_1.default({ name: vars[1], species: sp, red: +vars[3], green: +vars[4], blue: +vars[5] })];
}
function parse_line(line, program) {
    var rule = parse_rule(line);
    if (rule !== false) {
        program.rules.push(rule);
        return true;
    }
    var name_colour = parse_colour(line);
    if (name_colour !== false) {
        program.colour_map.set(...name_colour);
        return true;
    }
    var option = parse_option(line);
    if (option !== false) {
        let [val, key] = option;
        program.options.set(val, key);
        return true;
    }
    return false;
}
function parse_init_state(line) {
    // TODO: add more error checking
    return line.split(/\s+|,/);
}
function parse_code(data) {
    let init_state_section = false;
    let program = new Surface_CRN_1.default();
    for (let line of data) {
        line = line.trim().replace(/#.*/, "");
        if (line == "")
            continue;
        if (!init_state_section) {
            if (line == "!START_INIT_STATE") {
                init_state_section = true;
                continue;
            }
            parse_line(line, program);
        }
        else {
            if (line == "!END_INIT_STATE") {
                init_state_section = false;
                continue;
            }
            let val = parse_init_state(line);
            program.current_state.push(val);
        }
    }
    return program;
}
exports.parse_code = parse_code;
// Import project as a list of files
// TODO: change false to list of warnings
function parse_import_files(input_files) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!input_files) {
            //show error
            console.log("No input files");
            return false;
        }
        class Manifest_File {
            constructor() {
                this.data = [];
                this.imported = false;
            }
        }
        let manifest_maps = new Map();
        ;
        for (let file of input_files) {
            var m = new Manifest_File();
            m.data = (yield file.text()).split("\n").map(a => a.trim().replace(/#.*/, ''));
            manifest_maps.set(file.name, m);
        }
        for (let [key, m] of manifest_maps) {
            for (let s of m.data) {
                if (s.match(/^!INCLUDE /)) {
                    //TODO: replace includes
                }
            }
        }
        let lines = [];
        for (let [_, m] of manifest_maps) {
            if (!m.imported)
                lines.push(...m.data);
        }
        return parse_code(lines);
    });
}
exports.parse_import_files = parse_import_files;
