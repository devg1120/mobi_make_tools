"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const cheerio_httpcli_1 = __importDefault(require("cheerio-httpcli"));
function webget2(source_filepath, dist_filepath, values) {
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
        cheerio_httpcli_1.default.fetch('http://www.google.com/search', { q: word })
            .then((result) => {
            console.log(result.$('title').text());
            result.$('a').each(function (idx) {
                let $h3text = result.$(this).find('h3').text();
                let $url = result.$(this).attr('href');
                if ($h3text.includes('slp-kbit')) {
                    console.log($h3text + '  ' + $url);
                }
            });
        })
            .catch((err) => {
            console.log(err);
        })
            .finally(() => {
            console.log('終了');
        });
    }
    catch (error) {
        console.log(chalk_1.default.red(`failed to read ${error}`));
        return null;
    }
}
exports.default = webget2;
//# sourceMappingURL=webget2.js.map