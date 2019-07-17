/**
 * 启动方式
 * node index.js
 * http://127.0.0.1:8800/wap
 * @type {module:http}
 */
const http=require('http');
//fs module
const fs = require('fs');
// path module
const path = require('path');
const mime = require('mime');
const moment = require('moment');
const server = http.createServer();

const __HTML_PATH__ = 'E:\\';
// 文件目录html拼接,以后改成模板
function getDirFileList(strDir,url){

    let files  = fs.readdirSync( strDir );
    let title = path.parse(url).dir;
    if ( path.parse(url).base != '' ){
        title = title +path.parse(url).base;
    }
    let strHtml = '<html>\n' +
        '<head><title>Index of '+title+'</title>\n' +
        '    <meta http-equiv="content-type" content="text/html; charset=utf-8"/>\n' +
        '</head>\n' +
        '<body>\n' +
        '<h1>Index of '+title+'</h1>\n' +
        '<hr>\n' +
        '<pre>\n';

    // console.log ( '1:'+path.parse(url).dir );
    // console.log ( '2:'+path.parse(url).base );
    let strPathHtml  = '';
    strPathHtml += '<div>\n';
    //顶部显示 ../
    strPathHtml += '<a href="'+path.join( path.parse(url).dir )+'">../</a>'+'\n';
    for(let strPath of files){
        try{
            //iberfil.sys是一个将休眠数据保存到磁盘上的系统文件，不能只是通过正常的权限来读取它，因为它拥有磁盘上的所有内存信息，所以它是超级机密的。
            if ( strPath == 'hiberfil.sys')
                break;
            //目录后面加上/
            let stats = fs.statSync(path.join(strDir,strPath));
            if ( stats.isDirectory() ){
                strPath = strPath + '/';
            }
            let formatDate = moment( stats.atimeMs ).format('YYYY-MM-DD HH:mm:ss'); /*格式化时间*/
            let fileSizeNum = stats.size.toString();

            if ( fileSizeNum == 0)
            {
                fileSizeNum = '-';
            }else{
                // if ( parseInt(fileSizeNum) / ( 1024*1024*1024 ) > 1 )
                // console.log( parseInt(fileSizeNum) / ( 1024*1024*1024 )  );
                // 文件大小计算闭包函数
                fileSizeNum =   (function () {
                    if ( parseInt(fileSizeNum) < 1024 ) // 大于 1K
                    {
                        fileSizeNum += 'B';
                        return fileSizeNum;
                    }
                    if (  parseInt(fileSizeNum) / (1024 * 1024 * 1024 ) > 1 ) // 大于1G
                    {
                        fileSizeNum = parseFloat(  (fileSizeNum / (1024 * 1024 * 1024 )).toFixed(2) )  + 'GB';
                        return fileSizeNum;
                    }
                    if ( parseInt(fileSizeNum) / (1024 * 1024) > 1 ) // 大于1M
                    {
                        fileSizeNum = parseInt(parseInt(fileSizeNum ) / (1024 * 1024) )  + 'MB';
                        return fileSizeNum;
                    }
                    if ( parseInt(fileSizeNum) / 1024>= 1 ) // 大于 1K
                    {
                        fileSizeNum = parseInt(parseInt(fileSizeNum) / 1024 ) + 'KB';
                        return fileSizeNum;
                    }

                    return fileSizeNum+'';
                })();
            }
            //计算中文标题长度
            let tmpStr = strPath.replace(/[\u4e00-\u9fa5]/gi,"aa");

            //计算空格
            let fileNameSpaceNum = 0;
            let fileSzieSpaceNum = 0;
            fileNameSpaceNum = 100 - tmpStr.length;
            fileSzieSpaceNum = 30 - fileSizeNum.length;
            const bufFileName = Buffer.alloc(fileNameSpaceNum, ' ');
            const bufFileSize = Buffer.alloc(fileSzieSpaceNum, ' ');
            strPathHtml += '<a href="'+path.join(url,strPath)+'">'+strPath+'</a>'+bufFileName.toString()+formatDate+bufFileSize.toString()+fileSizeNum+'\n';

        }catch(err){
            let errorMsg
                = '\n'
                + 'Error ' + new Date().toISOString() + ' ' + url
                + '\n'
                + err.stack || err.message || 'unknow error'
                + '\n'
            ;

            console.error(errorMsg);
            // res.end('<pre>' + errorMsg + '</pre>');
            break;
        }
    }
    strPathHtml += '</div>\n';
    strHtml += strPathHtml;
    strHtml += '</pre>\n' +
        '<hr>\n' +
        '</body>\n' +
        '</html>';
    return strHtml;
}

server.on('request',(req,res)=>{
    // get url
    let url = decodeURI(req.url);
    let urlLength = url.toString().length;
    let endChart =  url.substr(urlLength-1,1);

    try{
    //判断路径是否存在
    if ( fs.existsSync( path.join(__HTML_PATH__,url) )){
        if(  endChart == '/' ) { //判断最后一个为/
            if ( fs.existsSync( path.join(__HTML_PATH__,url,'index.html') ) ){
                url = url + 'index.html';//最后为/变成/index.html默认首页
            }
            else{//文件目录列表访问模式
                let strPathHtml = getDirFileList( path.join(__HTML_PATH__,url) ,url);
                res.writeHead(200,{
                    "Content-Type":'text/html; charset=UTF-8',
                    "server":'nodejs'
                })
                res.end(strPathHtml);
            }
        }
        else{
            // console.log(path.join(__HTML_PATH__,url));
            let stats = fs.statSync(path.join(__HTML_PATH__,url));
                // console.log(stats);
                // console.log("读取文件信息成功！");

                // 检测文件类型
                // console.log("是否为目录(isDirectory) ? " + stats.isDirectory());
                if ( stats.isDirectory() ){
                    res.writeHead(200,{
                        "Content-Type":'text/html; charset=UTF-8',
                        "server":'nodejs'
                    })
                    let strPathHtml = getDirFileList( path.join(__HTML_PATH__,url) ,url);
                    // console.log(strPathHtml);
                    res.end(strPathHtml);
                }
         }
    }
    }catch(err){
        let errorMsg
            = '\n'
            + 'Error ' + new Date().toISOString() + ' ' + url
            + '\n'
            + err.stack || err.message || 'unknow error'
            + '\n'
        ;

        console.error(errorMsg);
        res.end('<pre>' + errorMsg + '</pre>');
    }
    try{
    // 文件流输出
    let srcpath = path.join(__HTML_PATH__,url);
    if( fs.existsSync(srcpath) && fs.statSync(srcpath).isFile()){
        let type = mime.getType(url);
        // if(type.includes("text")) type=`${type}; charset=utf8`
        console.log(type);
        let stats = fs.statSync(path.join(__HTML_PATH__,url));
        if ( stats.size < 10 * 1024 * 1024  )//小于10M根据type显示
        {
            //文件下载用头multipart/form-data
            res.writeHead(200,{
                "Content-Type":type,
                "server":'nodejs'
            })
        }
        else{
            //文件下载用头multipart/form-data
            console.log(type);
            res.writeHead(200,{
                "Content-Type":"multipart/form-data",
                "server":'nodejs'
            })
        }

        fs.createReadStream(srcpath).pipe(res);
    }else{
        res.writeHead(404);
        res.end("404");
    }
    }catch(err){
        let errorMsg
            = '\n'
            + 'Error ' + new Date().toISOString() + ' ' + url
            + '\n'
            + err.stack || err.message || 'unknow error'
            + '\n'
        ;

        console.error(errorMsg);
        res.end('<pre>' + errorMsg + '</pre>');
    }
})
server.listen(8800,()=>{
    console.log("nodejs web static html...");
    console.log("http://localhost:8800/");
})

/*
// 静态文件输出
fs.readFile(path.join(__HTML_PATH__,url),(err,data)=>{
    // console.log( path.join('E:\\svn\\puyuba_promotion\\',url ).toString() );
    //error message
    if(err){
        res.writeHead(404)
        return res.end(err.message)
    };
    let type = mime.getType(url);
    if(type.includes("text")) type=`${type}; charset=utf8`
        res.writeHead(200,{
            "Content-Type":type,
            "server":'nodejs'
        })
    // return client
    res.end(data);
    })
    */
/*
http://mirrors.ustc.edu.cn/alpine/

<html>
<head><title>Index of /alpine/</title></head>
<body>
<h1>Index of /alpine/</h1>
<hr>
<pre>
<a href="../">../</a>
<a href="edge/">edge/</a>                                              30-Sep-2015 07:58                   -
<a href="latest-stable/">latest-stable/</a>                                     31-May-2019 18:14                   -
<a href="v2.4/">v2.4/</a>                                              19-Dec-2012 15:22                   -
<a href="v2.5/">v2.5/</a>                                              31-Oct-2012 12:46                   -
<a href="v2.6/">v2.6/</a>                                              09-Oct-2013 13:50                   -
<a href="v2.7/">v2.7/</a>                                              12-Mar-2014 12:55                   -
<a href="v3.0/">v3.0/</a>                                              07-May-2014 22:52                   -
<a href="v3.1/">v3.1/</a>                                              01-Jan-2015 07:25                   -
<a href="v3.10/">v3.10/</a>                                             31-May-2019 18:14                   -
<a href="v3.2/">v3.2/</a>                                              24-Apr-2015 09:24                   -
<a href="v3.3/">v3.3/</a>                                              21-Dec-2015 14:43                   -
<a href="v3.4/">v3.4/</a>                                              21-Apr-2016 12:39                   -
<a href="v3.5/">v3.5/</a>                                              16-Nov-2016 16:01                   -
<a href="v3.6/">v3.6/</a>                                              20-Apr-2017 10:47                   -
<a href="v3.7/">v3.7/</a>                                              23-Nov-2017 21:25                   -
<a href="v3.8/">v3.8/</a>                                              27-Apr-2018 06:06                   -
<a href="v3.9/">v3.9/</a>                                              15-Nov-2018 16:03                   -
<a href="MIRRORS.txt">MIRRORS.txt</a>                                        13-Jul-2019 22:00                1749
<a href="last-updated">last-updated</a>                                       14-Jul-2019 20:00                  11
</pre><hr></body>
</html>

 */
