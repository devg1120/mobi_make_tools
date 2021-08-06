"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const package_json_1 = __importDefault(require("./../package.json"));
const commander_1 = __importDefault(require("commander"));
const config_1 = __importDefault(require("./config"));
const plugin_1 = __importDefault(require("./../lib/plugin"));
const template_1 = __importDefault(require("./../lib/template"));
const generator_1 = __importDefault(require("./../lib/generator"));
const tree_generator_1 = __importDefault(require("./../lib/tree_generator"));
const webget_1 = __importDefault(require("./../lib/webget"));
const webget2_1 = __importDefault(require("./../lib/webget2"));
const webget3_1 = __importDefault(require("./../lib/webget3"));
const webget4_1 = __importDefault(require("./../lib/webget4"));
const webget5_1 = __importDefault(require("./../lib/webget5"));
let doc = config_1.default('test.yaml');
if (doc === null) {
    console.log('...');
    process.exit();
}
let helpers = {};
helpers['fullName'] = function (person) {
    return person.firstname + " " + person.lastname;
};
helpers['list'] = function (items, options) {
    var out = "<ul>\n";
    for (var i = 0, l = items.length; i < l; i++) {
        out = out + "<li>" + options.fn(items[i]) + "</li>\n";
    }
    return out + "</ul>\n";
};
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
commander_1.default.version(package_json_1.default.version, '-v, --version');
commander_1.default.usage('<command> [notebook] [note]');
commander_1.default
    .command('plugin')
    .alias('pl')
    .description('Plugin generate.')
    .action(() => {
    //let doc = configload('test.yaml');
    plugin_1.default(doc);
});
commander_1.default
    .command('template')
    .alias('tp')
    .description('Template opelation.')
    .action(() => {
    //let doc = configload('test.yaml');
    template_1.default(doc);
});
commander_1.default
    .command('generator')
    .alias('gen')
    .description('Generator opelation.')
    .action(() => {
    let values = {
        name: "Satoshi Watanabe",
        age: 109,
        info: {
            ref: 'KOBE',
            marry: true
        },
        momoclo: [
            { name: "Kanako Momota", color: "red" },
            { name: "Ayaka Sasaki", color: "pink" },
            { name: "Shiori Tamai", color: "yellow" },
            { name: "Momoka Ariyasu", color: "green" },
            { name: "Reni Takagi", color: "purple" },
        ],
        author: true,
        firstName: 'syouichi',
        lastName: 'nishigusa',
        namedic: {
            Kanako: "red",
            Ayaka: "pink",
            Shiori: "yellow",
            Momoka: "green",
            Reni: "purple",
        },
        momoclo2: [
            { firstname: "Kanako", lastname: "Momota" },
            { firstname: "Ayaka", lastname: "Sasaki" },
            { firstname: "Shiori", lastname: "Tamai" },
            { firstname: "Momoka", lastname: "Ariyasu" },
            { firstname: "Reni", lastname: "Takagi" },
        ],
        color: {
            "Kanako": "red",
            "Ayaka": "pink",
            "Shiori": "yellow",
            "Momoka": "green",
            "Reni": "purple",
        },
        test: { firstname: "Kanako", lastname: "Momota" },
        people: [
            { firstName: "Yehuda", lastName: "Katz" },
            { firstName: "Carl", lastName: "Lerche" },
            { firstName: "Alan", lastName: "Johnson" }
        ]
    };
    generator_1.default('test_in', './tmp/test_out', values, helpers);
});
commander_1.default
    .command('tree_generator')
    .alias('tgen')
    .description('Tree Generator opelation.')
    .action(() => {
    let values = {
        name: "Satoshi Watanabe",
        age: 100
    };
    tree_generator_1.default('template', '_output_', values, 0);
});
commander_1.default //cheerio + request based
    .command('webget')
    .alias('wg')
    .description('cheerio based web scraping.')
    .action(() => {
    let values = {
        url: "Satoshi Watanabe",
        age: 100
    };
    webget_1.default('_input_', '_output_', values);
});
commander_1.default //cheerio-httpcli based
    .command('webget2')
    .alias('wg2')
    .description('cheerio based web scraping.')
    .action(() => {
    let values = {
        url: "Satoshi Watanabe",
        age: 100
    };
    webget2_1.default('_input_', '_output_', values);
});
commander_1.default //cheerio-httpcli based content download
    .command('webget3')
    .alias('wg3')
    .description('cheerio based web scraping.')
    .action(() => {
    let values = {
        url: "Satoshi Watanabe",
        age: 100
    };
    webget3_1.default('_input_', '_output_', values);
});
commander_1.default //cheerio-httpcli based content download
    .command('webget4')
    .alias('wg4')
    .description('cheerio based web scraping.')
    .action(() => {
    let values = {
        url: "Satoshi Watanabe",
        age: 100
    };
    webget4_1.default('_input_', '_output_', values);
});
commander_1.default
    .command('webget5 <subcmd>')
    .alias('wg5')
    .description('cheerio based web scraping.')
    .action((subcmd) => {
    let values = {
        url: "Satoshi Watanabe",
        age: 100
    };
    webget5_1.default(subcmd, '_output_', values);
});
commander_1.default.parse(process.argv);
if (process.argv.length === 2) {
    commander_1.default.outputHelp();
}
//# sourceMappingURL=app.js.map