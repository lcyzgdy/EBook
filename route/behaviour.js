let key = require('../private/private');
let request = require('request');
let querystring = require('querystring');
let searchSell = require('../data/sell');
let userInfo = require('../data/userInfo');
let exchange = require('../data/exchange');
let community = require('../data/community');

/**
 * 
 * @param {string} userUuid 
 * @param {any} queryJson 
 * @param {(err: Error, uuid: string) => void} callback 
 */
exports.behaviour = (userUuid, queryJson, callback) => {
    let intent = queryJson['intent'];
    if (intent == '上传卖书') {
        userInfo.searchUserByUuid(userUuid, (err, info) => {
            if (err) {
                console.log(__filename + 'err0');
                console.log(err.message);
                callback(err, null);
                return;
            }
            searchSell.addSellData(userUuid, info['name'], queryJson['book-name'], queryJson['price'], queryJson['author'], queryJson['publisher'], queryJson['detail'], queryJson['location'], (err, uuid) => {
                if (err) {
                    console.log(__filename + 'err1');
                    console.log(err.message);
                    callback(err, null);
                    return;
                }
                callback(null, uuid);
            })
        })
    }
    else if (intent == '上传买书') {
        userInfo.searchUserByUuid(userUuid, (err, info) => {
            searchSell.addBuyData(userUuid, info['name'], queryJson['book-name'], queryJson['author'], queryJson['publisher'], queryJson['detail'], queryJson['location'], (err, uuid) => {
                if (err) {
                    console.log(__filename + 'err2');
                    console.log(err.message);
                    callback(err, null);
                    return;
                }
                callback(null, uuid);
            })
        })
    }
}

/**
 * 
 * @param {string} userUuid 
 * @param {any} queryJson 
 * @param {(err: Error, result: []) => void} callback 
 */
exports.query = (userUuid, queryJson, callback) => {
    let intent = queryJson['intent'];
    if (intent == '已卖') {
        searchSell.searchSellDataByUserUuid(userUuid, (err, result) => {
            if (err) {
                console.log(__filename + 'err3');
                console.log(err.message);
                callback(err, null);
                return;
            }
            callback(null, result);
        })
    }
    else if (intent == '已买') {
        searchSell.searchBuyDataByUserUuid(userUuid, (err, result) => {
            if (err) {
                console.log(__filename + 'err4');
                console.log(err.message);
                callback(err, null);
                return;
            }
            callback(null, result);
        })
    }
}

/**
 * 卖出
 * @param {string} userUuid
 * @param {[]} entitiesJson 
 * @param {boolean} moreIntelligent
 * @param {string} location
 * @param {(err:Error, uuid:string, intent: string, entities: []) => void} callback
 */
let sellOut = (userUuid, entitiesJson, moreIntelligent, location, callback) => {
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
            searchSell.addSellData(userUuid, userInfo['name'], bookName, price, author, publisher, '', location, (err, uuid) => {
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
 * @param {string} location
 * @param {(err: Error, uuid:string, intent: string, entities: []) => void} callback 
 */
let querySell = (userUuid, entitiesJson, moreIntelligent, location, callback) => {
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
            //if (moreIntelligent && bookName != '' && price != '') {
            userInfo.searchUserByUuid(userUuid, (err, userInfo) => {
                if (err) {
                    console.log(err.message);
                    console.log('err3');
                    callback(err, null, null, null);
                    return;
                }
                searchSell.addBuyData(userUuid, userInfo['name'], bookName, author, publisher, '', location, (err, uuid) => {
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
            //} // 更加智能且信息完整，没有NLP识别结果自动添加数据库
            //else {
            //    callback(null, '', '查询', entitiesJson); // 直接返回NLP识别结果
            //}
        }
        else {
            callback(null, '', '查询', result); // 返回查询数据库结果
        }
    })
}

/**
 * 交换
 * @param {string} userUuid
 * @param {[]} entities 
 * @param {string} location
 * @param {(err: Error, uuid:string, intent: string, entities: []) => void} callback 
 */
let doExchange = (userUuid, entities, location, callback) => {
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
            exchange.addExchangeData(userUuid, bookFrom, bookTo, author, publisher, '', location, (err, uuid) => {
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