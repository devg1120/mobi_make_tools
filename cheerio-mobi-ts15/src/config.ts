import  chalk from 'chalk';
import * as yaml from 'js-yaml';
//import * as fs from 'fs-extra';
import * as fs from 'fs';


export default function configload(filepath: string) {

   try {
     let buffer = fs.readFileSync(filepath)
     //console.log(buffer)
     var doc = yaml.safeLoad(buffer);
     return doc;

   } catch(error) {
     console.log(chalk.red(`failed to read ${error}`))
     return null;
   }

}
