//import  chalk from 'chalk';
import  C from 'chalk';
import client from 'cheerio-httpcli'

//import * as fs from 'fs-extra'
import fs from 'fs'
import path  from 'path'

export default function webget3(source_filepath: string, 
                                  dist_filepath: string,
                                  values: any
                                 ) {

   try {

     console.log("webget3 kick!!!");
     //----------------------------------------
     // 画像保存フォルダ作成
     var imgdir = path.join(__dirname, 'img');
     if (! fs.existsSync(imgdir)) {
       fs.mkdirSync(imgdir);
     }
     
     // ダウンロードマネージャー設定
     client.download
     .on('ready', function (stream) {
       // ダウンロード完了時の処理(各ファイルごとに呼ばれる)
       var file = stream.url.pathname.match(/([^\/]+)$/)[1];
       var savepath = path.join(imgdir, file);
       stream.pipe(fs.createWriteStream(savepath));
       console.info(C.green('SUCCESS'), C.blue(stream.url.href) + ' => ' + C.yellow(savepath));
       console.info(C.magenta('STATE'), this.state);
     })
     .on('error', function (err:any) {
       // ダウンロード失敗時の処理(各ファイルごとに呼ばれる)
       console.error(C.red('ERROR'), err);
       console.info(C.magenta('STATE'), this.state);
     })
     .on('end', function () {
       // ダウンロードキューが空になった時の処理
       //console.info(C.green.bold('COMPLETE'), this.state);
       console.info(C.green('COMPLETE'), this.state);
     });
     
     
     // fetch start
     console.info(C.cyan('INFO'), 'いらすとやにアクセスします');
     client.fetch('https://www.irasutoya.com/')
     .then(function (result) {
       console.info(C.cyan('INFO'), '人気のイラストをダウンロードします');
       var $imgs = result.$('.popular-posts .item-thumbnail img');
       // png画像のみダウンロード
       $imgs.each(function () {
         if (/\.png$/.test(result.$(this).attr('src'))) {
           result.$(this).download();
         }
       });
     })
     .catch(function (err) {
       console.error(C.red('ERROR'), err);
     })
     .finally(function () {
       console.info(C.cyan('INFO'), 'スクレイピングが終了しました');
     });
     
     //----------------------------------------
   } catch(error) {
     //console.log(chalk.red(`failed to read ${error}`))
     console.log(C.red(`failed to read ${error}`))
     return null;
   }
}
