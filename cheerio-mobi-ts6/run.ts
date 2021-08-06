import * as child_process from "child_process";
import  C from 'chalk';

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

    child_process.execSync(command, 
     {stdio: [process.stdin, process.stdout, process.stderr]});

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
