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
/*
let r = child_process.execSync("ls -l");
console.log(r.toString());

let command = "ls -l";

child_process.exec(command, (error, stdout, stderr) => {
       if ( error instanceof Error) {
            //console.log(stdout);
            //console.error(error);
             console.log(C.red('**** Error'));
        } else {
            //console.log(stdout);
            console.log('... Success!');
    }
    }).stdout.pipe(process.stdout);;



  command = "ls -l /";
  child_process.execSync(command, {stdio: [process.stdin, process.stdout, process.stderr]});

  */
function r(command) {
    child_process.execSync(command, { stdio: [process.stdin, process.stdout, process.stderr] });
}
r('ls -l /');
r('node dist/src/app.js wg5 init');
r('node dist/src/app.js wg5 gets');
r('node dist/src/app.js wg5 build');
r('node dist/src/app.js wg5 conv');
r('node dist/src/app.js wg5 gene');
/*
node dist/src/app.js wg5 init
node dist/src/app.js wg5 gets
node dist/src/app.js wg5 build
node dist/src/app.js wg5 conv
node dist/src/app.js wg5 gene
*/
//# sourceMappingURL=run.js.map