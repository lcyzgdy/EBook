let fs = require('fs');
let events = require('events');
let eventEmitter = new events.EventEmitter();
let uuid = require('node-uuid');
/**
 * 
 * @param {string} userUuid 
 * @param {(err: Error) => void} callback 
 */
exports.exchange = (userUuid, callback) => {

}

/**
 * 
 * @param {string} userUuid 
 * @param {(err: Error) => void} callback 
 */
exports.searchByUserUuid = (userUuid, callback) => {

}

/**
 * 
 * @param {string} userUuid 
 * @param {string} bookTo 
 * @param {(err: Error, result: []) => void} callback 
 */
exports.searchByTo = (userUuid, bookTo, callback) => {
    fs.readFile('./data/exchangeData.json', (err, data) => {
        if (err) {
            callback(err);
            return;
        }
        let result = [];
        try {
            String(data).split('\n').forEach(line => {
                if (line.length > 0) {
                    let json = JSON.parse(line);
                    if (editDistance(bookTo, json['bookFrom']) <= 3) {
                        result.push(line);
                    }
                }
            })
            callback(null, result);
        }
        catch (err) {
            console.log(err.message);
            callback(null, []);
        }
    })
}

/**
 * 
 * @param {string} userUuid 
 * @param {string} bookFrom 
 * @param {string} bookTo 
 * @param {[]} author 
 * @param {string} publisher 
 * @param {string} detail 
 * @param {(err: Error, uuid:string) => void} callback 
 */
exports.addExchangeData = (userUuid, bookFrom, bookTo, author, publisher, detail, callback) => {
    detail = detail.replace(',', '，');
    let data = JSON.parse('{}');
    data['userId'] = userUuid;    // user的token，md5
    data['bookFrom'] = bookFrom;    // 卖家
    data['bookTo'] = bookTo;
    data['author'] = author;
    data['publisher'] = publisher;
    data['detail'] = detail;
    data['date'] = (new Date()).getTime();
    //data['ImageUri'] = imageUri;
    data['remark'] = 1;         // 0: 已交换   1:正在交换
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
    fs.open('./data/exchangeData.json', 'a', (err, fd) => {
        if (err) {
            console.log(err.message);
            eventEmitter.emit('writeFile', writeData);
            return;
        }
        console.log('Open exchangeData.json');
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


eventEmitter.on('writeFile', writeFileHandler);







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
