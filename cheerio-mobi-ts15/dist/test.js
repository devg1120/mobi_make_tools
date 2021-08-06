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
function r(command) {
    let envCopy = {};
    for (let e in process.env)
        envCopy[e] = process.env[e];
    envCopy['DEBUG'] = '*';
    //envCopy['DEBUG'] = 'APP1'
    envCopy['DEBUG_COLORS'] = 1;
    child_process.execSync(command, {
        stdio: [process.stdin, process.stdout, process.stderr],
        env: envCopy
    });
}
let conf = '';
if (process.argv[2]) {
    conf = process.argv[2];
}
//  r('ls -l /');
r(`node dist/src/app.js wg5 init ${conf}`);
r('node dist/src/app.js wg5 gets');
r('node dist/src/app.js wg5 test');
//# sourceMappingURL=test.js.map