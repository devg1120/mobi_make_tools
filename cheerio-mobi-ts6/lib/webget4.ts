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
import Jimp from 'jimp';
import * as child_process from "child_process";

var top_dir = '';
var output_dir = '';
var images_save_subfolder = '';
var processed_images_save_subfolder = '';
var recipe_slug = '';
var base_url = '';
var index_url = '';

var extract_sections_end = false;

export default async function webget4(source_filepath: string, 
                                  dist_filepath: string,
                                  values: any
                                 ) {


     console.log("webget4 kick!!!");
     recipe_slug = 'svn';
     base_url = 'http://svnbook.red-bean.com/en/1.7/';
     index_url = 'http://svnbook.red-bean.com/en/1.7/index.html';
     top_dir = 'content';
     output_dir = top_dir + '/' + recipe_slug

     images_save_subfolder = 'images';
     processed_images_save_subfolder = 'processed_images';

     //----------------------------------------
     rmdir(output_dir);
/*
     fs.mkdirSync(top_dir);
     fs.mkdirSync(output_dir);
     fs.mkdirSync(output_dir + '/articles');
     fs.mkdirSync(output_dir + '/sections');
     fs.mkdirSync(output_dir + '/images');
     fs.mkdirSync(output_dir + '/processed_images');
*/

     mkdir(top_dir);
     mkdir(output_dir);
     mkdir(output_dir + '/articles');
     mkdir(output_dir + '/sections');
     mkdir(output_dir + '/' + images_save_subfolder);
     mkdir(output_dir + '/' + processed_images_save_subfolder);
     //mkdir(output_dir + '/processed_images');

     console.log("start extract_sections");
     extract_sections();
     console.log("next");
     await sleep(9000);
     build_kindlerb_tree();
/*
     extract_sections(build_kindlerb_tree).then( result => {
           build_kindlerb_tree();
     });;
 */    
//     while (!extract_sections_end) {
//       sleep(1000);
//    }

//     console.log("start build_kindlerb_tree");
//     build_kindlerb_tree();
//

 };

 //function extract_sections(aftertask) {    
function extract_sections() {    
     
   try {
     //base_url = 'http://svnbook.red-bean.com/en/1.7/';
     // fetch start
     //client.fetch('http://svnbook.red-bean.com/en/1.7/index.html')
     client.fetch(index_url)
     .then(  function (result) {
       var titlepath = titlepage(result);
       var xs = [];
        xs.push(  {
                 title: 'Frontmatter',
                 articles: [ { title: 'Title Page', path: titlepath } ]
                });
       console.dir(xs);
       var $a = result.$('.toc a');
       $a.each( function () {
         var $url = result.$(this).attr('href');
         if ($url.match(/html$/)) {
           if ($url.match(/svn\.[a-z]+\.html/)) {
              //section
              //console.log('S:' + $url);
              //console.log('  ' + result.$(this).text());
              var savepath =  result.$(this).attr('href');
              xs.push(  {
                    title: result.$(this).text(), 
                    articles:[
                      {
                        title: result.$(this).text(), 
                        //title: $a.text().gsub(/\s{2,}/, ' ').strip, 
                        path: save_article(savepath)
                      }
                    ]
                  });
           } else {
              //article
              //console.log(' A:' + $url);
              var savepath =  result.$(this).attr('href');
              xs[xs.length -1].articles.push( {
                                      title : result.$(this).text() ,
                                      path: save_article(savepath)
                                    });
                       
           }
         }
       });
 
       //console.log(xs);
       const yamlText = yaml.dump(xs);
             
       fs.writeFile(output_dir +  '/session.yaml', yamlText, 'utf8', async function (err) {
       console.log("write end...");
       //await sleep(5000);
       // aftertask();
    if (err) {
        console.log(err);
    }
}); 


//    fs.writeFileSync(output_dir +  '/session.yaml', yamlText, 'utf8');

    console.log("The file was saved!");
       extract_sections_end = true;
    //aftertask();
     })
     .catch(function (err) {
       console.error(C.red('ERROR'), err);
     })
     .finally(function () {
       //$imgs.each(function () {
       console.info(C.cyan('INFO'), 'スクレイピングが終了しました');
       //extract_sections_end = true;
       //aftertask();
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
   var sections_yaml = read(output_dir +  '/session.yaml');
   if ( sections_yaml == "" ) {
     console.log("sections_yaml is empty!!");
     return;
   }
   var sections = yaml.safeLoad(sections_yaml);
   console.log(sections);
   let index = 0;

   sections.forEach(function(value) {
     let zero_num = `000${index}`.slice(-3);
     let title = value['title'];
     console.log(zero_num);
     console.log(title);
     mkdir(output_dir+ '/sections/' + zero_num);
     write(output_dir+ '/sections/' + zero_num + '/_section.txt', title);

     let index_articles = 0;
     let articles = value['articles'];
         articles.forEach(function(item) {
             let article_title  = item['title'];
             let article_path   = item['path'];
                //console.log(article_title + ' ->' + article_path);
              var doc = read(output_dir + '/' + article_path);
              download_images(doc);

              //var doc  = fs.readFileSync(output_dir + '/' + article_path, 'utf8');
              //console.log(doc);
              //var $ = cheerio.load(doc);



          index_articles++;
       });


   index++;

   });
   //convert_images('content/svn/images/note.png','content/svn/processed_images/note-grayscale.gif');
}

function http_get_file( url,  save_file_path) {

    // 出力ファイル名を指定
    var outFile = fs.createWriteStream(save_file_path);
    
var options = {
  host: "10.190.31.15",
  port: 8080,
  path: url,
  headers: {
    Host: "www.google.com"
  }
};
    // ダウンロード開始
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
        //res.on('end', function () {
        res.on('close', function () {
            outFile.close();
        }); 
    });
    } //endif   
    // エラーがあれば扱う。
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
              console.log('src: '+src);
              console.log('url: '+url);
              console.log('save_file_path: : '+save_file_path);
              http_get_file(url, save_file_path);

              var filename = path.parse(save_file_name).name;
              var extention = path.parse(save_file_name).ext;
              var processed_image_path = output_dir +'/' +　processed_images_save_subfolder + '/' + filename + '-grayscale.gif'
              console.log('processed_image_path: '+processed_image_path);

               //ここでやればDL失敗
              //convert_images(save_file_path, processed_image_path);

/*
Jimp.read(url)
  .then(image => {
     //Do stuff with the image.
     image
      .greyscale() // set greyscale
      .write(processed_image_path); // save
  })
  .catch(err => {
    // Handle an exception.
    console.log("jimp err!!");
    console.log(err);
  });
*/

  /*           
Jimp.read(save_file_path)
  .then(image => {
    // Do stuff with the image.
     image
      .greyscale() // set greyscale
      .write(processed_image_path); // save
  })
  .catch(err => {
    // Handle an exception.
    console.log("jimp err!!");
    console.log(err);
  });
*/


   });

}

function convert_images(source, dest) {
    //let param = `${source} -compose over -background white -flatten -resize '300x200>' -alpha off ${dist}`;
    let param = [source,
                 '-compose over',
                 '-background white',
                 '-flatten',
                 '-resize \'300x200>\'',
                 '-alpha off',
                  dest];

    //let child = child_process.execFile("ls", ["-l"], (error, stdout, stderr) => {
    let child = child_process.execFile("convert", param, (error, stdout, stderr) => {

        if (error) {
            console.error("stderr", stderr);
            throw error;
        }
        console.log(stdout);
        console.log("pid: " +child.pid);
    });

/*
Jimp.read('content/svc/images/tip.png')
  .then(image => {
    // Do stuff with the image.
     image
      .greyscale() // set greyscale
      .write('content/svc/processed_images/tip-grayscale.gif'); // save
  })
  .catch(err => {
    // Handle an exception.
    console.log("jimp err!!");
    console.log(err);
  });
*/
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

function read(filePath) {
  //var content = new String();
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
        //deleteFolderRecursive(curPath);
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
  //var content = doc.$('.titlepage').text();
  var content = doc.$('.titlepage').html();
  //console.log('titlepage:' + content);
   //fs.mkdirSync('content/');
   //fs.mkdirSync('content/'+ recipe_slug);
   //fs.mkdirSync('content/'+ recipe_slug + '/articles');
   fs.writeFileSync('content/'+recipe_slug + '/' + path, content);
  return path;
}

function save_article (filename) {
   var path = 'articles/' + filename;
//   console.log('savepath:'+ path);
   var url = base_url + filename;

    //client.fetch('http://svnbook.red-bean.com/en/1.7/index.html')
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
       //$imgs.each(function () {
       //console.info(C.cyan('INFO'), 'スクレイピングが終了しました');
     });

     return path
}
