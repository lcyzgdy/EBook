let user = require('../data/userInfo');
let crypto = require('crypto');

/**
 * 
 * @param {string} username 
 * @param {string} password 
 * @param {(err: Error, userUuid: string, userInfo: any) => void} callback 
 */
exports.routeLogin = (username, password, callback) => {
    let token = md5sum(username + password);
    user.searchUser(token, callback);
}

function md5sum(str) {
    return crypto.createHash('md5').update(str).digest('hex');
}