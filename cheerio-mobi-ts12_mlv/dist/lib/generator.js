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
const handlebars_1 = __importDefault(require("handlebars"));
const fs = __importStar(require("fs-extra"));
function generator(source_filepath, dist_filepath, values, helpers) {
    try {
        let source = fs.readFileSync(source_filepath);
        //console.log(source.toString());
        for (let key in helpers) {
            let value = helpers[key];
            // Use `key` and `value`
            console.log('helpersRegistry: ' + key);
            handlebars_1.default.registerHelper(key, value);
        }
        /*
             // regist custom helper 1
             handlebars.registerHelper('fullName', function(person) {
               return person.firstname + " " + person.lastname;
             });
        
             // regist custom helper 2
             handlebars.registerHelper('list', function(items, options) {
               var out = "<ul>\n";
               for(var i=0, l=items.length; i<l; i++) {
                 out = out + "<li>" + options.fn(items[i]) + "</li>\n";
               }
               return out + "</ul>\n";
             });
        */
        let template = handlebars_1.default.compile(source.toString());
        let dist = template(values);
        fs.outputFileSync(dist_filepath, dist);
    }
    catch (error) {
        console.log(chalk_1.default.red(`failed to read ${error}`));
        return null;
    }
}
exports.default = generator;
//# sourceMappingURL=generator.js.map