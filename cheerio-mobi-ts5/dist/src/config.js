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
const yaml = __importStar(require("js-yaml"));
const fs = __importStar(require("fs-extra"));
function configload(filepath) {
    try {
        let buffer = fs.readFileSync(filepath);
        //console.log(buffer)
        var doc = yaml.safeLoad(buffer);
        return doc;
    }
    catch (error) {
        console.log(chalk_1.default.red(`failed to read ${error}`));
        return null;
    }
}
exports.default = configload;
//# sourceMappingURL=config.js.map