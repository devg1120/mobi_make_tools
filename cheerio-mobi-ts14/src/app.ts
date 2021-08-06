
import pckg from './../package.json'
import program from 'commander'
import handlebars from 'handlebars'
import configload from './config';
import fs from 'fs'
import sh from 'shelljs';
import  C from 'chalk';

import plugin from './../lib/plugin';
import template from './../lib/template';
import generator from './../lib/generator';
import tree_generator from './../lib/tree_generator';
import webget from './../lib/webget';
import webget2 from './../lib/webget2';
import webget3 from './../lib/webget3';
import webget4 from './../lib/webget4';
import webget5 from './../lib/webget5';

let doc = configload('test.yaml');

if (doc === null) {
   console.log('...');
   process.exit();
}

let helpers = {}

helpers['fullName'] = function(person) {
                       return person.firstname + " " + person.lastname;
                      }

helpers['list'] =   function(items, options) {
       var out = "<ul>\n";
       for(var i=0, l=items.length; i<l; i++) {
         out = out + "<li>" + options.fn(items[i]) + "</li>\n";
       }
       return out + "</ul>\n";
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

//console.log(doc);
//console.log(JSON.stringify(doc, undefined,1));

program.version(pckg.version, '-v, --version')
program.usage('<command> [notebook] [note]')

program
  .command('plugin')
  .alias('pl')
  .description('Plugin generate.')
  .action(() => {
    //let doc = configload('test.yaml');
    plugin(doc)
  })

program
  .command('template')
  .alias('tp')
  .description('Template opelation.')
  .action(() => {
    //let doc = configload('test.yaml');
    template(doc)
  })

program
  .command('generator')
  .alias('gen')
  .description('Generator opelation.')
  .action(() => {
        let values = {
            name : "Satoshi Watanabe",
            age  : 109,
            info : { 
                     ref : 'KOBE',
                     marry : true
                   },
            momoclo : [
                  {name : "Kanako Momota", color: "red"},
                  {name : "Ayaka Sasaki", color: "pink"},
                  {name : "Shiori Tamai", color: "yellow"},
                  {name : "Momoka Ariyasu", color: "green"},
                  {name : "Reni Takagi", color:"purple"},
              ],
            author    : true,
            firstName : 'syouichi',
            lastName  : 'nishigusa',
            namedic : {
                Kanako : "red",
                Ayaka :  "pink",
                Shiori : "yellow",
                Momoka : "green",
                Reni : "purple",
            },
            momoclo2 : [
                 {firstname : "Kanako", lastname : "Momota"},
                 {firstname : "Ayaka", lastname : "Sasaki"},
                 {firstname : "Shiori", lastname : "Tamai"},
                 {firstname : "Momoka", lastname : "Ariyasu"},
                 {firstname : "Reni", lastname : "Takagi"},
           ],
           color : {
                 "Kanako" : "red",
                 "Ayaka" : "pink",
                 "Shiori" : "yellow",
                 "Momoka" : "green",
                 "Reni" : "purple",
             },
           test  : {firstname : "Kanako", lastname : "Momota"},
           people: [
             {firstName: "Yehuda", lastName: "Katz"},
             {firstName: "Carl", lastName: "Lerche"},
             {firstName: "Alan", lastName: "Johnson"}
           ]
        };
    generator('test_in', './tmp/test_out',values, helpers)
  })

program
  .command('tree_generator')
  .alias('tgen')
  .description('Tree Generator opelation.')
  .action(() => {
        let values = {
            name : "Satoshi Watanabe",
            age : 100
        };
    tree_generator('template', '_output_',values, 0)
  })

program                                //cheerio + request based
  .command('webget')
  .alias('wg')
  .description('cheerio based web scraping.')
  .action(() => {
        let values = {
            url : "Satoshi Watanabe",
            age : 100
        };
    webget('_input_', '_output_',values)
  })

program                                 //cheerio-httpcli based
  .command('webget2')
  .alias('wg2')
  .description('cheerio based web scraping.')
  .action(() => {
        let values = {
            url : "Satoshi Watanabe",
            age : 100
        };
    webget2('_input_', '_output_',values)
  })


program                                 //cheerio-httpcli based content download
  .command('webget3')
  .alias('wg3')
  .description('cheerio based web scraping.')
  .action(() => {
        let values = {
            url : "Satoshi Watanabe",
            age : 100
        };
    webget3('_input_', '_output_',values)
  })

program                                 //cheerio-httpcli based content download
  .command('webget4')
  .alias('wg4')
  .description('cheerio based web scraping.')
  .action(() => {
        let values = {
            url : "Satoshi Watanabe",
            age : 100
        };
    webget4('_input_', '_output_',values)
  })

program  
.command('webget5 <subcmd> [configfile]')
  .alias('wg5') 
  .description('cheerio based web scraping.')
  .action((subcmd, configfile) => {  
        let values = { 
            url : "Satoshi Watanabe",
            age : 100  
        };  
	  /*
        if (configfile != null) {
            try {
              if (fs.existsSync(configfile)) {
                //file exists
              }
            } catch(err) {
              console.error("configfile not exist: ", configfile);
              return;
            }

            if (subcmd == "init") {
                 sh.cp('./config.yaml','/tmp');
                 sh.cp( configfile, './config.yaml');
    
            }
        }
       */

    if (subcmd == "init") {
        if (configfile != null) {
            if (fs.existsSync(configfile)) {
	      //file exists
                 sh.cp('./config.yaml','/tmp');
                 sh.cp( configfile, './config.yaml');
	     } else {
	           console.log(C.red("config.yarm not foubd: "+ configfile))
		    return
	     }

        } else {
              console.log(C.red("init must be config filename  "));
		return

	}
    }
    webget5(subcmd, '_output_',values) 
  })   

program.parse(process.argv)

if (process.argv.length === 2) {
  program.outputHelp()
}

