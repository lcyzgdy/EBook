let http = require('http');
let express = require('express');
let app = express();
let path = require('path');

let saveImage = require('./route/saveImage');
let login = require('./route/login');
let nlp = require('./route/nlp');
let imageFile = require('./route/findImage');
let behaviour = require('./route/behaviour');

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
            let queryJson = JSON.parse(queryContent);
            if (queryJson['query-type'] == 'nl') {
                let moreIntelligent = queryJson['more-intelligent'];
                let userUuid = queryJson['user-uuid'];
                if (userUuid === null || userUuid == '') {
                    res.end('{"status": 501}');
                    return;
                }
                if (queryJson['query-content'].length < 1) {
                    res.end('{"status": 510}');
                    return;
                }
                nlp.myNlpProcess(userUuid, queryJson['query-content'], moreIntelligent, queryJson['location'], (err, uuid, intent, entities) => {
                    if (err) {
                        res.end('{"status": 502}');
                        return;
                    }
                    var json = JSON.parse('{}');
                    json['intent'] = intent;
                    json['entities'] = entities;
                    json['status'] = 200;
                    json['uuid'] = uuid;
                    imageFile.findImageFile(uuid, (err, path) => {
                        if (err) {
                            res.write(JSON.stringify(json));
                            res.end();
                            return;
                        }
                        json['image-url'] = path;
                        res.write(JSON.stringify(json));
                        res.end();
                    })
                });
            }
            else if (queryJson['query-type'] == 'image') {
                imageFile.findImageFile(queryJson['uuid'], (err, path) => {
                    if (err) {
                        res.end('{"status":302}');
                        return;
                    }
                    let result = JSON.parse('{}');
                    result['status'] = 200;
                    result['path'] = path;
                    res.end(JSON.stringify(result));
                })
            }
            else if (queryJson['query-type'] == 'old') {
                behaviour.behaviour(queryJson['user-uuid'], queryJson, (err, uuid) => {
                    if (err) {
                        res.end('{"status":303}');
                        return;
                    }
                    let result = JSON.parse('{}');
                    result['status'] = 200;
                    result['uuid'] = uuid;
                    res.end(JSON.stringify(result));
                });
            }
            else if (queryJson['query-type'] == 'query') {
                behaviour.query(queryJson['user-uuid'], queryJson, (err, result) => {
                    if (err) {
                        res.end('{"status":304}');
                        return;
                    }
                    let json = JSON.parse('{}');
                    json['status'] = 200;
                    json['result'] = result;
                    res.end(JSON.stringify(json));
                })
            }
        }
        catch (err) {
            console.log(err.message);
            res.end('{"status": 500}');
        }
    });
});

let imageFileName = '';

app.post('/upload', (req, res) => {
    console.log('upload');
    let queryContent = '';
    req.on('data', (chunk) => {
        queryContent += String(chunk);
    });
    req.on('end', () => {
        let json = JSON.parse(queryContent);
        saveImage.saveImage(json['uuid'], json['content'], (err, uri) => {
            if (err) {
                res.end('{"status":605}');
                return;
            }
            let result = JSON.parse('{}');
            result['image-url'] = uri;
            result['status'] = 200;
            res.end(JSON.stringify(result));
        })
    });
});

app.get('/download/image/:filename', (req, res) => {
    console.log('get image');
    let imageUuid = '';
    req.on('data', (chunk) => {
        imageUuid += chunk;
    })
    req.on('end', () => {
        console.log('Send image');
        imageUuid = req.params.filename;
        res.sendFile(__dirname + '/data/image/' + imageUuid);
    })
})

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