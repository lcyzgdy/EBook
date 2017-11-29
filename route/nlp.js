let key = require('../private/private');
let request = require('request');
let querystring = require('querystring');
let searchSell = require('../data/sell');
let userInfo = require('../data/userInfo');
let exchange = require('../data/exchange');
let community = require('../data/community');

/**
* @param {string} userUuid
* @param {string} str string
* @param {boolean} moreIntelligent
* @param {(err: Error, uuid:string, intent: string, entities: []) => void} callback (err, intent and enities)
*/
exports.myNlpProcess = (userUuid, str, moreIntelligent, callback) => {
    let result = '';
    get(String(str), (err, body) => {
        if (err) {
            console.log(err.message);
            console.log('err1');
            callback(err, null, null, null);
            return;
        }
        let resultJson = JSON.parse('{}');
        //resultJson['intent'] = body['topScoringIntent']['intent'];
        let intent = body['topScoringIntent']['intent'];
        //resultJson['entities'] = [];
        let entitiesJson = [];
        let entities = body['entities'];
        if (intent == '交换') {
            doExchange(userUuid, entities, callback);
            return;
        }
        entities.forEach(element => {
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
                priceInfo['text'] = element['entity'];
                entitiesJson.push(priceInfo);
            }
            else if (element['type'] == 'builtin.currency') {
                var priceInfo = JSON.parse('{}');
                priceInfo['type'] = '价格';
                priceInfo['text'] = element['entity'];
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
        else if (intent == "交流") {
            doCommunity(userUuid, entitiesJson, callback);
        }
        else if (intent == "捐出") {
            doDonate(userUuid, entitiesJson, callback);
        }
        else {
            callback(null, intent, entitiesJson);
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
        if (res['statusCode'] != 200 || err) {
            err = new Error('failed');
            console.log(err.message);
            console.log('err2');
            callback(err, null);
            return;
        }
        callback(null, JSON.parse(body));
    })
};


/**
 * 卖出
 * @param {string} userUuid
 * @param {[]} entitiesJson 
 * @param {boolean} moreIntelligent
 * @param {(err:Error, uuid:string, intent: string, entities: []) => void} callback
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
            else if (element['type'] == '价格') price = element['text'];
        })
        if (bookName == '' && price == '') {
            callback(null, '', '卖出', entitiesJson);
            return;
        }
        userInfo.searchUserByUuid(userUuid, (err, userInfo) => {
            searchSell.addSellData(userUuid, userInfo['name'], bookName, price, author, publisher, '', (err, uuid) => {
                if (err) {
                    callback(err, null, null, null);
                    return;
                }
                callback(null, uuid, '卖出', []);
            })
        })
    }
    else {
        callback(null, '', '卖出', entitiesJson);
    }
}

/**
 * 查询
 * @param {string} userUuid
 * @param {[]} entitiesJson 
 * @param {boolean} moreIntelligent 
 * @param {(err: Error, uuid:string, intent: string, entities: []) => void} callback 
 */
let querySell = (userUuid, entitiesJson, moreIntelligent, callback) => {
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
            callback(err, null, null, null);
            return;
        }
        if (result.length < 1) {
            if (moreIntelligent && bookName != '' && price != '') {
                userInfo.searchUserByUuid(userUuid, (err, userInfo) => {
                    if (err) {
                        console.log(err.message);
                        console.log('err3');
                        callback(err, null, null, null);
                        return;
                    }
                    searchSell.addBuyData(userUuid, userInfo['name'], bookName, author, publisher, '', (err, uuid) => {
                        if (err) {
                            console.log(err.message);
                            console.log('err4');
                            callback(err, null, null, null);
                            return;
                        }
                        callback(null, uuid, '查询', []);
                        return;
                    })
                })
            } // 更加智能且信息完整，没有NLP识别结果自动添加数据库
            else {
                callback(null, '', '查询', entitiesJson); // 直接返回NLP识别结果
            }
        }
        else {
            callback(null, '', '查询2', result); // 返回查询数据库结果
        }
    })
}

/**
 * 交换
 * @param {string} userUuid
 * @param {[]} entities 
 * @param {(err: Error, uuid:string, intent: string, entities: []) => void} callback 
 */
let doExchange = (userUuid, entities, callback) => {
    var bookFrom = '';
    var bookTo = '';
    var author = [];
    var publisher = '';
    let knownBook = new Map();
    //let tempBook = [];
    entities.forEach(element => {
        if (element['type'] == '书籍信息::换入') {
            bookTo = element['entity'];
        }
        else if (element['type'] == '书籍信息::换出') {
            bookFrom = element['entity'];
        }
        else if (element['type'] == '已知书目') {
            let b = element['entity'].replace(new RegExp(' ', 'g'), '');//.replace(' ', '');
            knownBook.set(b, element['resolution']['values'][0]);
        }
    });
    bookFrom = knownBook.get(bookFrom);
    bookTo = knownBook.get(bookTo);
    exchange.searchByTo(userUuid, bookTo, (err, result) => {
        if (err) {
            console.log(err.message);
            console.log('err5');
            callback(err, null, null, null);
            return;
        }
        if (result.length < 1) {
            exchange.addExchangeData(userUuid, bookFrom, bookTo, author, publisher, '', (err, uuid) => {
                if (err) {
                    callback(err, null, null, null);
                    return;
                }
                callback(null, uuid, '交换', []);
            })
        }
        else {
            callback(null, '', '交换', result);
        }
    })
}

/**
 * 
 * @param {string} userUuid 
 * @param {[]} entitiesJson 
 * @param {(err: Error, uuid: string, intent: string, entities: []) => void} callback 
 */
let doCommunity = (userUuid, entitiesJson, callback) => {

}


/**
 * 计算编辑距离（用向量值计算内存不足）
 * @param {string} str1 
 * @param {string} str2 
 */
var editDistance = function (str1, str2) {
    var lenStr1 = str1.length;
    var lenStr2 = str2.length;
    if (lenStr1 === 0 || lenStr2 === 0) {
        return lenStr1 === 0 ? lenStr2 : lenStr1;
    }
    var dArr = new Array(lenStr1 + 1);
    for (var i = 0; i <= lenStr1; i++) {
        dArr[i] = new Array(lenStr2 + 1);
        dArr[i][0] = i;
    }

    for (var j = 0; j <= lenStr2; j++) {
        dArr[0][j] = j;
    }

    for (var k = 1; k <= lenStr1; k++) {
        for (var l = 1; l <= lenStr2; l++) {
            dArr[k][l] = Math.min(
                dArr[k - 1][l - 1] + (str1[k - 1] === str2[l - 1] ? 0 : 1),
                dArr[k - 1][l] + 1,
                dArr[k][l - 1] + 1
            )
        }
    }
    return dArr[lenStr1][lenStr2];
}



/**自然语言功能
 * 买书（查询数据库中有哪些书可买）
 * 卖书（上传信息）
 * 换书（查询数据库中有哪些书可换）
 * 捐书（上传信息）
 * 交流（）
 * 查询（正在卖，有人买，已卖出，发出的帖子，正在捐，已捐出）
 */