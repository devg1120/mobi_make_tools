"use strict";
exports.__esModule = true;
var child_process = require("child_process");
var fs = require("fs");
function r(command) {
    var envCopy = {};
    for (var e in process.env)
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
var conf = '';
var debug = false;
var test = false;
var get = false;
if (process.argv.length < 3) {
    console.log(" node [-d] [-t] ./config/####.yaml");
    process.exit(1);
}
for (var i = 0; i < process.argv.length; i++) {
    //console.log("argv[" + i + "] = " + process.argv[i]);
    if (process.argv[i] == "-t") {
        test = true;
    }
    else if (process.argv[i] == "-g") {
        get = true;
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
if (get) {
    r("node dist/src/app.js wg5 init " + conf);
    r('node dist/src/app.js wg5 gets');
    r('node dist/src/app.js wg5 build');
}
else if (test) {
    r("node dist/src/app.js wg5 init " + conf);
    r('node dist/src/app.js wg5 gets');
    //r('node dist/src/app.js wg5 build');
    //r('node dist/src/app.js wg5 conv');
    //r('node dist/src/app.js wg5 gene');
    r('node dist/src/app.js wg5 test');
}
else {
    r("node dist/src/app.js wg5 init " + conf);
    r('node dist/src/app.js wg5 gets');
    r('node dist/src/app.js wg5 build');
    r('node dist/src/app.js wg5 conv');
    r('node dist/src/app.js wg5 gene');
    r('node dist/src/app.js wg5 move');
}
