import  chalk from 'chalk';
import handlebars from 'handlebars'
import * as fse from 'fs-extra'
import * as fs from 'fs'

export default function tree_generator(source_dirpath: string, 
                                  dist_dirpath: string,
                                  values: any, nestlevel: number) {

   try {

     fs.readdirSync(source_dirpath).forEach(file => {
       //console.log(" ".repeat(nestlevel*3) + file + " " + fs.statSync(source_dirpath + '/'+file).isDirectory());
       if (fs.statSync(source_dirpath + '/'+file).isDirectory()){

        tree_generator(source_dirpath + '/'+file, 
                       dist_dirpath + '/'+file,
                       values, 
                       ++nestlevel)

       } else {
         console.log('source:  ' +source_dirpath + '/' + file);
         console.log('dist  :  ' +dist_dirpath + '/' + file);

       }
     });

/*
     let source = fs.readFileSync(source_filepath)
     //console.log(source.toString());
     let template = handlebars.compile(source.toString());
     let dist = template(values);
     fs.outputFileSync(dist_filepath, dist)
*/
   } catch(error) {
     console.log(chalk.red(`failed to read ${error}`))
     return null;
   }
}
