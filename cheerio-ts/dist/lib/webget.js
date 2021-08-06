"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
//import handlebars from 'handlebars'
const cheerio_1 = __importDefault(require("cheerio"));
const request_1 = __importDefault(require("request"));
function webget(source_filepath, dist_filepath, values) {
    try {
        console.log("webget kick!!!");
        /*
             const $ = cheerio.load('<h2 class="title">Hello world</h2>')
             
             $('h2.title').text('Hello there!')
             $('h2').addClass('welcome')
             
             console.log($.html())
        */
        const url = 'https://eiga.com/now/all/rank/'; // 映画.comランキングページ
        const titles_arr = [];
        request_1.default(url, (e, response, body) => {
            if (e) {
                console.error(e);
            }
            try {
                const $ = cheerio_1.default.load(body); //bodyの読み込み
                $('h3', '.m_unit').each((i, elem) => {
                    titles_arr[i] = $(elem).text(); //配列にタイトルを挿入していく
                });
                console.log(titles_arr);
            }
            catch (e) {
                console.error(e);
            }
        });
    }
    catch (error) {
        console.log(chalk_1.default.red(`failed to read ${error}`));
        return null;
    }
}
exports.default = webget;
//# sourceMappingURL=webget.js.map