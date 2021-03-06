let fs = require('fs');
let events = require('events');
let eventEmitter = new events.EventEmitter();
let uuid = require('node-uuid');

/**
 * @param {string} whoWantSell 卖家
 * @param {string} bookName 书名
 * @param {number} price 价格
 * @param {string[]} author 作者，字符串数组
 * @param {string} publisher 出版社
 * @param {string} detail 其它信息
 * @param {string} location 地点
 * @param {(err: Error, uuid: string) => void} callback callback
 */
exports.addSellData = (userId, whoWantSell, bookName, price, author, publisher, detail, location, callback) => {
    detail = detail.replace(new RegExp(',', 'g'), '，');//replace(',', '，');
    let data = JSON.parse('{}');
    data['userId'] = userId;    // user的token，md5
    data['whoWantSell'] = whoWantSell;    // 卖家
    data['bookName'] = bookName;
    data['price'] = price;
    data['author'] = author;
    data['publisher'] = publisher;
    data['detail'] = detail;
    data['location'] = location;
    data['date'] = new Date().getTime();
    //data['ImageUri'] = imageUri;
    data['remark'] = 1;         // 0: 已卖出   1:正在卖
    let thisUuid = uuid.v1();
    data['uuid'] = thisUuid;    // 这条记录的uuid
    dataQueue.push(data);
    eventEmitter.emit('writeFile', JSON.stringify(dataQueue.pop()));
    callback(null, thisUuid);
}

/**
 * @param {string} userId UserUuid
 * @param {string} whoWantBuy 买家
 * @param {string} bookName 书名
 * @param {string[]} author 作者，字符串数组
 * @param {string} publisher 出版社
 * @param {string} detail 其它信息
 * @param {string} location 地点
 * @param {(err: Error, uuid: string) => void} callback callback
 */
exports.addBuyData = (userId, whoWantBuy, bookName, author, publisher, detail, location, callback) => {
    detail = detail.replace(new RegExp(',', 'g'), '，');//.replace(',', '，');
    let data = JSON.parse('{}');
    data['userId'] = userId;    // user的token，md5
    data['whoWantBuy'] = whoWantBuy;    // 卖家
    data['bookName'] = bookName;
    data['author'] = author;
    data['publisher'] = publisher;
    data['detail'] = detail;
    data['location'] = location;
    data['date'] = new Date().getTime();
    //data['ImageUri'] = imageUri;
    data['remark'] = 2;         // 0: 已卖出   1:正在卖    2:正在买    3:已完成交易
    let thisUuid = uuid.v1();
    data['uuid'] = thisUuid;    // 这条记录的uuid
    dataQueue.push(data);
    eventEmitter.emit('writeFile', JSON.stringify(dataQueue.pop()));
    callback(null, thisUuid);
}

let dataQueue = [];

/**
 * @param {string} writeData 
 */
let writeFileHandler = (writeData) => {
    fs.open('./data/data.json', 'a', (err, fd) => {
        if (err) {
            console.log(err.message);
            eventEmitter.emit('writeFile', writeData);
            return;
        }
        //console.log(1111);
        console.log('Open data.json');
        fs.write(fd, writeData + '\n', (err) => {
            if (err) {
                console.log(err.message);
                fs.closeSync(fd);
                eventEmitter.emit('writeFile', writeData);
            }
            if (dataQueue.length > 0) {
                fs.closeSync(fd);
                eventEmitter.emit('writeFile', JSON.stringify(dataQueue.pop()));
                return;
            }
            fs.closeSync(fd);
        });
    });
}

let readFileHandler = () => {

}

eventEmitter.on('writeFile', writeFileHandler);
eventEmitter.on('readFile', readFileHandler);

/**
 * 
 * @param {string} keyword
 * @param {(err:Error, result: any[]) => void} callback
 */
exports.searchSellData = (keyword, callback) => {
    let data = String(fs.readFileSync('./data/data.json')).replace(new RegExp('\\', 'g'), '').split('\n');
    let arr = new Map();
    data.forEach(element => {
        let dis = element.length - editDistance(element, keyword);
        if (dis > keyword.length - 3) {
            arr.set(element, dis);
        }
    });
    if (arr.size < 1) {
        let err = new Error('No result');
        console.log(err.message);
        console.log('err6');
        callback(err, null);
        return;
    }
    let temp = []
    arr.forEach((value, key, arr) => {
        temp.push(key);
    });
    callback(null, temp);
}

/**
 * 
 * @param {string} useruuid 
 * @param {(err: Error, result: any[]) => void} callback 
 */
exports.searchSellDataByUserUuid = (useruuid, callback) => {
    let data = String(fs.readFileSync('./data/data.json')).split('\n');
    let arr = [];
    data.forEach(element => {
        if (element.length > 0) {
            let temp = JSON.parse(element);
            let tempMark = temp['remark'];
            if (tempMark == 1) {
                if (temp['userId'] == useruuid) {
                    arr.push(element);
                }
            }
        }
    });
    callback(null, arr);
}

/**
 * @param {string} bookName
 * @param {string[]} author
 * @param {string} publisher
 * @param {string} otherInfo
 * @param {(err: Error, result: any[]) => void} callback
 */
exports.searchSellDataByDetail = (bookName, author, publisher, otherInfo, callback) => {
    let data = String(fs.readFileSync('./data/data.json')).split('\n'); //.replace(new RegExp('\\', 'g'), '')
    let arr = new Map();
    data.forEach(element => {
        if (element.length > 0) {
            let temp = JSON.parse(element);
            let tempMark = temp['remark'];
            if (tempMark == 1) {
                let tempName = temp['bookName'];
                let tempAuthor = temp['author'];
                let tempPublisher = temp['publisher'];
                let tempDetail = temp['detail'];
                let dis = [];
                //let dis1 = editDistance(tempName, bookName);
                if (tempName != '' && bookName != '') dis.push(editDistance(tempName, bookName));
                //let dis2 = editDistance(tempAuthor, author);
                if (tempAuthor != undefined && tempAuthor.length > 0 && author.length > 0) { // Fixed bug
                    author.forEach(ele1 => {
                        tempAuthor.forEach(ele2 => {
                            dis.push(editDistance(ele1, ele2));
                        })
                    })
                }
                //let dis3 = editDistance(tempPublisher, publisher);
                if (tempPublisher != '' && publisher != '') dis.push(editDistance(tempPublisher, publisher));
                //let dis4 = editDistance(tempDetail, otherInfo);
                if (tempDetail != '' && otherInfo != '') dis.push(editDistance(tempDetail, otherInfo));
                let sum = 0;
                dis.forEach(distance => {
                    sum += distance;
                });
                if (sum < 4) {
                    arr.set(element, dis);
                }
            }
        }
    });
    if (arr.size < 1) {
        //let err = new Error('No result');
        //console.log(err.message);
        //console.log('err7');
        //callback(err, null);
        callback(null, []);
        return;
    }
    let temp = []
    arr.forEach((value, key, arr) => {
        temp.push(key);
    });
    temp = temp.sort((a, b) => {
        return arr.get(a) > arr.get(b);
    });
    while (temp.length > 10)
        temp.pop();
    callback(null, temp);
}

/**
 * 
 * @param {string} useruuid 
 * @param {(err: Error, result: any[]) => void} callback 
 */
exports.searchBuyDataByUserUuid = (useruuid, callback) => {
    let data = String(fs.readFileSync('./data/data.json')).split('\n');
    let arr = [];
    data.forEach(element => {
        if (element.length > 0) {
            let temp = JSON.parse(element);
            let tempMark = temp['remark'];
            if (tempMark == 2) {
                if (temp['userId'] == useruuid) {
                    arr.push(element);
                }
            }
        }
    });
    callback(null, arr);
}

/**
 * @param {string} bookName
 * @param {string[]} author
 * @param {string} publisher
 * @param {string} otherInfo
 * @param {(err: Error, result: any[]) => void} callback
 */
exports.searchBuyDataByDetail = (bookName, author, publisher, otherInfo, callback) => {
    let data = String(fs.readFileSync('./data/data.json')).split('\n');
    let arr = new Map();
    data.forEach(element => {
        if (element.length > 0) {
            let temp = JSON.parse(element);
            let tempMark = temp['remark'];
            if (tempMark == 2) {
                let dis = [];
                let tempName = temp['bookName'];
                let tempAuthor = temp['author'];
                let tempPublisher = temp['publisher'];
                let tempDetail = temp['detail'];
                //let dis1 = editDistance(tempName, bookName);
                if (tempName != '' && bookName != '') dis.push(editDistance(tempName, bookName));
                //let dis2 = editDistance(tempAuthor, author);                if (tempAuthor.length > 0 && author.length > 0) {
                if (tempAuthor != undefined && tempAuthor.length > 0 && author.length > 0) {
                    author.forEach(ele1 => {
                        tempAuthor.forEach(ele2 => {
                            dis.push(editDistance(ele1, ele2));
                        })
                    })
                }
                //let dis3 = editDistance(tempPublisher, publisher);
                if (tempPublisher != '' && publisher != '') dis.push(editDistance(tempPublisher, publisher));
                //let dis4 = editDistance(tempDetail, otherInfo);
                if (tempDetail != '' && otherInfo != '') dis.push(editDistance(tempDetail, otherInfo));
                let sum = 0;
                dis.forEach(distance => {
                    sum += distance;
                });
                //console.log(sum);
                if (sum < 4) {
                    arr.set(element, dis);
                }
            }
        }
    });
    if (arr.size < 1) {
        let err = new Error('No result');
        console.log(err.message);
        console.log('err8');
        callback(err, null);
        return;
    }
    let temp = []
    arr.forEach((value, key, arr) => {
        console.log(key);
        temp.push(JSON.parse(key));
    });
    temp = temp.sort((a, b) => {
        return arr.get(a) > arr.get(b);
    });
    while (temp.length > 10)
        temp.pop();
    callback(null, temp);
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