"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const fs = __importStar(require("fs"));
function tree_generator(source_dirpath, dist_dirpath, values, nestlevel) {
    try {
        fs.readdirSync(source_dirpath).forEach(file => {
            //console.log(" ".repeat(nestlevel*3) + file + " " + fs.statSync(source_dirpath + '/'+file).isDirectory());
            if (fs.statSync(source_dirpath + '/' + file).isDirectory()) {
                tree_generator(source_dirpath + '/' + file, dist_dirpath + '/' + file, values, ++nestlevel);
            }
            else {
                console.log('source:  ' + source_dirpath + '/' + file);
                console.log('dist  :  ' + dist_dirpath + '/' + file);
            }
        });
        /*
             let source = fs.readFileSync(source_filepath)
             //console.log(source.toString());
             let template = handlebars.compile(source.toString());
             let dist = template(values);
             fs.outputFileSync(dist_filepath, dist)
        */
    }
    catch (error) {
        console.log(chalk_1.default.red(`failed to read ${error}`));
        return null;
    }
}
exports.default = tree_generator;
//# sourceMappingURL=tree_generator.js.map