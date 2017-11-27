let http = require('http');
let express = require('express');
let app = express();

let saveImage = require('./route/saveImage');
let login = require('./route/login');
let nlp = require('./route/nlp');

app.get('/', (req, res) => {
    console.log('test');
    res.write('sdfghssjkl');
    res.end();
});

app.post('/login', (req, res) => {
    console.log('login');
    let info = '';
    req.on('data', (chunk) => {
        info += String(chunk);
    });
    req.on('end', () => {
        let infoJson = JSON.parse('{}');
        try {
            infoJson = JSON.parse(info);
        } catch (error) {
            res.end('{"status":400}');
            return;
        }
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
            res.end();
        });
    });
});

app.post('/query', (req, res) => {
    console.log('query');
    let queryContent = '';
    req.on('data', (chunk) => {
        queryContent += String(chunk);
    });
    req.on('end', () => {
        try {
            let enityJson = JSON.parse(queryContent);
            if (enityJson['query-type'] == 'nl') {
                let moreIntelligent = enityJson['more-intelligent'];
                let userUuid = enityJson['user-uuid'];
                if (userUuid === null || userUuid == '') {
                    res.end('{"status": 501}');
                    return;
                }
                nlp.myNlpProcess(userUuid, enityJson['query-content'], moreIntelligent, (err, intent, entities) => {
                    if (err) {
                        res.end('{"status": 502}');
                        return;
                    }
                    var json = JSON.parse('{}');
                    json['intent'] = intent;
                    json['entities'] = entities;
                    json['status'] = 200;
                    res.write(JSON.stringify(json));
                    res.end();
                });
            }
        }
        catch (err) {
            res.end('{"status": 500}');
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