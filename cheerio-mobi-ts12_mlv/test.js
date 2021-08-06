"use strict";
exports.__esModule = true;
var child_process = require("child_process");
function r(command) {
    var envCopy = {};
    for (var e in process.env)
        envCopy[e] = process.env[e];
    envCopy['DEBUG'] = '*';
    //envCopy['DEBUG'] = 'APP1'
    envCopy['DEBUG_COLORS'] = 1;
    child_process.execSync(command, {
        stdio: [process.stdin, process.stdout, process.stderr],
        env: envCopy
    });
}
var conf = '';
if (process.argv[2]) {
    conf = process.argv[2];
}
//  r('ls -l /');
r("node dist/src/app.js wg5 init " + conf);
r('node dist/src/app.js wg5 gets');
r('node dist/src/app.js wg5 test');
