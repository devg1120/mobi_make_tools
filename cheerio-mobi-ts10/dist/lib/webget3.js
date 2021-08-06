"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//import  chalk from 'chalk';
const chalk_1 = __importDefault(require("chalk"));
const cheerio_httpcli_1 = __importDefault(require("cheerio-httpcli"));
//import * as fs from 'fs-extra'
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function webget3(source_filepath, dist_filepath, values) {
    try {
        console.log("webget3 kick!!!");
        //----------------------------------------
        // 画像保存フォルダ作成
        var imgdir = path_1.default.join(__dirname, 'img');
        if (!fs_1.default.existsSync(imgdir)) {
            fs_1.default.mkdirSync(imgdir);
        }
        // ダウンロードマネージャー設定
        cheerio_httpcli_1.default.download
            .on('ready', function (stream) {
            // ダウンロード完了時の処理(各ファイルごとに呼ばれる)
            var file = stream.url.pathname.match(/([^\/]+)$/)[1];
            var savepath = path_1.default.join(imgdir, file);
            stream.pipe(fs_1.default.createWriteStream(savepath));
            console.info(chalk_1.default.green('SUCCESS'), chalk_1.default.blue(stream.url.href) + ' => ' + chalk_1.default.yellow(savepath));
            console.info(chalk_1.default.magenta('STATE'), this.state);
        })
            .on('error', function (err) {
            // ダウンロード失敗時の処理(各ファイルごとに呼ばれる)
            console.error(chalk_1.default.red('ERROR'), err);
            console.info(chalk_1.default.magenta('STATE'), this.state);
        })
            .on('end', function () {
            // ダウンロードキューが空になった時の処理
            //console.info(C.green.bold('COMPLETE'), this.state);
            console.info(chalk_1.default.green('COMPLETE'), this.state);
        });
        // fetch start
        console.info(chalk_1.default.cyan('INFO'), 'いらすとやにアクセスします');
        cheerio_httpcli_1.default.fetch('https://www.irasutoya.com/')
            .then(function (result) {
            console.info(chalk_1.default.cyan('INFO'), '人気のイラストをダウンロードします');
            var $imgs = result.$('.popular-posts .item-thumbnail img');
            // png画像のみダウンロード
            $imgs.each(function () {
                if (/\.png$/.test(result.$(this).attr('src'))) {
                    result.$(this).download();
                }
            });
        })
            .catch(function (err) {
            console.error(chalk_1.default.red('ERROR'), err);
        })
            .finally(function () {
            console.info(chalk_1.default.cyan('INFO'), 'スクレイピングが終了しました');
        });
        //----------------------------------------
    }
    catch (error) {
        //console.log(chalk.red(`failed to read ${error}`))
        console.log(chalk_1.default.red(`failed to read ${error}`));
        return null;
    }
}
exports.default = webget3;
//# sourceMappingURL=webget3.js.map