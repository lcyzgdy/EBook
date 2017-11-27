let fs = require('fs');
let crypto = require('crypto');
let uuid = require('node-uuid');

/**
 * @param {string} token 
 * @param {(err: Error, userUuid: string, userInfo: any) => void} callback
 */
exports.searchUserByToken = (token, callback) => {
    fs.readFile('./data/userInfo.json', (err, data) => {
        if (err) {
            console.log(err.message);
            console.log('err9');
            callback(err, null);
            return;
        }
        let allUser = String(data).split('\n');
        for (var one of allUser) {
            if (one == '') continue;
            let oneJson = JSON.parse(one);
            if (oneJson['user'] == token) {
                callback(null, oneJson['uuid'], JSON.parse(one)['info']);
                return;
            }
        }
        addNewUser(token, callback);
    })
}

/**
 * 通过uuid查询用户
 * @param {string} uuid 
 * @param {(err: Error, userInfo: any) => void} callback 
 */
exports.searchUserByUuid = (uuid, callback) => {
    fs.readFile('./data/userInfo.json', (err, data) => {
        if (err) {
            console.log(err.message);
            console.log('err10');
            callback(err, null);
            return;
        }
        let allUser = String(data).split('\n');
        for (var one of allUser) {
            if (one == '') continue;
            if (JSON.parse(one)['uuid'] == uuid) {
                callback(null, JSON.parse(one)['info']);
                return;
            }
        }
        callback(new Error('Not Found'), null);
    })
}

/**
 * @param {string} token 
 * @param {(err: Error, userUuid: string, userInfo: any) => void} callback
 */
let addNewUser = (token, callback) => {
    fs.open('./data/userInfo.json', 'a', (err, fd) => {
        if (err) {
            console.log(err.message);
            console.log('err11');
            callback(err, null);
            return;
        }
        let a = uuid.v1();
        let newUser = JSON.parse('{}');
        newUser['user'] = token;
        newUser['uuid'] = a;
        newUser['info'] = JSON.parse('{"name": "张三", "age": "20"}');
        fs.write(fd, JSON.stringify(newUser) + '\n', (err) => {
            if (err) {
                console.log(err.message);
                console.log('err12');
                callback(err, null);
                fs.closeSync(fd);
                return;
            }
            callback(null, a, newUser['info']);
            fs.closeSync(fd);
        })
    })
}


/**
 * @param {string} str 
 */
function md5sum(str) {
    return crypto.createHash('md5').update(str).digest('hex');
}