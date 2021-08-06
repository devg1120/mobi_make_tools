"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process = __importStar(require("child_process"));
const fs = __importStar(require("fs"));
function r(command) {
    let envCopy = {};
    for (let e in process.env)
        envCopy[e] = process.env[e];
    if (debug) {
        envCopy['DEBUG'] = '*';
        //envCopy['DEBUG'] = 'APP1'
    }
    if (test) {
        envCopy['DEBUG'] = 'test';
        envCopy['TEST'] = 'test';
    }
    child_process.execSync(command, {
        stdio: [process.stdin, process.stdout, process.stderr],
        env: envCopy
    });
}
let conf = '';
let debug = false;
let test = false;
if (process.argv.length < 3) {
    console.log(" node [-d] [-t] ./config/####.yaml");
    process.exit(1);
}
for (let i = 0; i < process.argv.length; i++) {
    //console.log("argv[" + i + "] = " + process.argv[i]);
    if (process.argv[i] == "-t") {
        test = true;
    }
    else if (process.argv[i] == "-d") {
        debug = true;
    }
    else if (process.argv[i].match(/config\.yaml$/)) {
        conf = process.argv[i];
    }
}
if (conf == '') {
    console.log("config.yaml  not assign!!!");
    process.exit(1);
}
if (fs.existsSync(conf)) {
    //file exists
}
else {
    console.log("config.yarm not foubd: " + conf);
    process.exit(1);
}
if (test) {
    r(`node dist/src/app.js wg5 init ${conf}`);
    r('node dist/src/app.js wg5 gets');
    //r('node dist/src/app.js wg5 build');
    //r('node dist/src/app.js wg5 conv');
    //r('node dist/src/app.js wg5 gene');
    r('node dist/src/app.js wg5 test');
}
else {
    r(`node dist/src/app.js wg5 init ${conf}`);
    r('node dist/src/app.js wg5 gets');
    r('node dist/src/app.js wg5 build');
    r('node dist/src/app.js wg5 conv');
    r('node dist/src/app.js wg5 gene');
    r('node dist/src/app.js wg5 move');
}
//# sourceMappingURL=run.js.map