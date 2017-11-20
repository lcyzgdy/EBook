import { myNlpProcess } from './route/nlp1';

let http = require('http');
let express = require('express');
let app = express();

let saveImage = require('./route/saveImage');
let login = require('./route/login');
let nlpModule = require('./route/nlp');

app.get('/login', (req, res) => {
    let info = '';
    req.on('data', (chunk) => {
        info += String(chunk);
    });
    req.on('end', () => {
        let infoJson = JSON.parse(info);
        login.routeLogin(infoJson['username'], infoJson['password'], (err, userUuid, userInfo) => {
            if (err) {
                res.end('{"status": 400}');
                return;
            }
            let json = JSON.parse('{}');
            json['status'] = 200;
            json['uuid'] = userUuid;
            json['info'] = userInfo;
            res.write(JSON.stringify(json));
        });
    });
});

app.get('/query', (req, res) => {
    let queryContent = '';
    req.on('data', (chunk) => {
        queryContent += String(chunk);
    });
    req.on('end', () => {
        let enityJson = JSON.parse(queryContent);
        if (queryContent['query-type'] == 'nl') {
            nlpModule.myNlpProcess(queryContent['query-content'], (err, intent, entities) => {
                if (err) {
                    res.write('{"status": 404}');
                    return;
                }
                res.write(result);
            });
        }
    });
});

let imageFileName = '';

app.post('/upload', (req, res) => {
    let queryContent = '';
    req.on('data', (chunk) => {
        queryContent += String(chunk);
    });
    req.on('end', () => {
        let enityJson = JSON.parse(queryContent);
        if (queryContent['type'] == 'image') {

        }
    });
});

app.listen(8086);
console.log('OK');













/**接口需求
 * 用户登录（第三方认证，如果没有该用户则新建用户）                  ok    get   login                       body:username, password
 * 买书（查询数据库中有哪些书可买）                                       get   query    type:nl, param     body:
 * 卖书（上传信息）                                                     post  upload   type:text          body:info
 * 卖书（上传图片）                                                     post  upload   type:image         body:imageByte
 * 换书（查询数据库中有哪些书可换）                                       get   query    type:nl, param     body:
 * 捐书（上传信息）                                                     post  upload   type:text
 * 捐书（上传图片）                                                     post  upload   type:image
 * 交流（）                                                            get    query   type:nl, param     
 * 用户查询（正在卖，有人买，已卖出，发出的帖子，正在捐，已捐出）           get   query    type:param
 * 自然语言
 */