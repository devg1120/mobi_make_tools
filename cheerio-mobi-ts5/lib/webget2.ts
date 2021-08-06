import  chalk from 'chalk';
import client from 'cheerio-httpcli'

import * as fs from 'fs-extra'

export default function webget2(source_filepath: string, 
                                  dist_filepath: string,
                                  values: any
                                 ) {

   try {

     console.log("webget2 kick!!!");
/*
     client.fetch('https://www.tef.or.jp/mobile/tmg_closure.jsp', (err, $, res) => {
         const result = [];
         $('.normal_list').each(function (id, el) {
             const month = $(this).find('.normal_h2').text();
     
             $(this).find('li').each(function (id, el) {
                 result.push(month + $(this).text().replace(/\r?\n?/g, ''));
             });
         });
     
         console.log(result.join('\n'));
     });
*/

     let word = 'SLP KBIT';
     
     client.fetch('http://www.google.com/search', { q: word })
         .then((result) => {
             console.log(result.$('title').text());
             result.$('a').each(function (idx) {
                 let $h3text = result.$(this).find('h3').text();
                 let $url = result.$(this).attr('href');
                 if ($h3text.includes('slp-kbit')) {
                     console.log($h3text + '  '  + $url);
                 }
             });
         })
         .catch((err) => {
             console.log(err);
         })
         .finally(() => {
             console.log('終了');
         });



   } catch(error) {
     console.log(chalk.red(`failed to read ${error}`))
     return null;
   }
}
