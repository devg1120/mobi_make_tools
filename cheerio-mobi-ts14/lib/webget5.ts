//import  chalk from 'chalk';
import C from 'chalk'
import client from 'cheerio-httpcli'
import cheerio from 'cheerio'

//import * as fs from 'fs-extra'
import os from 'os'
import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'
import http from 'http'
import https from 'https'
import request from 'request'

import process from 'process'
import Jimp from 'jimp'
import * as child_process from 'child_process'
import sh from 'shelljs'
import hd from 'handlebars'
import dateformat from 'dateformat'
//import pretty  from 'pretty'
import beautify from 'js-beautify'
//import prism from 'prismjs'
//import highlight from 'highlight-bash-syntax'
import highlight from 'cli-highlight'


import DEBUG from "debug";



var top_dir = ''
var output_dir = ''
var images_save_subfolder = ''
var processed_images_save_subfolder = ''
var recipe_slug = ''
var base_url = ''
var index_url = ''
var kindle_css = ''
var STYLESHEET = ''
var config = ''
var _debug = false
var _test  = false

var extract_sections_end = false

const Da = DEBUG('APPa')
const Db = DEBUG('testb')
const WA = DEBUG('WK:A')
const WB = DEBUG('WK:B')

const _T = DEBUG('test')



export default async function webget5(
    subcmd: string,
    dist_filepath: string,
    values: any
) {
    const _D = DEBUG('main')

    //console.log('+++ start kindle mobi genalater:' + subcmd)
    _D('subcmd: ' + subcmd)

    if (process.env.DEBUG) {
      _debug = true;
    }
    if (process.env.TEST) {
      _test = true;
    }

    var config_yaml = read('./config.yaml')

    if (config_yaml == '') {
        console.log(C.red('config.yaml is not read!!'))
        return
    }

    try {
        config = yaml.safeLoad(config_yaml)
    } catch (err) {
        console.error('config.yaml load error!!')
        console.error(err['message'])
        return
    }

    if (!config_check(config)) {
        console.log('config error....')
        return
    }

    top_dir     = config['top_dir']
    recipe_slug = config['recipe_slug']
    kindle_css  = config['kindile_css']

    base_url   = config['base_url']
    index_url  = config['index_url']

    output_dir = top_dir + '/' + recipe_slug
    let cwd    = sh.pwd()
    STYLESHEET = cwd + '/' + kindle_css

    images_save_subfolder = 'images'
    processed_images_save_subfolder = 'processed_images'

    //----------------------------------------
    if (subcmd == 'init') {
        rmdir(output_dir)

        mkdir(top_dir)
        mkdir(output_dir)
        mkdir(output_dir + '/articles')
        mkdir(output_dir + '/sections')
        mkdir(output_dir + '/' + images_save_subfolder)
        mkdir(output_dir + '/' + processed_images_save_subfolder)
        //mkdir(output_dir + '/processed_images');

        sh.cp('./config.yaml', output_dir)
    } else if (subcmd == 'gets') {
        gets_extract_sections()
    } else if (subcmd == 'test') {
        test_sections()
    } else if (subcmd == 'build') {
        build_kindlerb_tree()
    } else if (subcmd == 'conv') {
        conv_kindlerb_tree()
    } else if (subcmd == 'epub') {
        gen_epub()
    } else if (subcmd == 'gene') {
        gen_kindler_mobi()
    } else if (subcmd == 'move') {
        mobi_move();
    } else if (subcmd == 'help') {
        console.log('   init')
        console.log('   gets')
        console.log('   build')
        console.log('   conv')
        console.log('   gene')
    } else {
        console.log('unknown subcmd: ' + subcmd)
    }
}

function config_check(config: any) {
    return true
}

function gen_kindler_mobi() {
    const _D = DEBUG('gen_kindler_mobi')

    var document_yaml = read(output_dir + '/_document.yaml')

    if (document_yaml == '') {
        console.log('_document_yaml is empty!!')
        return
    }
    var document = yaml.safeLoad(document_yaml)


    /// MOBI
    let outfile = document['mobi_outfile']
    let infile = output_dir + '/kindlerb.opf'
    //console.log("outfile: " + outfile);

    //console.log(dateformat(Date.now(), "dddd, mmmm dS, yyyy, h:MM:ss TT")  );
    //console.log(dateformat(Date.now(), "yyyy-mm-dd-hhMMss")  );

    let _infile_ = infile.substring(output_dir.length + 1)
    let command = ''
    //command = `kindlegen ${infile} -verbose -c2 -o ${outfile} | tee kindlegen.log`
    let c = config['kindlegen']['compress']
    let l = config['kindlegen']['locale']

    
    if (config['kindlegen']['verbose'] && !_test) {
        command = `kindlegen ${infile} -verbose -c${c} -locale ${l} -o ${outfile} | tee kindlegen.log`
    } else {
        command = `kindlegen ${infile} -c${c} -locale ${l} -o ${outfile} | tee kindlegen.log`
    }
    
    _D('command: ' + command)
    _T('command: ' + command)


    child_process
        .exec(command, (error, stdout, stderr) => {
            if (error instanceof Error) {
                //console.log(stdout);
                //console.error(error);
                console.log(C.red('**** Error'))
            } else {
                //console.log(stdout);
                _D('genalated  success!')
            }
        })
        .stdout.pipe(process.stdout)

}

function gen_epub() {
    const _D = DEBUG('gen_epub')

    // template set
    let book_type = 'refllowbook'
    let opf_template 
    if ( config.hasOwnProperty('book_type')) {
        book_type = config['book_type']
    }
    _D('book_type: '+book_type)
    if ( book_type == 'magazine' ) {
       opf_template = fs.readFileSync('mobi_templates/opf1.mustache')
    } else if ( book_type == 'refllowbook' ) {
       opf_template = fs.readFileSync('mobi_templates/opf2.mustache')
    } else {
        console.log('book_type error: ' + book_type)
       opf_template = fs.readFileSync('mobi_templates/opf2.mustache')
    }

    let ncx_template = fs.readFileSync('mobi_templates/ncx.mustache')
    let contents_template = fs.readFileSync('mobi_templates/contents.mustache')
    let section_template = fs.readFileSync('mobi_templates/section.mustache')

    // gif filepath set
    let cwd = process.cwd()
    let masthead_gif = cwd + '/mobi_images/masthead.gif'
    let cover_gif = cwd + '/mobi_images/cover-image.gif'

    let images = []
    let manifest_items = []
    let playorder = 1

    var document_yaml = read(output_dir + '/_document.yaml')

    if (document_yaml == '') {
        console.log('_document_yaml is empty!!')
        return
    }
    var document = yaml.safeLoad(document_yaml)
    document['spine_items'] = []
    let section_html_files = []

    //----------------------------------

    var sections_list = dir_fullpath(output_dir + '/sections')

    /*
     *   SECTIONS
     */

    let index = 0
    let SECTIONS = []

    sections_list.forEach(function(section_dir) {
        let _section_dir_ = section_dir.substring(output_dir.length + 1)
        //console.log("---  section_dir :"+section_dir);
        _D("section_dir: "+_section_dir_);

        let SECTION = {}
        let c = read(section_dir + '/_section.txt')
        let section_title = c.trim()
        _T('section title: ' + section_title)
        var tmp_list = dir_fullpath(section_dir)
        var articles_list = []
        tmp_list.forEach(function(entry) {
            let filename = path.basename(entry)
            if (filename == 'section.html' || filename == '_section.txt') {
            } else {
                articles_list.push(entry)
            }
        })

        var section_html_file = _section_dir_ + '/section.html' 
        section_html_files.push(section_html_file)
        let idref = 'item-' + _section_dir_.replace(/\D/g, '') 
        document['spine_items'].push({ idref: idref })
        

        manifest_items.push({
            href: section_html_file,
            media: 'application/xhtml+xml',
            idref: idref,
        })

        playorder++
        SECTION['playorder'] = playorder

        /*
         * ARTICLES
         */

        let ARTICLES = []

        articles_list.forEach(function(file) {
            let _file_ = file.substring(output_dir.length + 1)
            //console.log("   *** file :"+file);
            _D("   article_file: "+_file_);

            let ARTICLE = {}
            let doc = read(file)

            let article_images = []
            let $ = cheerio.load(doc)
            $('img').each(function() {
                let src = $(this).attr('src')
                let filename = path.basename(src)
                let extention = path.parse(src).ext.replace('.', '')
                let mimetype = {
                    href: src,
                    //href: output_dir + '/images/' + filename,
                    mimetype: 'image/' + extention,
                }
                article_images.push(mimetype)
            })

            if (article_images.length > 0) {
                images.push(article_images)
            }

            let title = 'no title'
            let tmp = $('html')
                .children('head')
                .children('title')
                .text()
            if (tmp != '') {
                title = tmp
            }

            let idref = 'item-' + _file_.replace(/\D/g, '') //^^
            document['spine_items'].push({ idref: idref })

            let author = $('html')
                .children('head')
                .children('meta[name="author"]')
                .prop('content')

            let description = $('html')
                .children('head')
                .children('meta[name="description"]')
                .prop('content')

            playorder++
            ARTICLE['file']        = _file_ 
            ARTICLE['href']        = _file_ 
            ARTICLE['title']       = title
            ARTICLE['short_title'] = title.substr(0, 60)
            ARTICLE['author']      = author
            ARTICLE['description'] = description
            ARTICLE['playorder']   = playorder
            ARTICLE['idref']       = idref

            ARTICLES.push(ARTICLE)

            _T('  article title: ' + title)

            manifest_items.push({
                href: ARTICLE['file'],
                media: 'application/xhtml+xml',
                idref: ARTICLE['idref'],
            })
        }) // ARTICLES END

        SECTION['path']     = _section_dir_ 
        SECTION['title']    = section_title.substr(0, 40)
        SECTION['idref']    = idref
        SECTION['href']     = _section_dir_ + '/section.html' 
        SECTION['articles'] = ARTICLES

        // handlebars template opration
        let template = hd.compile(section_template.toString())
        let dist = template(SECTION)

        write(output_dir + '/' + section_html_file, dist)

        index++
        SECTIONS.push(SECTION)
    }) // SECTIONS END

    document['sections'] = SECTIONS
    document['first_article'] = SECTIONS[0]['articles'][0]
    let idx = 0
    images.forEach(function(img) {
        let zero_num = `000${idx}`.slice(-3)
        manifest_items.push({
            href: img[0]['href'],
            media: img[0]['mimetype'],
            idref: 'img-' + zero_num,
        })
        idx++
    })

    document['manifest_items'] = manifest_items
    document['cover_mimetype'] = 'image/gif'
    document['cover'] = cover_gif
    document['masthead'] = masthead_gif

    /// OPF
    let opf_template_c = hd.compile(opf_template.toString())
    let opf = opf_template_c(document)
    let opf_path = output_dir + '/kindlerb.opf'
    write(opf_path, opf)

    /// NCX
    let ncx_template_c = hd.compile(ncx_template.toString())
    let ncx = ncx_template_c(document)
    let ncx_path = output_dir + '/nav-contents.ncx'
    write(ncx_path, ncx)

    /// CONTENTS
    let contents_template_c = hd.compile(contents_template.toString())
    let contents = contents_template_c(document)
    let contents_path = output_dir + '/contents.html'
    write(contents_path, contents)

    var dump = yaml.safeDump(document);
    fs.writeFileSync(output_dir + '/' + '_document.yaml', dump)
/*
    /// MOBI
    let outfile = document['mobi_outfile']
    let infile = output_dir + '/kindlerb.opf'
    //console.log("outfile: " + outfile);

    //console.log(dateformat(Date.now(), "dddd, mmmm dS, yyyy, h:MM:ss TT")  );
    //console.log(dateformat(Date.now(), "yyyy-mm-dd-hhMMss")  );

    let _infile_ = infile.substring(output_dir.length + 1)
    let command = ''
    //command = `kindlegen ${infile} -verbose -c2 -o ${outfile} | tee kindlegen.log`
    let c = config['kindlegen']['compress']
    let l = config['kindlegen']['locale']

    
    if (config['kindlegen']['verbose'] && !_test) {
        command = `kindlegen ${infile} -verbose -c${c} -locale ${l} -o ${outfile} | tee kindlegen.log`
    } else {
        command = `kindlegen ${infile} -c${c} -locale ${l} -o ${outfile} | tee kindlegen.log`
    }
    
    _D('command: ' + command)
    _T('command: ' + command)


    child_process
        .exec(command, (error, stdout, stderr) => {
            if (error instanceof Error) {
                //console.log(stdout);
                //console.error(error);
                console.log(C.red('**** Error'))
            } else {
                //console.log(stdout);
                _D('genalated  success!')
            }
        })
        .stdout.pipe(process.stdout)

*/
  return 0
}

function mobi_move() {
    const _D = DEBUG('mobi_move')

    let document_yaml = read(output_dir + '/_document.yaml')

    if (document_yaml == '') {
        console.log('_document_yaml is empty!!')
        return
    }
    let document = yaml.safeLoad(document_yaml)

    let outfile = document['mobi_outfile']

    let output_filepath = config['kindlegen']['output_path'] ;

    let source = output_dir + '/' + outfile;

    _D('source: '+source);
    _D('dist:   '+output_filepath);

    sh.mkdir('-p', output_filepath);
    sh.mv (source, output_filepath);
    sh.ls ('-l', output_filepath).forEach(function (file) {

     if (outfile == file.name) {
        console.log(C.yellow(file.atime + ' ' + file.size + ' ' + file.name));
        //   _D(file.atime + ' ' + file.size + ' ' + file.name);
      } else {
        console.log(file.atime + ' ' + file.size + ' ' + file.name);

      }
    });
}


function gets_extract_sections() {
    const _D = DEBUG('gets_extract_sections')

    let select_section_regex 
    let select_article_regex 
    if (config['extract_sections']['select_method'] == 'logic') {
       select_section_regex = new RegExp('_section$')
       select_article_regex = new RegExp('_article$')

    } else if (config['extract_sections']['select_method'] == 'regex') {
       select_section_regex = new RegExp(
           config['extract_sections']['select_section_regex']
       )
       select_article_regex = new RegExp(
           config['extract_sections']['select_article_regex']
       )
    }  else {
        console.log('gets_extract_sections  select method error!!!')
        return
    }

	//    _T('select_section_regex: ' + config['extract_sections']['select_section_regex'])
	//    _T('select_article_regex: ' + config['extract_sections']['select_article_regex'])

    try {
        client
            .fetch(index_url)
            .then(function(result) {
                let titlepath = titlepage(result)
                let xs = []
                xs.push({
                    title: 'Frontmatter',
                    articles: [{ title: 'Title Page', path: titlepath }],
                })
                //console.dir(xs);
                //var $a = result.$('.toc a');
                let $a = result.$(
			    `${config['extract_sections']['select_class']} a`
			//  `${config['extract_sections']['href_select_tag']} a`
                )

                $a.each(function() {
                    let $url_org = result.$(this).attr('href')
			//console.log('++' + $url)
                    if ($url_org === undefined) {
                        return
                    }

                    let $url

		    if (config['extract_sections']['select_method'] == 'logic') {
			    /*
			    //--- select logic ---
                            let data_level = result.$(this).parent().attr('data-level')
			    let level = data_level.toString().split('.').length -1
			    if ( level > 1) {
                                $url = $url_org + '_article'
			    } else {
                                $url = $url_org + '_section'
			    }
			    //-------------------
	                    */
		            eval(config['extract_sections']['select_logic_script']) 
			    
		    } else {
			    $url = $url_org
		    }

                    if ($url.match(select_section_regex)) {
                        //section
                        _D('SECTION:' + $url)
                        _T('SECTION:' + $url)
                        
                        var savepath = '';
                        var tmp =  result.$(this).attr('href');
                        if (tmp.match(/^\//)) {
                            savepath = tmp.slice(1);
                        } else {
                            savepath = tmp;
                        }
                        xs.push({
                            title: result.$(this).text(),
                            articles: [
                                {
                                    title: result.$(this).text(),
                                    path: save_content(savepath),
                                },
                            ],
                        })
                    } else if ($url.match(select_article_regex)) {
                        //article
                        _D('  ARTICLE:' + $url)
                        _T('  ARTICLE:' + $url)
                            let savepath = '';
                             let tmp =  result.$(this).attr('href');
                             if (tmp.match(/^\//)) {
                                 savepath = tmp.slice(1);
                             } else {
                                 savepath = tmp;
                             }

                        xs[xs.length - 1].articles.push({
                            title: result.$(this).text(),
                            path: save_content(savepath),
                        })
                    }
                })

		    //                if (_test) {
		    //                    dump_section(xs)
		    //		}
                const yamlText = yaml.dump(xs)
		    //console.log(yamlText)

                fs.writeFile(
                    output_dir + '/section.yaml',
                    yamlText,
                    'utf8',
                    async function(err) {
                        if (err) {
                            console.log(err)
                        }
                    }
                )
                extract_sections_end = true
            })
            .catch(function(err) {
                console.error(C.red('ERROR'), err)
            })
            .finally(function() {
		    //console.info(C.cyan('INFO'), 'scraping end...')
                _D('scraping end...')
            })

        //----------------------------------------
    } catch (error) {
        console.log(C.red(`failed to read ${error}`))
        return null
    }
}

function dump_section(xs) {
	//console.log(xs)
   xs.forEach(function(section) {
     console.log('');
     console.log(C.yellow(section['title']));
     console.log('');
     section['articles'].forEach(function(article) {
             console.log('   '+article['title']);
             console.log(C.blue(`             : `+article['path']));
      });
   });
	 

   xs.forEach(function(section) {
     let section_title = section['title'];
     section['articles'].forEach(function(article) {
             let article_title = article['title']
             let article_path  = article['path']
	     //console.log(C.green('-----------------------------------------------------'))
	     console.log('')
	     console.log('')
	     console.log(C.green(section_title + '    ' + article_title))
	     console.log(C.green('-----------------------------------------------------'))
	     let doc = fs.readFileSync(output_dir +'/'+ article_path)
	     //let $ = cheerio.load(doc)
	     //console.log(doc.toString())
	     let html = beautify.html(doc.toString())
	     //let html = prism.highlight(code, prism.languages.html, 'html');
	     console.log(highlight(html,{
		     language: 'html', 
		     ignoreIllegals: true,
		     theme: {
			       tag: C.yellow,
			       name: C.yellow,
			       string: C.gray
		         }
	            }))
	            // DEFAULT THEME
	            // https://github.com/felixfbecker/cli-highlight/blob/88743e2/src/theme.ts#L299     
      });
   });
}

function test_sections() {
    const _D = DEBUG('test_sections')
		/*
   console.log('test sections ----------------------')
   if (process.env.DEBUG) {
        console.log('DEGUB MODE!!!')
   }
   if (_debug) {
        console.log('DEGUB MODE!!!***')
   }
   Da('test d1')
   Db('test d2')
   WA('waker test wa')
   WB('waker test wb')
   WA('waker -------')
   Db('%s test     %d', 'string', 99)
		 */

	//	 let dump = sh.cat(output_dir+'/section.yaml')
	//console.log(dump)
	//
    let sections_yaml = read(output_dir + '/section.yaml')
    if (sections_yaml == '') {
            console.log('sections_yaml is empty!!')
            return
     }
    let sections = yaml.safeLoad(sections_yaml)

    dump_section(sections)

}

function build_kindlerb_tree() {
    const _D = DEBUG('build_kindlerb_tree')

	//console.log('build_kindlerb_tree start')
    let sections_yaml = read(output_dir + '/section.yaml')
    if (sections_yaml == '') {
        console.log('sections_yaml is empty!!')
        return
    }
    let sections = yaml.safeLoad(sections_yaml)
    //console.log(sections);
    _D('sections_yaml load end');

    let index = 0

    sections.forEach(function(value) {
        let zero_num = `000${index}`.slice(-3)
        let title = value['title']
        //console.log(zero_num);
        //console.log(title);
        mkdir(output_dir + '/sections/' + zero_num)
        write(output_dir + '/sections/' + zero_num + '/_section.txt', title)

        _D('/sections/'+zero_num)

        let index_articles = 0
        let articles = value['articles']
        articles.forEach(function(item) {
            let article_title = item['title']
            let article_path = item['path']
            _D('read: '+output_dir + '/' + article_path)
            var doc = read(output_dir + '/' + article_path)
	    if (config['images_include'] ) {
	       download_images(doc)
            }
            index_articles++
        })

        index++
    })
}

function conv_kindlerb_tree() {
    const _D = DEBUG('conv_kindlerb_tree')

    var save_path = output_dir + '/' + images_save_subfolder
    //console.log(save_path);
    var filelist = dir(save_path)
    //console.log(filelist);

    filelist.forEach(function(save_file_name) {
        //console.log(save_file_name);

        var save_file_path =
            output_dir + '/' + images_save_subfolder + '/' + save_file_name

        //console.log('save_file_path: : '+save_file_path);

        var filename = path.parse(save_file_name).name
        var extention = path.parse(save_file_name).ext
        var processed_image_path =
            output_dir +
            '/' +
            processed_images_save_subfolder +
            '/' +
            filename +
            '-grayscale.gif'

        //console.log('processed_image_path: '+processed_image_path);

        convert_images(save_file_path, processed_image_path)
    })

    //------------------------------------------
    var sections_yaml = read(output_dir + '/section.yaml')
    if (sections_yaml == '') {
        console.log('sections_yaml is empty!!')
        return
    }
    var sections = yaml.safeLoad(sections_yaml)
    let index = 0

    sections.forEach(function(value) {
        let section_zero_num = `000${index}`.slice(-3)
        let index_articles = 0
        let articles = value['articles']
        articles.forEach(function(item) {
            let article_title = item['title']
            let article_path = item['path']
            let description = item['description']
            let author = item['author']
            var doc = read(output_dir + '/' + article_path)

            //-----------------------------------  href remove
            var $ =cheerio.load(doc)

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

            $('img').each(function() {
                var src = $(this).attr('src')
                //console.log('img src: ', src);
                var filename = path.parse(src).name
                var extention = path.parse(src).ext
                var processed_image_path =
                    processed_images_save_subfolder +
                    '/' +
                    filename +
                    '-grayscale.gif'

                let cwd = process.cwd()
                $(this).attr(
                    'src',
                    cwd + '/' + output_dir + '/' + processed_image_path
                    // output_dir + '/' + processed_image_path
                    // processed_image_path
                )
            })

            $('a').each(function() {
                if ($(this).hasClass('xref')) {
                    $(this).remove()
                }
                if ($(this).hasClass('indexterm')) {
                    $(this).remove()
                }
            })

            //-----------------------------------

            doc = '<body>\n\n' + $.html() + '\n\n</body>\n\n'

            fixup_html(doc)

            let item_zero_num = `000${index_articles}`.slice(-3)
            let item_path =
                'sections/' + section_zero_num + '/' + item_zero_num + '.html'

            var ndoc = add_head_tail_section(
                doc,
                article_title,
                description,
                author
            )

            ndoc = ndoc.replace(/<!DOCTYPE.*$/g, '')
            ndoc = ndoc.replace('&#13;', '')
            ndoc = ndoc.replace(/\n(\s*)\n|\n(\t*)\n/g, '\n')

            fs.writeFileSync('content/' + recipe_slug + '/' + item_path, ndoc)

            index_articles++
        })
        index++
    })

    let date = dateformat(Date.now(), 'yyyy-mm-dd')
    let date2 = dateformat(Date.now(), 'yyyy-mm-dd-hh/MM/ss')
    document_mobiinfo(
        recipe_slug + '-documetation-' + date, //uuid
        recipe_slug, //title
        'SUBJECT', //subject
        'AUTHOR', //author
        date2, //date
        recipe_slug + '.' + date + '.mobi' //out_filename
    )
}

async function http_get_file(url, save_file_path) {
    const _D = DEBUG('http_get_file')

    var outFile = fs.createWriteStream(save_file_path)

    var proxy_options = {
        host: '10.190.31.15',
        port: 8080,
        path: url,
        headers: {
            Host: 'www.google.com',
        },
    }
    let req
    let hostname = os.hostname()
	if (hostname == 'gsub') {                  // NO PROXY ENV
      if (url.match(/^https:/)) {
        req = https.get(url, function(res) {
            res.pipe(outFile)
            res.on('close', function() {
                outFile.close()
            })
        })
      } else if (url.match(/^http:/)) {
        req = http.get(url, function(res) {
            res.pipe(outFile)
            res.on('close', function() {
                outFile.close()
            })
        })
      } else {
          console.log('url error: '+url)
      }
    } else {                                      // PROXY ENV
      if (url.match(/^https:/)) {
	      /*
        req = https.get(proxy_options, function(res) {
            res.pipe(outFile)
            res.on('close', function() {
                outFile.close()
            })
        })
	       */
        let https_proxy_options = {
           url:  url,
           method: 'GET',
  	   proxy:  'http://10.190.31.15:8080/'

	}
		      /*
	      request
	         .get(https_proxy_options)
	      //.get(url)
	        .on('response', function (res) {
			    console.log('statusCode: ', res.statusCode);
			    console.log('content-length: ', res.headers['content-length']);
			  })
	      .pipe(outFile)
                  */
	       req = await doRequest(https_proxy_options, outFile)


      } else if (url.match(/^http:/)) {
        req = http.get(proxy_options, function(res) {
            res.pipe(outFile)
            res.on('close', function() {
                outFile.close()
            })
        })
      } else {
          console.log('url error: '+url)
      }
    } //endif
    req.on('error', function(err) {
        console.log('Error: ', err)
        return
    })
}

function doRequest(options,outFile) {
    const _D = DEBUG('doRequest')
  return new Promise(function (resolve, reject) {

              request
	          .get(options)
	          .on('response', function (res) {
                     if (res.statusCode == 200) {
	               resolve(res);
	              } else {
		       reject(res);
		      }
	               _D('statusCode: ', res.statusCode);
	               _D('content-length: ', res.headers['content-length']);
	            })
	          .pipe(outFile)
   });
}

function download_images(doc) {
    const _D = DEBUG('download_images')

    var $ = cheerio.load(doc)
    $('img').each(function() {
        let src = $(this).attr('src')
        let url 
        if (src.match(/^http/)) {
            url =  src
        } else {
            url = base_url + src
        }
        let save_file_name = path.basename(src)
        let save_file_path =
            output_dir + '/' + images_save_subfolder + '/' + save_file_name
            //_D('src: '+src);
        _D('url: '+url);
        //console.log('save_file_path: : '+save_file_path);
        http_get_file(url, save_file_path)

        var filename = path.parse(save_file_name).name
        var extention = path.parse(save_file_name).ext
        var processed_image_path =
            output_dir +
            '/' +
            processed_images_save_subfolder +
            '/' +
            filename +
            '-grayscale.gif'
        //console.log('processed_image_path: '+processed_image_path);
    })
}

function convert_images(source, dest) {
    const _D = DEBUG('convert_images')

    let param = [
        source,
        //          '-compose over',
        //             '-background white',
        //             '-flatten',
        //             '-resize \'300x200>\'',
        //             '-alpha off',
        dest,
    ]

    let child = child_process.execFile(
        'convert',
        param,
        (error, stdout, stderr) => {
            if (error) {
                console.error('stderr', stderr)
                throw error
            }
        }
    )
}

function fixup_html(doc) {
    const _D = DEBUG('fixup_html')

    var $ = cheerio.load(doc)

    $('dt').each(function() {
        $(this)
            .children()
            .first()
            .before('<br>')
    })

    $('li')
        .children('p')
        .each(function() {
            var tmp = $(this).children()
            $(this).replaceWith(tmp)
        })
}

function document_mobiinfo(uuid, title, subject, author, date, out_filename) {
    const _D = DEBUG('document_mobiinfo')

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
`

    //_document.yml
    fs.writeFileSync('content/' + recipe_slug + '/' + '_document.yaml', info)
}

function add_head_tail_section(doc, title, description, author) {
    const _D = DEBUG('add_head_tail_section')

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
   `

    let tail = '\n\n</html>'
    let new_doc = head + doc + tail
    return new_doc
}
/*
 *  Utility functions
 */

async function sleep(t) {
    return await new Promise(r => {
        setTimeout(() => {
            r()
        }, t)
    })
}

function check(filePath) {
    var isExist = false
    try {
        fs.statSync(filePath)
        isExist = true
    } catch (err) {
        isExist = false
    }
    return isExist
}

function dir_fullpath(Path) {
    const filenames = fs.readdirSync(Path)
    let PATH = Path.replace(/\/$/, '')
    let fullpath_list = []

    filenames.forEach(function(item) {
        fullpath_list.push(PATH + '/' + item)
    })

    return fullpath_list
}

function dir(Path) {
    const filenames = fs.readdirSync(Path)
    return filenames
}

function read(filePath) {
    var content = ''
    if (check(filePath)) {
        content = fs.readFileSync(filePath, 'utf8')
    } else {
        console.log('check error :' + filePath)
    }
    return content
}

function write(filePath, stream) {
    var result = false
    try {
        fs.writeFileSync(filePath, stream)
        return true
    } catch (err) {
        return false
    }
}
function mkdir(path) {
    if (!fs.existsSync(path)) {
        fs.mkdirSync(path)
    }
}

function rmdir(path) {
    if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach(function(file, index) {
            var curPath = path + '/' + file
            if (fs.lstatSync(curPath).isDirectory()) {
                // recurse
                rmdir(curPath)
            } else {
                // delete file
                fs.unlinkSync(curPath)
            }
        })
        fs.rmdirSync(path)
    }
}

function titlepage(doc) {
    const _D = DEBUG('titlepage')
    var path = 'articles/titlepage'
    //var content = doc.$('.titlepage').html()
                let content 
		if ( 'titlepage' in config['extract_sections']) {
                   content = doc.$(config['extract_sections']['titlepage']).html()
		 } else {
                   content = doc.$(config['body']).html()
		 }

    fs.writeFileSync('content/' + recipe_slug + '/' + path, content)
    return path
}

function save_content(filename) {
    const _D = DEBUG('save_content')
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
	const beautifyOptions = 
	{
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
	}
//var _path_ = 'articles/' + filename

    var _path_ = '';
    if (filename.match(/\/$/)) {
     _path_ = 'articles/' + filename + 'root.html'
    } else {
     _path_ = 'articles/' + filename
    }


    var url = base_url + filename

    var fullpath = 'content/'+recipe_slug + '/' + _path_;
    sh.mkdir('-p', path.dirname(fullpath));

    _D('fetch: '+url);
    client
        .fetch(url)
        .then(function(result) {
            result.$('.script').remove()
            result.$('.navfooter').remove()
            result.$('.navheader').remove()
            result.$('#vcws-footer').remove()
            result.$('#vcws-version-notice').remove()
            result.$('.toc').remove()
                //var content = result.$('body').html()
                //fs.writeFileSync('content/' + recipe_slug + '/' + _path_, content)
            
            var basename = path.basename(_path_);
            if (basename.match(/root\.html$/)) {
                let content 
		if ( 'save_content_tag' in config['extract_sections']) {
                   //case typesript Intro
                   content = result.$(config['extract_sections']['save_content_tag']).html()
		 } else {
                   // webpack  section
                   let head = result.$('h1')
                   let content1 = result.$('h1').parent().children('div').children('p').first()
                   let content2 = result.$('h1').parent().children('div').children('p').first().nextUntil('h2')
                    content = head.toString() + content1.toString() + content2.toString()
                }
		let out = beautify.html(content, beautifyOptions);
                fs.writeFileSync('content/' + recipe_slug + '/' + _path_, out )
            } else if (basename.match(/^#/)) {
                var head = result.$(basename)
                var head_tag = result.$(basename).get(0).tagName
                var content = result.$(basename).nextUntil(head_tag)
                var all = head.toString() + content.toString()
		let out = beautify.html(all, beautifyOptions);
                fs.writeFileSync('content/' + recipe_slug + '/' + _path_, out )
              
            } else {
                let content 
		if ( 'save_content_tag' in config['extract_sections']) {
                   content = result.$(config['extract_sections']['save_content_tag']).html()
		 } else {
                   content = result.$(config['body']).html()
		 }
		let out = beautify.html(content, beautifyOptions);
                fs.writeFileSync('content/' + recipe_slug + '/' + _path_, out)

            }
            
        })
        
        .catch(function(err) {
            console.error(C.red('ERROR'), err)
        })
        .finally(function() {})

    return _path_
}
