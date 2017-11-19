let fs = require('fs');
let events = require('events');
let eventEmitter = new events.EventEmitter();
let uuid = require('node-uuid');

/**
 * @param {string} sellFrom 卖家
 * @param {string} bookName 书名
 * @param {number} price 价格
 * @param {string[]} author 作者，字符串数组
 * @param {string} publisher 出版社
 * @param {string} detail 其它信息
 * @param {(err: Error, uuid: string) => void} callback callback
 */
exports.addSellData = (userId, sellFrom, bookName, price, author, publisher, detail, callback) => {
    detail = detail.replace(',', '，');
    let data = JSON.parse('{}');
    data['UserId'] = userId;
    data['SellFrom'] = sellFrom;
    data['BookName'] = bookName;
    data['Price'] = price;
    data['Author'] = author;
    data['Publisher'] = publisher;
    //data['ImageUri'] = imageUri;
    data['Remark'] = 1;
    let thisUuid = uuid.v1();
    data['Uuid'] = thisUuid;
    dataQueue.push(data);
    eventEmitter.emit('writeFile', JSON.stringify(dataQueue.pop()));
    callback(thisUuid);
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
        console.log(1111);
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