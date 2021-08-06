import * as child_process from "child_process";
import  C from 'chalk';



  function r(command) {
    let envCopy = {};
    for (let e in process.env) envCopy[e] = process.env[e];

    envCopy['DEBUG'] = '*'
    //envCopy['DEBUG'] = 'APP1'

    envCopy['DEBUG_COLORS'] = 1

    child_process.execSync(command, 
    {
     stdio: [process.stdin, process.stdout, process.stderr],
     env  : envCopy
    });

  }

  let conf = '';

  if ( process.argv[2]) {
   conf = process.argv[2]
  }

  //  r('ls -l /');
  r(`node dist/src/app.js wg5 init ${conf}`);
  r('node dist/src/app.js wg5 gets');
  r('node dist/src/app.js wg5 test');

