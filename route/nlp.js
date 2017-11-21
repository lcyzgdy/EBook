let key = require('../private/private');
let request = require('request');
let querystring = require('querystring');
let searchSell = require('../data/sell');
let userInfo = require('../data/userInfo');

/**
* @param {string} userUuid
* @param {string} str string
* @param {boolean} moreIntelligent
* @param {(err: Error, intent: string, entities: []) => void} callback (err, intent and enities)
*/
exports.myNlpProcess = (userUuid, str, moreIntelligent, callback) => {
    let result = '';
    get(String(str), (err, body) => {
        if (err) {
            callback(err, null, null);
            return;
        }
        let resultJson = JSON.parse('{}');
        //resultJson['intent'] = body['topScoringIntent']['intent'];
        let intent = body['topScoringIntent']['intent'];
        //resultJson['entities'] = [];
        let entitiesJson = [];
        let enities = body['entities'];
        enities.forEach(element => {
            if (element['type'] == '已知书目') {
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
            else if (element['type'] == '价格') {
                var priceInfo = JSON.parse('{}');
                priceInfo['type'] = '价格';
                priceInfo['content'] = element['entity'];
                entitiesJson.push(priceInfo);
            }
            else if (element['type'] == 'builtin.currency') {
                var priceInfo = JSON.parse('{}');
                priceInfo['type'] = '价格';
                priceInfo['content'] = element['entity'];
                entitiesJson.push(priceInfo);
            }
        });
        //console.log(intent);
        //console.log(enities[0]['resolution']['values']);
        if (intent == '卖出') {
            sellOut(userUuid, entitiesJson, moreIntelligent, callback);
        }
        else if (intent == 'None') {
            callback(null, intent, null);
        }
        else if (intent == "查询") {
            querySell(userUuid, entitiesJson, moreIntelligent, callback);
        }
    });
}

var endPoint = "https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/";
var appId = key.AppId;

/**
 * @param {string} utterance
 * @param {(err: Error, body: any) => void} callback
 */
var get = (utterance, callback) => {
    console.log(utterance);
    var queryParams = {
        "subscription-key": key.AppKey,
        "timezoneOffset": "8.0",
        "verbose": true,
        "q": utterance
    }
    var requestUrl = endPoint + appId + '?' + querystring.stringify(queryParams);
    //console.log(requestUrl);
    request(requestUrl, (err, res, body) => {
        console.log()
        if (res['statusCode'] != 200 || err) {
            err = new Error('failed');
        }
        callback(err, JSON.parse(body));
    })
};


/**
 * 卖出
 * @param {string} userUuid
 * @param {[]} entitiesJson 
 * @param {boolean} moreIntelligent
 * @param {(err:Error, intent: string, entities: []) => void} callback
 */
let sellOut = (userUuid, entitiesJson, moreIntelligent, callback) => {
    if (moreIntelligent) {
        let entitiesFromDatabase = [];
        let bookName = '';
        let author = [];
        let publisher = '';
        let price = '';
        entitiesJson.forEach(element => {
            if (element['type'] == '书名') bookName = element['text'];
            else if (element['type'] == '作者') author.push(element['text']);
            else if (element['type'] == '出版社') publisher = element['text'];
            else if (element['type'] == '价格') price = element['content'];
        })
        userInfo.searchUserByUuid(userUuid, (err, userInfo) => {
            searchSell.addSellData(userUuid, userInfo['name'], bookName, price, author, publisher, '', (err, uuid) => {
                if (err) {
                    callback(err, null, null);
                    return;
                }
                callback(null, 'OK', entitiesJson);
            })
        })
    }
    else {
        callback(null, '卖出', entitiesJson);
    }
}

/**
 * 查询
 * @param {string} userUuid
 * @param {[]} entitiesJson 
 * @param {boolean} moreIntelligent 
 * @param {(err: Error, intent: string, entities: []) => void} callback 
 */
let querySell = (userUuid, entitiesJson, moreIntelligent, callback) => {
    if (moreIntelligent) {

    }
    else {
        let entitiesFromDatabase = [];
        let bookName = '';
        let author = [];
        let publisher = '';
        entitiesJson.forEach(element => {
            if (element['type'] == '书名') bookName = element['text'];
            else if (element['type'] == '作者') author.push(element['text']);
            else if (element['type'] == '出版社') publisher = element['text'];
        })
        searchSell.searchSellDataByDetail(bookName, author, publisher, '', (err, result) => {
            if (err) {
                callback(err, null, null);
                return;
            }
            callback(null, '查询', result);
        })
    }
}




/**自然语言功能
 * 买书（查询数据库中有哪些书可买）
 * 卖书（上传信息）
 * 换书（查询数据库中有哪些书可换）
 * 捐书（上传信息）
 * 交流（）
 * 查询（正在卖，有人买，已卖出，发出的帖子，正在捐，已捐出）
 */