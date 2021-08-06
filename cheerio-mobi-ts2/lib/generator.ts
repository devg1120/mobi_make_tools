import  chalk from 'chalk';
import handlebars from 'handlebars'
import * as fs from 'fs-extra'

export default function generator(source_filepath: string, 
                                  dist_filepath: string,
                                  values: any,
                                  helpers: any
                                 ) {

   try {

     let source = fs.readFileSync(source_filepath)
     //console.log(source.toString());

     for (let key in helpers) {
       let value = helpers[key];
       // Use `key` and `value`
       console.log('helpersRegistry: ' + key)
       handlebars.registerHelper(key, value)
     }
/*
     // regist custom helper 1
     handlebars.registerHelper('fullName', function(person) {
       return person.firstname + " " + person.lastname;
     });

     // regist custom helper 2
     handlebars.registerHelper('list', function(items, options) {
       var out = "<ul>\n";
       for(var i=0, l=items.length; i<l; i++) {
         out = out + "<li>" + options.fn(items[i]) + "</li>\n";
       }
       return out + "</ul>\n";
     });
*/

     let template = handlebars.compile(source.toString());
     let dist = template(values);
     fs.outputFileSync(dist_filepath, dist)

   } catch(error) {
     console.log(chalk.red(`failed to read ${error}`))
     return null;
   }
}
