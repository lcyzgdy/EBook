let fs = require('fs');
let crypto = require('crypto');
let uuid = require('node-uuid');

/**
 * @param {string} token 
 * @param {(err: Error, userUuid: string, userInfo: any) => void} callback
 */
exports.searchUser = (token, callback) => {
    fs.readFile('./data/userInfo.json', (err, data) => {
        if (err) {
            callback(err, null);
            return;
        }
        let allUser = String(data).split('\n');
        for (var one of allUser) {
            if (one == '') continue;
            if (JSON.parse(one)['user'] == token) {
                callback(null, JSON.parse(one)['uuid'], JSON.parse(one)['info']);
                return;
            }
        }
        addNewUser(token, callback);
    })
}
/**
 * @param {string} token 
 * @param {(err: Error, userUuid: string, userInfo: any) => void} callback
 */
let addNewUser = (token, callback) => {
    fs.open('./data/userInfo.json', 'a', (err, fd) => {
        if (err) {
            callback(err, null);
            return;
        }
        let a = uuid.v1();
        let newUser = JSON.parse('{}');
        newUser['user'] = token;
        newUser['uuid'] = a;
        newUser['info'] = JSON.parse('{"name": "张三", "age": "20"}');
        fs.write(fd, JSON.stringify(newUser), (err) => {
            if (err) {
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