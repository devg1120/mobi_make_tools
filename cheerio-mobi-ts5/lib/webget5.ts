//import  chalk from 'chalk';
import  C from 'chalk';
import client from 'cheerio-httpcli'
import cheerio from 'cheerio'

//import * as fs from 'fs-extra'
import os from 'os'
import fs from 'fs'
import path  from 'path'
import yaml  from 'js-yaml'
import http  from 'http'
import process from 'process';
import Jimp from 'jimp';
import * as child_process from "child_process";
import sh from 'shelljs';
import hd from 'handlebars'
import dateformat from 'dateformat'


var top_dir = '';
var output_dir = '';
var images_save_subfolder = '';
var processed_images_save_subfolder = '';
var recipe_slug = '';
var base_url = '';
var index_url = '';
var STYLESHEET = '';

var extract_sections_end = false;

export default async function webget5(subcmd: string, 
                                  dist_filepath: string,
                                  values: any
                                 ) {

     var cwd = sh.pwd();
     STYLESHEET = cwd+"/css/kindle.css";
     console.log(STYLESHEET);

     console.log("webget5 kick!!!");
     console.log("subcmd: " +subcmd);
     recipe_slug = 'svn';
     base_url = 'http://svnbook.red-bean.com/en/1.7/';
     index_url = 'http://svnbook.red-bean.com/en/1.7/index.html';
     top_dir = 'content';
     output_dir = top_dir + '/' + recipe_slug


     images_save_subfolder = 'images';
     processed_images_save_subfolder = 'processed_images';

     //----------------------------------------
     if (subcmd == "init") {   

       rmdir(output_dir);
  
       mkdir(top_dir);
       mkdir(output_dir);
       mkdir(output_dir + '/articles');
       mkdir(output_dir + '/sections');
       mkdir(output_dir + '/' + images_save_subfolder);
       mkdir(output_dir + '/' + processed_images_save_subfolder);
       //mkdir(output_dir + '/processed_images');
     

     } else if ( subcmd == "gets" ) {

       gets_extract_sections();

     } else if ( subcmd == "build" ) {

        build_kindlerb_tree();

     } else if ( subcmd == "conv" ) {

        conv_kindlerb_tree();

     } else if ( subcmd == "gene" ) {

        gen_kindler_mobi();

     } else if ( subcmd == "help" ) {

          console.log("   init");
          console.log("   gets");
          console.log("   build");
          console.log("   conv");
          console.log("   gene");

     } else {
        console.log("unknown subcmd: " + subcmd);
     }

 };

function  gen_kindler_mobi(){

  // template set
  let  opf_template      = fs.readFileSync("mobi_templates/opf.mustache")
  let  ncx_template      = fs.readFileSync("mobi_templates/ncx.mustache")
  let  contents_template = fs.readFileSync("mobi_templates/contents.mustache")
  let  section_template  = fs.readFileSync("mobi_templates/section.mustache")

  // gif filepath set
  let  masthead_gif      = "mobi_templates/masthead.gif"
  let  cover_gif         = "mobi_templates/cover-image.gif"

  let images = []
  let manifest_items = []
  let playorder = 1

  var document_yaml = read(output_dir +  '/_document.yaml'); 

  if ( document_yaml == "") {
      console.log("_document_yaml is empty!!"); 
      return
  }
  var document = yaml.safeLoad(document_yaml);
  document['spine_items'] = [];
  let section_html_files = [];

  //----------------------------------
   
   var sections_list = dir_fullpath( output_dir + '/sections');

   /*
    *   SECTIONS 
    */

   let index = 0;
   let SECTIONS = [];

   sections_list.forEach(function(section_dir) {
    let _section_dir_ = section_dir.substring(output_dir.length + 1);
    //console.log("---  section_dir :"+section_dir);
    //console.log("=== _section_dir_:"+_section_dir_);

    let SECTION = {};
    let c = read( section_dir + '/_section.txt');
    let section_title = c.trim();
    var tmp_list = dir_fullpath( section_dir);
    var articles_list = [];
    tmp_list.forEach(function(entry) {
          let filename = path.basename(entry);
          if (filename == 'section.html' || filename == '_section.txt') {

          } else {
            articles_list.push(entry);
         }

     });


     var section_html_file =  _section_dir_ + '/section.html'  //--
     section_html_files.push(section_html_file);
     let idref = "item-" + _section_dir_.replace(/\D/g,'');                            //^^
     document['spine_items'].push({idref : idref});0

     manifest_items.push(
      {
        href : section_html_file,
        media : "application/xhtml+xml",
        idref : idref
      }
     );

     playorder++;
     SECTION['playorder']   =  playorder;

     /*
      * ARTICLES
      */

     let ARTICLES =[];

     articles_list.forEach(function(file) {
        let _file_ = file.substring(output_dir.length + 1);
	     //console.log("   *** file :"+file);
	     //console.log("   +++_file_:"+_file_);

             let ARTICLE = {};
             let doc = read(file);

             let article_images = [];
             var $ = cheerio.load(doc);
             $('img').each(function() {
                  var src = $(this).attr('src');
                  var filename = path.basename(src);
                  var extention = path.parse(src).ext.replace('.','');
                  var mimetype = {
                  href: src,
                  //href: output_dir + '/images/' + filename,
                      mimetype:  "image/" + extention
                  };
                  article_images.push(mimetype);
             });

             if (article_images.length > 0) {
               images.push(article_images);
             }

             let title = "no title";
             var tmp =  $('html').children('head').children('title').text();
             if (tmp != "") {
                 title = tmp;
             } 

             //let idref = "item-" + _file_;                            //^^
             let idref = "item-" + _file_.replace(/\D/g,'');                            //^^
             document['spine_items'].push({idref : idref});

             var author =  $('html').children('head').children('meta[name="author"]').prop('content');
             var description =  $('html').children('head').children('meta[name="description"]').prop('content');


             playorder++;
             ARTICLE['file']        = _file_;                 //--
             ARTICLE['href']        = _file_;                 //--
             ARTICLE['title']       = title;
             ARTICLE['short_title'] = title.substr(0,60);
             ARTICLE['author']      = author;
             ARTICLE['description'] = description;
             ARTICLE['playorder']   = playorder
             ARTICLE['idref']       = idref;

             ARTICLES.push(ARTICLE);

             manifest_items.push( {
             href  : ARTICLE['file'],                    
                media : "application/xhtml+xml",
                idref : ARTICLE['idref']
              });
      });  // ARTICLES END



     SECTION['path']        =  _section_dir_;                   //--
     SECTION['title']       =  section_title.substr(0,40);
     SECTION['idref']       =  idref;
     SECTION['href']        =  _section_dir_ + '/section.html';  //--
     SECTION['articles']    =  ARTICLES;

     // handlebars template opration
     let template = hd.compile(section_template.toString());
     let dist = template(SECTION);

	   //console.log("*********************: "+ output_dir + '/' +section_html_file);
     write(output_dir +'/' + section_html_file,dist);
      

     index++;
     SECTIONS.push(SECTION);

   });  // SECTIONS END

   document['sections']         = SECTIONS;
   document['first_article']    = SECTIONS[0]['articles'][0]
   let idx = 0;
   images.forEach(function(img) {
      let zero_num = `000${idx}`.slice(-3);
      manifest_items.push(
        {
         href  :  img[0]['href'],
         media :  img[0]['mimetype'],
         idref :  "img-"  + zero_num
	}
      );
   idx++;
   });

   document['manifest_items']  = manifest_items
   document['cover_mimetype']  = "image/gif"

   /// OPF
     let opf_template_c = hd.compile(opf_template.toString());
     let opf = opf_template_c(document);
     let opf_path = output_dir + "/kindlerb.opf"
     write(opf_path, opf);

   /// NCX
     let ncx_template_c = hd.compile(ncx_template.toString());
     let ncx = ncx_template_c(document);
     let ncx_path = output_dir + "/nav-contents.ncx"
     write(ncx_path, ncx);

   /// CONTENTS
     let contents_template_c = hd.compile(contents_template.toString());
     let contents = contents_template_c(document);
     let contents_path = output_dir + "/contents.html"
     write(contents_path, contents);

  /// MOBI
     let outfile = document['mobi_outfile'] 
     let infile = output_dir + "/kindlerb.opf"
	//console.log("outfile: " + outfile);

	//console.log(dateformat(Date.now(), "dddd, mmmm dS, yyyy, h:MM:ss TT")  );
	//console.log(dateformat(Date.now(), "yyyy-mm-dd-hhMMss")  );

     let _infile_ = infile.substring(output_dir.length + 1);
     let command = `kindlegen ${infile} -verbose -c2 -o ${outfile} | tee kindlegen.log`

	//console.log("infile : " + infile);
	//console.log("outfile: " + outfile);
	//console.log("command: \n" + C.green(command));

     child_process.exec(command, (error, stdout, stderr) => {
       if ( error instanceof Error) {
            //console.log(stdout);
            //console.error(error);
	     console.log(C.red('**** Error'));
        } else {
            //console.log(stdout);
            console.log('... Success!');
    } 
    }).stdout.pipe(process.stdout);;
}

function gets_extract_sections() {    
     
   try {
     client.fetch(index_url)
     .then(  function (result) {
       var titlepath = titlepage(result);
       var xs = [];
        xs.push(  {
                 title: 'Frontmatter',
                 articles: [ { title: 'Title Page', path: titlepath } ]
                });
       //console.dir(xs);
       var $a = result.$('.toc a');
       $a.each( function () {
         var $url = result.$(this).attr('href');
         if ($url.match(/html$/)) {
           if ($url.match(/svn\.[a-z]+\.html/)) {
              //section
              var savepath =  result.$(this).attr('href');
              xs.push(  {
                    title: result.$(this).text(), 
                    articles:[
                      {
                        title: result.$(this).text(), 
                        path: save_article(savepath)
                      }
                    ]
                  });
           } else {
              //article
              var savepath =  result.$(this).attr('href');
              xs[xs.length -1].articles.push( {
                                      title : result.$(this).text() ,
                                      path: save_article(savepath)
                                    });
                       
           }
         }
       });
 
       const yamlText = yaml.dump(xs);
             
       fs.writeFile(output_dir +  '/section.yaml', yamlText, 'utf8', async function (err) {
	       //console.log("write end...");

      if (err) {
        console.log(err);
      }
   }); 


       extract_sections_end = true;

     })
     .catch(function (err) {
       console.error(C.red('ERROR'), err);
     })
     .finally(function () {
       console.info(C.cyan('INFO'), 'scraping end...');
     });
     
     //----------------------------------------
   } catch(error) {
     //console.log(chalk.red(`failed to read ${error}`))
     console.log(C.red(`failed to read ${error}`))
     return null;
   }
}

function build_kindlerb_tree() {
  
   console.log("build_kindlerb_tree start");
   var sections_yaml = read(output_dir +  '/section.yaml');
   if ( sections_yaml == "" ) {
     console.log("sections_yaml is empty!!");
     return;
   }
   var sections = yaml.safeLoad(sections_yaml);
	//console.log(sections);
   let index = 0;

   sections.forEach(function(value) {
     let zero_num = `000${index}`.slice(-3);
     let title = value['title'];
	   //console.log(zero_num);
	   //console.log(title);
     mkdir(output_dir+ '/sections/' + zero_num);
     write(output_dir+ '/sections/' + zero_num + '/_section.txt', title);

     let index_articles = 0;
     let articles = value['articles'];
         articles.forEach(function(item) {
             let article_title  = item['title'];
             let article_path   = item['path'];
             var doc = read(output_dir + '/' + article_path);
             download_images(doc);
             index_articles++;
       });

   index++;

   });
}

function conv_kindlerb_tree() {

 var save_path  = output_dir +'/' +  
                 images_save_subfolder ;
	//console.log(save_path);
 var filelist = dir(save_path);
	//console.log(filelist);

 filelist.forEach(function( save_file_name ) {
	 //console.log(save_file_name);
 

 var save_file_path  = output_dir +'/' +  
                 images_save_subfolder + '/' + save_file_name;

	 //console.log('save_file_path: : '+save_file_path);

 var filename = path.parse(save_file_name).name;
 var extention = path.parse(save_file_name).ext;
 var processed_image_path = output_dir +'/' +　
      processed_images_save_subfolder + '/' + filename + '-grayscale.gif'

	 //console.log('processed_image_path: '+processed_image_path);

 convert_images(save_file_path, processed_image_path);
 
 });

 //------------------------------------------
    var sections_yaml = read(output_dir +  '/section.yaml');
   if ( sections_yaml == "" ) {
     console.log("sections_yaml is empty!!");
     return;
   }
   var sections = yaml.safeLoad(sections_yaml);
   let index = 0;

   sections.forEach(function(value) {
   
     let section_zero_num = `000${index}`.slice(-3);
     let index_articles = 0;
     let articles = value['articles'];
         articles.forEach(function(item) {
             let article_title  = item['title'];
             let article_path   = item['path'];
             let description    = item['description'];
             let author         = item['author'];
              var doc = read(output_dir + '/' + article_path);

             //-----------------------------------  href remove
             var $ = cheerio.load(doc);
             $('img').each(function() {
                 var src = $(this).attr('src');
		     //console.log('img src: ', src);
                 var filename = path.parse(src).name;
                 var extention = path.parse(src).ext;
                 var processed_image_path = 
                 processed_images_save_subfolder + '/' + filename + '-grayscale.gif'

                 let cwd = process.cwd();
                 $(this).attr('src',cwd + '/' + output_dir + '/' + processed_image_path);

             });

             $('a').each(function() {
                    if (  $(this).hasClass('xref')) {
                      $(this).remove();
                    }
                    if (  $(this).hasClass('indexterm')) {
                      $(this).remove();
                    }
             });

              //-----------------------------------
               
              doc = "<body>\n\n" + $.html() + "\n\n</body>\n\n";

              fixup_html(doc);

              let item_zero_num = `000${index_articles}`.slice(-3);
              let item_path = "sections/" + section_zero_num + "/"+ item_zero_num + ".html";

              var ndoc = add_head_tail_section(doc, article_title, description, author);

             ndoc =  ndoc.replace(/<!DOCTYPE.*$/g, '');
             ndoc =  ndoc.replace('&#13;', '');
             ndoc =ndoc.replace(/\n(\s*)\n|\n(\t*)\n/g,'\n');

             fs.writeFileSync('content/'+recipe_slug + '/' + item_path, ndoc);

          index_articles++;
       });
   index++;
   });

      
     let date = dateformat(Date.now(), "yyyy-mm-dd");
     let date2 = dateformat(Date.now(), "yyyy-mm-dd-hh/MM/ss");
     document_mobiinfo(
                               recipe_slug + "-documetation-" + date, //uuid
                               recipe_slug,                           //title
                               "SUBJECT",                             //subject
                               "AUTHOR",                              //author
                               date2 ,                                //date
                               recipe_slug + '.' + date + '.mobi'     //out_filename
                             );
     

}

function http_get_file( url,  save_file_path) {

    var outFile = fs.createWriteStream(save_file_path);
    
var options = {
  host: "10.190.31.15",
  port: 8080,
  path: url,
  headers: {
    Host: "www.google.com"
  }
};
    var req ;
    var hostname = os.hostname();
    if ( hostname == "gsub") {
     req = http.get(url, function (res) {
        res.pipe(outFile);
        res.on('close', function () {
            outFile.close();
        }); 
    });
    } else {
     req = http.get(options, function (res) {
    
        res.pipe(outFile);
        res.on('close', function () {
            outFile.close();
        }); 
    });
    } //endif   
    req.on('error', function (err) {
        console.log('Error: ', err); return;
    });
    
}


function download_images(doc) {
   var $ = cheerio.load(doc);
   $('img').each(function() {
              var src = $(this).attr('src');
              var url = base_url + src;
              var save_file_name  = path.basename(src);
              var save_file_path  = output_dir +'/' +  images_save_subfolder + '/' + save_file_name;
	   //console.log('src: '+src);
	   //console.log('url: '+url);
	   //console.log('save_file_path: : '+save_file_path);
              http_get_file(url, save_file_path);

              var filename = path.parse(save_file_name).name;
              var extention = path.parse(save_file_name).ext;
              var processed_image_path = output_dir +'/' +　processed_images_save_subfolder + '/' + filename + '-grayscale.gif'
	   //console.log('processed_image_path: '+processed_image_path);


   });

}

function convert_images(source, dest) {
    let param = [source,
    //          '-compose over',
    //             '-background white',
    //             '-flatten',
    //             '-resize \'300x200>\'',
    //             '-alpha off',
                  dest];

    let child = child_process.execFile("convert", param, (error, stdout, stderr) => {

        if (error) {
            console.error("stderr", stderr);
            throw error;
        }
    });

}

function fixup_html(doc) {

   var $ = cheerio.load(doc);

   $('dt').each(function() {
      $(this).children().first().before('<br>');
   });

   $('li').children('p').each(function() {
      var tmp = $(this).children();
      $(this).replaceWith(tmp);
   });

}

function document_mobiinfo(uuid, title, subject,  
                           author, date, out_filename) {
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
  fs.writeFileSync('content/'+recipe_slug + '/' + '_document.yaml', info);
}

function add_head_tail_section(doc, title, description, author) {

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

  let tail = "\n\n</html>"
   let new_doc = head + doc + tail;
   return new_doc;


}
/*
 *  Utility functions
 */

async function sleep(t) {
  return await new Promise(r => {
    setTimeout(() => {
      r();
    }, t);
  });
}

function check(filePath) {
  var isExist = false;
  try {
    fs.statSync(filePath);
    isExist = true;
  } catch(err) {
    isExist = false;
  }
  return isExist;
}

function dir_fullpath(Path) {
 const filenames = fs.readdirSync(Path);
 let PATH = Path.replace(/\/$/,'');
 let fullpath_list = [];

 filenames.forEach(function(item) {
  fullpath_list.push(PATH + '/' + item);

  });

  return fullpath_list;
}

function dir(Path) {
 const filenames = fs.readdirSync(Path);
 return filenames;
}

function read(filePath) {
  var content  = '';
  if(check(filePath)) {;
    content = fs.readFileSync(filePath, 'utf8');
  } else {
    console.log("check error :" +  filePath);
 }
  return content;
};

function write(filePath, stream) {
  var result = false;
  try {
    fs.writeFileSync(filePath, stream);
    return true;
  } catch(err) {
    return false;
  }
}
function mkdir(path) {
  if( !(fs.existsSync(path)) ) {
         fs.mkdirSync(path);
  }
}

function rmdir(path) {
  if( fs.existsSync(path) ) {
    fs.readdirSync(path).forEach(function(file,index){
      var curPath = path + "/" + file;
      if(fs.lstatSync(curPath).isDirectory()) { // recurse
        rmdir(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};

function titlepage(doc) {

  var path = 'articles/titlepage'
  var content = doc.$('.titlepage').html();
   fs.writeFileSync('content/'+recipe_slug + '/' + path, content);
  return path;
}

function save_article (filename) {
   var path = 'articles/' + filename;
   var url = base_url + filename;

    client.fetch(url)
     .then(function (result) {
           result.$('.script').remove();
           result.$('.navfooter').remove();
           result.$('.navheader').remove();
           result.$('#vcws-footer').remove();
           result.$('#vcws-version-notice').remove();
           result.$('.toc').remove();
           var content = result.$('body').html();
           fs.writeFileSync('content/'+recipe_slug + '/' + path, content);

     })
     .catch(function (err) {
       console.error(C.red('ERROR'), err);
     })
     .finally(function () {
     });

     return path
}
