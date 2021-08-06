import  chalk from 'chalk';
//import handlebars from 'handlebars'
import cheerio from 'cheerio'
import request from 'request'
import * as fs from 'fs-extra'

export default function webget(source_filepath: string, 
                                  dist_filepath: string,
                                  values: any
                                 ) {

   try {

     console.log("webget kick!!!");
/*
     const $ = cheerio.load('<h2 class="title">Hello world</h2>')
     
     $('h2.title').text('Hello there!')
     $('h2').addClass('welcome')
     
     console.log($.html())
*/

     const url = 'https://eiga.com/now/all/rank/' // 映画.comランキングページ
     const titles_arr = []
     
     request(url, (e, response, body) => {
         if (e) {
             console.error(e)
         }
         try {
             const $ = cheerio.load(body)              //bodyの読み込み
             $('h3', '.m_unit' ).each((i, elem) => {   //'m_unit'クラス内のh3タグ内要素に対して処理実行
                 titles_arr[i] = $(elem).text()        //配列にタイトルを挿入していく
             })
             console.log(titles_arr)
     
          } catch (e) {
              console.error(e)
          }
     })

   } catch(error) {
     console.log(chalk.red(`failed to read ${error}`))
     return null;
   }
}
