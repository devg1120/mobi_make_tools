"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const handlebars_1 = __importDefault(require("handlebars"));
function template(doc) {
    //console.log(JSON.stringify(doc, undefined,1));
    //console.log(doc );
    console.log('template !!!');
    let source = `* template sample
name: {{name}}
age: {{age}}
`;
    let template = handlebars_1.default.compile(source);
    let values = {
        name: "Satoshi Watanabe",
        age: 33
    };
    let output = template(values);
    console.log(output);
}
exports.default = template;
//# sourceMappingURL=template.js.map