let key = require('../private/private');
let request = require('request');
let querystring = require('querystring');

/**
* @param {string} str string
* @param {(err: Error, intent: string, entities: []) => void} callback (err, intent and enities)
*/
exports.myNlpProcess = (str, callback) => {
    let result = '';
    get(String(str), (err, body) => {
        let resultJson = JSON.parse('{}');
        //resultJson['intent'] = body['topScoringIntent']['intent'];
        let intent = body['topScoringIntent']['intent'];
        //resultJson['entities'] = [];
        let entitiesJson = [];
        let enities = body['entities'];
        enities.forEach(element => {
            if (element['type'] == '固定书目') {
                element['resolution']['values'].forEach(bookName => {
                    var bookInfo = JSON.parse('{}');
                    bookInfo['text'] = bookName;
                    bookInfo['type'] = '书名';
                    //resultJson['entities'].push(bookInfo);
                    entitiesJson.push(bookInfo);
                })
            }
            else if (element['type'] == '书名') {
                var bookInfo = JSON.parse('{}');
                bookInfo['text'] = element['entity'];
                bookInfo['type'] = '书名';
                //resultJson['entities'].push(bookInfo);
                entitiesJson.push(bookInfo);
            }
            else if (element['type'] == '已知作者') {
                element['resolution']['values'].forEach(author => {
                    var authorInfo = JSON.parse('{}');
                    authorInfo['text'] = author;
                    authorInfo['type'] = '作者';
                    //resultJson['entities'].push(authorInfo);
                    entitiesJson.push(authorInfo);
                })
            }
            else if (element['type'] == '作者') {
                var authorInfo = JSON.parse('{}');
                authorInfo['text'] = element['entities'];
                authorInfo['type'] = '作者';
                //resultJson['entities'].push(authorInfo);
                entitiesJson.push(authorInfo);
            }
            else if (element['type'] == '已知出版社') {
                element['resolution']['values'].forEach(publisher => {
                    var publisherInfo = JSON.parse('{}');
                    publisherInfo['type'] = '出版社';
                    publisherInfo['text'] = publisher;
                    //resultJson['entities'].push(publisherInfo);
                    entitiesJson.push(publisherInfo);
                })
            }
            else if (element['type'] == '出版社') {
                var publisherInfo = JSON.parse('{}');
                publisherInfo['type'] = '出版社';
                publisherInfo['text'] = element['entity'];
                //resultJson['entities'].push(publisherInfo);
                entitiesJson.push(publisherInfo);
            }
        });
        //console.log(enities[0]['resolution']['values']);
        callback(err, intent, entitiesJson);
    });
}

var endPoint = "https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/";
var appId = key.AppId;

/**
 * @param {string} utterance
 * @param {(err: Error, body: any) => void} callback
 */
var get = (utterance, callback) => {
    var queryParams = {
        "subscription-key": key.AppKey,
        "timezoneOffset": "0",
        "verbose": true,
        "q": utterance
    }
    var requestUrl = endPoint + appId + '?' + querystring.stringify(queryParams);
    //console.log(requestUrl);
    request(requestUrl, (err, res, body) => {
        console.log()
        if (res['statusCode'] != 200 && err) {
            err = new Error('failed');
        }
        callback(err, JSON.parse(body));
    })
};






/**自然语言功能
 * 买书（查询数据库中有哪些书可买）
 * 卖书（上传信息）
 * 卖书（上传图片）
 * 换书（查询数据库中有哪些书可换）
 * 捐书（上传信息）
 * 捐书（上传图片）
 * 交流（）
 * 查询（正在卖，有人买，已卖出，发出的帖子，正在捐，已捐出）
 */