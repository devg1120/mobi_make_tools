"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
//import  chalk from 'chalk';
const chalk_1 = __importDefault(require("chalk"));
const cheerio_httpcli_1 = __importDefault(require("cheerio-httpcli"));
const cheerio_1 = __importDefault(require("cheerio"));
//import * as fs from 'fs-extra'
const os_1 = __importDefault(require("os"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const js_yaml_1 = __importDefault(require("js-yaml"));
const http_1 = __importDefault(require("http"));
const process_1 = __importDefault(require("process"));
const child_process = __importStar(require("child_process"));
const shelljs_1 = __importDefault(require("shelljs"));
const handlebars_1 = __importDefault(require("handlebars"));
const dateformat_1 = __importDefault(require("dateformat"));
const js_beautify_1 = __importDefault(require("js-beautify"));
const debug_1 = __importDefault(require("debug"));
var top_dir = '';
var output_dir = '';
var images_save_subfolder = '';
var processed_images_save_subfolder = '';
var recipe_slug = '';
var base_url = '';
var index_url = '';
var kindle_css = '';
var STYLESHEET = '';
var config = '';
var _debug = false;
var _test = false;
var extract_sections_end = false;
const Da = debug_1.default('APPa');
const Db = debug_1.default('testb');
const WA = debug_1.default('WK:A');
const WB = debug_1.default('WK:B');
const _T = debug_1.default('test');
function webget5(subcmd, dist_filepath, values) {
    return __awaiter(this, void 0, void 0, function* () {
        const _D = debug_1.default('main');
        //console.log('+++ start kindle mobi genalater:' + subcmd)
        _D('subcmd: ' + subcmd);
        if (process_1.default.env.DEBUG) {
            _debug = true;
        }
        if (process_1.default.env.TEST) {
            _test = true;
        }
        var config_yaml = read('./config.yaml');
        if (config_yaml == '') {
            console.log(chalk_1.default.red('config.yaml is not read!!'));
            return;
        }
        try {
            config = js_yaml_1.default.safeLoad(config_yaml);
        }
        catch (err) {
            console.error('config.yaml load error!!');
            console.error(err['message']);
            return;
        }
        if (!config_check(config)) {
            console.log('config error....');
            return;
        }
        top_dir = config['top_dir'];
        recipe_slug = config['recipe_slug'];
        kindle_css = config['kindile_css'];
        base_url = config['base_url'];
        index_url = config['index_url'];
        output_dir = top_dir + '/' + recipe_slug;
        let cwd = shelljs_1.default.pwd();
        STYLESHEET = cwd + '/' + kindle_css;
        images_save_subfolder = 'images';
        processed_images_save_subfolder = 'processed_images';
        //----------------------------------------
        if (subcmd == 'init') {
            rmdir(output_dir);
            mkdir(top_dir);
            mkdir(output_dir);
            mkdir(output_dir + '/articles');
            mkdir(output_dir + '/sections');
            mkdir(output_dir + '/' + images_save_subfolder);
            mkdir(output_dir + '/' + processed_images_save_subfolder);
            //mkdir(output_dir + '/processed_images');
            shelljs_1.default.cp('./config.yaml', output_dir);
        }
        else if (subcmd == 'gets') {
            gets_extract_sections();
        }
        else if (subcmd == 'test') {
            test_sections();
        }
        else if (subcmd == 'build') {
            build_kindlerb_tree();
        }
        else if (subcmd == 'conv') {
            conv_kindlerb_tree();
        }
        else if (subcmd == 'gene') {
            gen_kindler_mobi();
        }
        else if (subcmd == 'move') {
            mobi_move();
        }
        else if (subcmd == 'help') {
            console.log('   init');
            console.log('   gets');
            console.log('   build');
            console.log('   conv');
            console.log('   gene');
        }
        else {
            console.log('unknown subcmd: ' + subcmd);
        }
    });
}
exports.default = webget5;
function config_check(config) {
    return true;
}
function gen_kindler_mobi() {
    const _D = debug_1.default('gen_kindler_mobi');
    // template set
    let opf_template = fs_1.default.readFileSync('mobi_templates/opf.mustache');
    let ncx_template = fs_1.default.readFileSync('mobi_templates/ncx.mustache');
    let contents_template = fs_1.default.readFileSync('mobi_templates/contents.mustache');
    let section_template = fs_1.default.readFileSync('mobi_templates/section.mustache');
    // gif filepath set
    let masthead_gif = 'mobi_templates/masthead.gif';
    let cover_gif = 'mobi_templates/cover-image.gif';
    let images = [];
    let manifest_items = [];
    let playorder = 1;
    var document_yaml = read(output_dir + '/_document.yaml');
    if (document_yaml == '') {
        console.log('_document_yaml is empty!!');
        return;
    }
    var document = js_yaml_1.default.safeLoad(document_yaml);
    document['spine_items'] = [];
    let section_html_files = [];
    //----------------------------------
    var sections_list = dir_fullpath(output_dir + '/sections');
    /*
     *   SECTIONS
     */
    let index = 0;
    let SECTIONS = [];
    sections_list.forEach(function (section_dir) {
        let _section_dir_ = section_dir.substring(output_dir.length + 1);
        //console.log("---  section_dir :"+section_dir);
        _D("section_dir: " + _section_dir_);
        let SECTION = {};
        let c = read(section_dir + '/_section.txt');
        let section_title = c.trim();
        _T('section title: ' + section_title);
        var tmp_list = dir_fullpath(section_dir);
        var articles_list = [];
        tmp_list.forEach(function (entry) {
            let filename = path_1.default.basename(entry);
            if (filename == 'section.html' || filename == '_section.txt') {
            }
            else {
                articles_list.push(entry);
            }
        });
        var section_html_file = _section_dir_ + '/section.html';
        section_html_files.push(section_html_file);
        let idref = 'item-' + _section_dir_.replace(/\D/g, '');
        document['spine_items'].push({ idref: idref });
        manifest_items.push({
            href: section_html_file,
            media: 'application/xhtml+xml',
            idref: idref,
        });
        playorder++;
        SECTION['playorder'] = playorder;
        /*
         * ARTICLES
         */
        let ARTICLES = [];
        articles_list.forEach(function (file) {
            let _file_ = file.substring(output_dir.length + 1);
            //console.log("   *** file :"+file);
            _D("   article_file: " + _file_);
            let ARTICLE = {};
            let doc = read(file);
            let article_images = [];
            let $ = cheerio_1.default.load(doc);
            $('img').each(function () {
                let src = $(this).attr('src');
                let filename = path_1.default.basename(src);
                let extention = path_1.default.parse(src).ext.replace('.', '');
                let mimetype = {
                    href: src,
                    //href: output_dir + '/images/' + filename,
                    mimetype: 'image/' + extention,
                };
                article_images.push(mimetype);
            });
            if (article_images.length > 0) {
                images.push(article_images);
            }
            let title = 'no title';
            let tmp = $('html')
                .children('head')
                .children('title')
                .text();
            if (tmp != '') {
                title = tmp;
            }
            let idref = 'item-' + _file_.replace(/\D/g, ''); //^^
            document['spine_items'].push({ idref: idref });
            let author = $('html')
                .children('head')
                .children('meta[name="author"]')
                .prop('content');
            let description = $('html')
                .children('head')
                .children('meta[name="description"]')
                .prop('content');
            playorder++;
            ARTICLE['file'] = _file_;
            ARTICLE['href'] = _file_;
            ARTICLE['title'] = title;
            ARTICLE['short_title'] = title.substr(0, 60);
            ARTICLE['author'] = author;
            ARTICLE['description'] = description;
            ARTICLE['playorder'] = playorder;
            ARTICLE['idref'] = idref;
            ARTICLES.push(ARTICLE);
            _T('  article title: ' + title);
            manifest_items.push({
                href: ARTICLE['file'],
                media: 'application/xhtml+xml',
                idref: ARTICLE['idref'],
            });
        }); // ARTICLES END
        SECTION['path'] = _section_dir_;
        SECTION['title'] = section_title.substr(0, 40);
        SECTION['idref'] = idref;
        SECTION['href'] = _section_dir_ + '/section.html';
        SECTION['articles'] = ARTICLES;
        // handlebars template opration
        let template = handlebars_1.default.compile(section_template.toString());
        let dist = template(SECTION);
        write(output_dir + '/' + section_html_file, dist);
        index++;
        SECTIONS.push(SECTION);
    }); // SECTIONS END
    document['sections'] = SECTIONS;
    document['first_article'] = SECTIONS[0]['articles'][0];
    let idx = 0;
    images.forEach(function (img) {
        let zero_num = `000${idx}`.slice(-3);
        manifest_items.push({
            href: img[0]['href'],
            media: img[0]['mimetype'],
            idref: 'img-' + zero_num,
        });
        idx++;
    });
    document['manifest_items'] = manifest_items;
    document['cover_mimetype'] = 'image/gif';
    /// OPF
    let opf_template_c = handlebars_1.default.compile(opf_template.toString());
    let opf = opf_template_c(document);
    let opf_path = output_dir + '/kindlerb.opf';
    write(opf_path, opf);
    /// NCX
    let ncx_template_c = handlebars_1.default.compile(ncx_template.toString());
    let ncx = ncx_template_c(document);
    let ncx_path = output_dir + '/nav-contents.ncx';
    write(ncx_path, ncx);
    /// CONTENTS
    let contents_template_c = handlebars_1.default.compile(contents_template.toString());
    let contents = contents_template_c(document);
    let contents_path = output_dir + '/contents.html';
    write(contents_path, contents);
    /// MOBI
    let outfile = document['mobi_outfile'];
    let infile = output_dir + '/kindlerb.opf';
    //console.log("outfile: " + outfile);
    //console.log(dateformat(Date.now(), "dddd, mmmm dS, yyyy, h:MM:ss TT")  );
    //console.log(dateformat(Date.now(), "yyyy-mm-dd-hhMMss")  );
    let _infile_ = infile.substring(output_dir.length + 1);
    let command = '';
    //command = `kindlegen ${infile} -verbose -c2 -o ${outfile} | tee kindlegen.log`
    let c = config['kindlegen']['compress'];
    let l = config['kindlegen']['locale'];
    if (config['kindlegen']['verbose'] && !_test) {
        command = `kindlegen ${infile} -verbose -c${c} -locale ${l} -o ${outfile} | tee kindlegen.log`;
    }
    else {
        command = `kindlegen ${infile} -c${c} -locale ${l} -o ${outfile} | tee kindlegen.log`;
    }
    _D('command: ' + command);
    _T('command: ' + command);
    child_process
        .exec(command, (error, stdout, stderr) => {
        if (error instanceof Error) {
            //console.log(stdout);
            //console.error(error);
            console.log(chalk_1.default.red('**** Error'));
        }
        else {
            //console.log(stdout);
            _D('genalated  success!');
        }
    })
        .stdout.pipe(process_1.default.stdout);
}
function mobi_move() {
    const _D = debug_1.default('mobi_move');
    let document_yaml = read(output_dir + '/_document.yaml');
    if (document_yaml == '') {
        console.log('_document_yaml is empty!!');
        return;
    }
    let document = js_yaml_1.default.safeLoad(document_yaml);
    let outfile = document['mobi_outfile'];
    let output_filepath = config['kindlegen']['output_path'];
    let source = output_dir + '/' + outfile;
    _D('source: ' + source);
    _D('dist:   ' + output_filepath);
    shelljs_1.default.mkdir('-p', output_filepath);
    shelljs_1.default.mv(source, output_filepath);
    shelljs_1.default.ls('-l', output_filepath).forEach(function (file) {
        if (outfile == file.name) {
            console.log(chalk_1.default.yellow(file.atime + ' ' + file.size + ' ' + file.name));
            //   _D(file.atime + ' ' + file.size + ' ' + file.name);
        }
        else {
            console.log(file.atime + ' ' + file.size + ' ' + file.name);
        }
    });
}
function gets_extract_sections() {
    const _D = debug_1.default('gets_extract_sections');
    let href_section_regex = new RegExp(config['extract_sections']['href_section_regex']);
    let href_article_regex = new RegExp(config['extract_sections']['href_article_regex']);
    _T('href_section_regex: ' + config['extract_sections']['href_section_regex']);
    _T('href_article_regex: ' + config['extract_sections']['href_article_regex']);
    try {
        cheerio_httpcli_1.default
            .fetch(index_url)
            .then(function (result) {
            let titlepath = titlepage(result);
            let xs = [];
            xs.push({
                title: 'Frontmatter',
                articles: [{ title: 'Title Page', path: titlepath }],
            });
            //console.dir(xs);
            //var $a = result.$('.toc a');
            let $a = result.$(`${config['extract_sections']['href_select_class']} a`);
            $a.each(function () {
                let $url = result.$(this).attr('href');
                //console.log('++' + $url)
                if ($url === undefined) {
                    return;
                }
                if ($url.match(href_section_regex)) {
                    //section
                    _D('SECTION:' + $url);
                    _T('SECTION:' + $url);
                    var savepath = '';
                    var tmp = result.$(this).attr('href');
                    if (tmp.match(/^\//)) {
                        savepath = tmp.slice(1);
                    }
                    else {
                        savepath = tmp;
                    }
                    xs.push({
                        title: result.$(this).text(),
                        articles: [
                            {
                                title: result.$(this).text(),
                                path: save_article(savepath),
                            },
                        ],
                    });
                }
                else if ($url.match(href_article_regex)) {
                    //article
                    _D('  ARTICLE:' + $url);
                    _T('  ARTICLE:' + $url);
                    let savepath = '';
                    let tmp = result.$(this).attr('href');
                    if (tmp.match(/^\//)) {
                        savepath = tmp.slice(1);
                    }
                    else {
                        savepath = tmp;
                    }
                    xs[xs.length - 1].articles.push({
                        title: result.$(this).text(),
                        path: save_article(savepath),
                    });
                }
            });
            const yamlText = js_yaml_1.default.dump(xs);
            fs_1.default.writeFile(output_dir + '/section.yaml', yamlText, 'utf8', function (err) {
                return __awaiter(this, void 0, void 0, function* () {
                    if (err) {
                        console.log(err);
                    }
                });
            });
            extract_sections_end = true;
        })
            .catch(function (err) {
            console.error(chalk_1.default.red('ERROR'), err);
        })
            .finally(function () {
            //console.info(C.cyan('INFO'), 'scraping end...')
            _D('scraping end...');
        });
        //----------------------------------------
    }
    catch (error) {
        console.log(chalk_1.default.red(`failed to read ${error}`));
        return null;
    }
}
function test_sections() {
    const _D = debug_1.default('test_sections');
    console.log('test sections ----------------------');
    if (process_1.default.env.DEBUG) {
        console.log('DEGUB MODE!!!');
    }
    if (_debug) {
        console.log('DEGUB MODE!!!***');
    }
    Da('test d1');
    Db('test d2');
    WA('waker test wa');
    WB('waker test wb');
    WA('waker -------');
    Db('%s test     %d', 'string', 99);
}
function build_kindlerb_tree() {
    const _D = debug_1.default('build_kindlerb_tree');
    //console.log('build_kindlerb_tree start')
    let sections_yaml = read(output_dir + '/section.yaml');
    if (sections_yaml == '') {
        console.log('sections_yaml is empty!!');
        return;
    }
    let sections = js_yaml_1.default.safeLoad(sections_yaml);
    //console.log(sections);
    _D('sections_yaml load end');
    let index = 0;
    sections.forEach(function (value) {
        let zero_num = `000${index}`.slice(-3);
        let title = value['title'];
        //console.log(zero_num);
        //console.log(title);
        mkdir(output_dir + '/sections/' + zero_num);
        write(output_dir + '/sections/' + zero_num + '/_section.txt', title);
        _D('/sections/' + zero_num);
        let index_articles = 0;
        let articles = value['articles'];
        articles.forEach(function (item) {
            let article_title = item['title'];
            let article_path = item['path'];
            var doc = read(output_dir + '/' + article_path);
            if (config['images_include']) {
                download_images(doc);
            }
            index_articles++;
        });
        index++;
    });
}
function conv_kindlerb_tree() {
    const _D = debug_1.default('conv_kindlerb_tree');
    var save_path = output_dir + '/' + images_save_subfolder;
    //console.log(save_path);
    var filelist = dir(save_path);
    //console.log(filelist);
    filelist.forEach(function (save_file_name) {
        //console.log(save_file_name);
        var save_file_path = output_dir + '/' + images_save_subfolder + '/' + save_file_name;
        //console.log('save_file_path: : '+save_file_path);
        var filename = path_1.default.parse(save_file_name).name;
        var extention = path_1.default.parse(save_file_name).ext;
        var processed_image_path = output_dir +
            '/' +
            processed_images_save_subfolder +
            '/' +
            filename +
            '-grayscale.gif';
        //console.log('processed_image_path: '+processed_image_path);
        convert_images(save_file_path, processed_image_path);
    });
    //------------------------------------------
    var sections_yaml = read(output_dir + '/section.yaml');
    if (sections_yaml == '') {
        console.log('sections_yaml is empty!!');
        return;
    }
    var sections = js_yaml_1.default.safeLoad(sections_yaml);
    let index = 0;
    sections.forEach(function (value) {
        let section_zero_num = `000${index}`.slice(-3);
        let index_articles = 0;
        let articles = value['articles'];
        articles.forEach(function (item) {
            let article_title = item['title'];
            let article_path = item['path'];
            let description = item['description'];
            let author = item['author'];
            var doc = read(output_dir + '/' + article_path);
            //-----------------------------------  href remove
            var $ = cheerio_1.default.load(doc);
            /*
            var $ ;
            var basename = path.basename(article_path);
            if (basename.match(/^#/)) {
                 $all =cheerio.load(doc);
                 $ =$all(basename);

            } else {
                 $ =cheerio.load(doc);
            }
            */
            $('img').each(function () {
                var src = $(this).attr('src');
                //console.log('img src: ', src);
                var filename = path_1.default.parse(src).name;
                var extention = path_1.default.parse(src).ext;
                var processed_image_path = processed_images_save_subfolder +
                    '/' +
                    filename +
                    '-grayscale.gif';
                let cwd = process_1.default.cwd();
                $(this).attr('src', cwd + '/' + output_dir + '/' + processed_image_path);
            });
            $('a').each(function () {
                if ($(this).hasClass('xref')) {
                    $(this).remove();
                }
                if ($(this).hasClass('indexterm')) {
                    $(this).remove();
                }
            });
            //-----------------------------------
            doc = '<body>\n\n' + $.html() + '\n\n</body>\n\n';
            fixup_html(doc);
            let item_zero_num = `000${index_articles}`.slice(-3);
            let item_path = 'sections/' + section_zero_num + '/' + item_zero_num + '.html';
            var ndoc = add_head_tail_section(doc, article_title, description, author);
            ndoc = ndoc.replace(/<!DOCTYPE.*$/g, '');
            ndoc = ndoc.replace('&#13;', '');
            ndoc = ndoc.replace(/\n(\s*)\n|\n(\t*)\n/g, '\n');
            fs_1.default.writeFileSync('content/' + recipe_slug + '/' + item_path, ndoc);
            index_articles++;
        });
        index++;
    });
    let date = dateformat_1.default(Date.now(), 'yyyy-mm-dd');
    let date2 = dateformat_1.default(Date.now(), 'yyyy-mm-dd-hh/MM/ss');
    document_mobiinfo(recipe_slug + '-documetation-' + date, //uuid
    recipe_slug, //title
    'SUBJECT', //subject
    'AUTHOR', //author
    date2, //date
    recipe_slug + '.' + date + '.mobi' //out_filename
    );
}
function http_get_file(url, save_file_path) {
    const _D = debug_1.default('http_get_file');
    var outFile = fs_1.default.createWriteStream(save_file_path);
    var options = {
        host: '10.190.31.15',
        port: 8080,
        path: url,
        headers: {
            Host: 'www.google.com',
        },
    };
    var req;
    var hostname = os_1.default.hostname();
    if (hostname == 'gsub') {
        req = http_1.default.get(url, function (res) {
            res.pipe(outFile);
            res.on('close', function () {
                outFile.close();
            });
        });
    }
    else {
        req = http_1.default.get(options, function (res) {
            res.pipe(outFile);
            res.on('close', function () {
                outFile.close();
            });
        });
    } //endif
    req.on('error', function (err) {
        console.log('Error: ', err);
        return;
    });
}
function download_images(doc) {
    const _D = debug_1.default('download_images');
    var $ = cheerio_1.default.load(doc);
    $('img').each(function () {
        var src = $(this).attr('src');
        var url = base_url + src;
        var save_file_name = path_1.default.basename(src);
        var save_file_path = output_dir + '/' + images_save_subfolder + '/' + save_file_name;
        //console.log('src: '+src);
        //console.log('url: '+url);
        //console.log('save_file_path: : '+save_file_path);
        http_get_file(url, save_file_path);
        var filename = path_1.default.parse(save_file_name).name;
        var extention = path_1.default.parse(save_file_name).ext;
        var processed_image_path = output_dir +
            '/' +
            processed_images_save_subfolder +
            '/' +
            filename +
            '-grayscale.gif';
        //console.log('processed_image_path: '+processed_image_path);
    });
}
function convert_images(source, dest) {
    const _D = debug_1.default('convert_images');
    let param = [
        source,
        //          '-compose over',
        //             '-background white',
        //             '-flatten',
        //             '-resize \'300x200>\'',
        //             '-alpha off',
        dest,
    ];
    let child = child_process.execFile('convert', param, (error, stdout, stderr) => {
        if (error) {
            console.error('stderr', stderr);
            throw error;
        }
    });
}
function fixup_html(doc) {
    const _D = debug_1.default('fixup_html');
    var $ = cheerio_1.default.load(doc);
    $('dt').each(function () {
        $(this)
            .children()
            .first()
            .before('<br>');
    });
    $('li')
        .children('p')
        .each(function () {
        var tmp = $(this).children();
        $(this).replaceWith(tmp);
    });
}
function document_mobiinfo(uuid, title, subject, author, date, out_filename) {
    const _D = debug_1.default('document_mobiinfo');
    let info = `
---
doc_uuid: ${uuid}
title: ${title}
author: ${author}
publisher: github.com/danchoi/kindlefodder
subject: ${subject}
date: ${date}
mobi_outfile: ${out_filename}
cover: 
masthead: 
`;
    //_document.yml
    fs_1.default.writeFileSync('content/' + recipe_slug + '/' + '_document.yaml', info);
}
function add_head_tail_section(doc, title, description, author) {
    const _D = debug_1.default('add_head_tail_section');
    let head = `
 <html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
  <head>
    <meta content="http://www.w3.org/1999/xhtml; charset=utf-8" http-equiv="Cont
ent-Type" />
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <meta name="author" content="${author}" />
    <link rel="stylesheet" type="text/css" href="${STYLESHEET}" />
  </head>
   `;
    let tail = '\n\n</html>';
    let new_doc = head + doc + tail;
    return new_doc;
}
/*
 *  Utility functions
 */
function sleep(t) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield new Promise(r => {
            setTimeout(() => {
                r();
            }, t);
        });
    });
}
function check(filePath) {
    var isExist = false;
    try {
        fs_1.default.statSync(filePath);
        isExist = true;
    }
    catch (err) {
        isExist = false;
    }
    return isExist;
}
function dir_fullpath(Path) {
    const filenames = fs_1.default.readdirSync(Path);
    let PATH = Path.replace(/\/$/, '');
    let fullpath_list = [];
    filenames.forEach(function (item) {
        fullpath_list.push(PATH + '/' + item);
    });
    return fullpath_list;
}
function dir(Path) {
    const filenames = fs_1.default.readdirSync(Path);
    return filenames;
}
function read(filePath) {
    var content = '';
    if (check(filePath)) {
        content = fs_1.default.readFileSync(filePath, 'utf8');
    }
    else {
        console.log('check error :' + filePath);
    }
    return content;
}
function write(filePath, stream) {
    var result = false;
    try {
        fs_1.default.writeFileSync(filePath, stream);
        return true;
    }
    catch (err) {
        return false;
    }
}
function mkdir(path) {
    if (!fs_1.default.existsSync(path)) {
        fs_1.default.mkdirSync(path);
    }
}
function rmdir(path) {
    if (fs_1.default.existsSync(path)) {
        fs_1.default.readdirSync(path).forEach(function (file, index) {
            var curPath = path + '/' + file;
            if (fs_1.default.lstatSync(curPath).isDirectory()) {
                // recurse
                rmdir(curPath);
            }
            else {
                // delete file
                fs_1.default.unlinkSync(curPath);
            }
        });
        fs_1.default.rmdirSync(path);
    }
}
function titlepage(doc) {
    const _D = debug_1.default('titlepage');
    var path = 'articles/titlepage';
    var content = doc.$('.titlepage').html();
    fs_1.default.writeFileSync('content/' + recipe_slug + '/' + path, content);
    return path;
}
function save_article(filename) {
    const _D = debug_1.default('save_article');
    /*
const beautifyOptions = {
      indent_size: 2,
      end_with_newline: true,
      preserve_newlines: false,
      max_preserve_newlines: 0,
      wrap_line_length: 0,
      wrap_attributes_indent_size: 0,
      unformatted: ['b', 'em']
};
     */
    const beautifyOptions = {
        "indent_size": 4,
        "indent_char": " ",
        "indent_with_tabs": false,
        "editorconfig": false,
        "eol": "\n",
        "end_with_newline": false,
        "indent_level": 0,
        "preserve_newlines": true,
        "max_preserve_newlines": 10,
        "space_in_paren": false,
        "space_in_empty_paren": false,
        "jslint_happy": false,
        "space_after_anon_function": false,
        "space_after_named_function": false,
        "brace_style": "collapse",
        "unindent_chained_methods": false,
        "break_chained_methods": false,
        "keep_array_indentation": false,
        "unescape_strings": false,
        "wrap_line_length": 0,
        "e4x": false,
        "comma_first": false,
        "operator_position": "before-newline",
        "indent_empty_lines": false,
        "templating": ["auto"]
    };
    //var _path_ = 'articles/' + filename
    var _path_ = '';
    if (filename.match(/\/$/)) {
        _path_ = 'articles/' + filename + 'root.html';
    }
    else {
        _path_ = 'articles/' + filename;
    }
    var url = base_url + filename;
    var fullpath = 'content/' + recipe_slug + '/' + _path_;
    shelljs_1.default.mkdir('-p', path_1.default.dirname(fullpath));
    _D('fetch: ' + url);
    cheerio_httpcli_1.default
        .fetch(url)
        .then(function (result) {
        result.$('.script').remove();
        result.$('.navfooter').remove();
        result.$('.navheader').remove();
        result.$('#vcws-footer').remove();
        result.$('#vcws-version-notice').remove();
        result.$('.toc').remove();
        //var content = result.$('body').html()
        //fs.writeFileSync('content/' + recipe_slug + '/' + _path_, content)
        var basename = path_1.default.basename(_path_);
        if (basename.match(/root\.html$/)) {
            let head = result.$('h1');
            let content1 = result.$('h1').parent().children('div').children('p').first();
            let content2 = result.$('h1').parent().children('div').children('p').first().nextUntil('h2');
            var all = head.toString() + content1.toString() + content2.toString();
            //fs.writeFileSync('content/' + recipe_slug + '/' + _path_, all )
            //let out = pretty(all, {ocd: true});
            //let out = pretty(all);
            let out = js_beautify_1.default.html(all, beautifyOptions);
            fs_1.default.writeFileSync('content/' + recipe_slug + '/' + _path_, out);
        }
        else if (basename.match(/^#/)) {
            var head = result.$(basename);
            var head_tag = result.$(basename).get(0).tagName;
            var content = result.$(basename).nextUntil(head_tag);
            var all = head.toString() + content.toString();
            //fs.writeFileSync('content/' + recipe_slug + '/' + _path_, all )
            //let out = pretty(all, {ocd: true});
            //let out = pretty(all);
            let out = js_beautify_1.default.html(all, beautifyOptions);
            fs_1.default.writeFileSync('content/' + recipe_slug + '/' + _path_, out);
        }
        else {
            let content2 = result.$('body').html();
            //fs.writeFileSync('content/' + recipe_slug + '/' + _path_, content2)
            //let out = pretty(content2, {ocd: true});
            //let out = pretty(content2);
            let out = js_beautify_1.default.html(content2, beautifyOptions);
            fs_1.default.writeFileSync('content/' + recipe_slug + '/' + _path_, out);
        }
    })
        .catch(function (err) {
        console.error(chalk_1.default.red('ERROR'), err);
    })
        .finally(function () { });
    return _path_;
}
//# sourceMappingURL=webget5.js.map