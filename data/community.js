let uuid = require('node-uuid');
let fs = require('fs');

/**
 * 
 * @param {string} bookName 
 * @param {() => void} callback 
 */
exports.searchByTopic = (bookName, callback) => {
    let data = String(fs.readFileSync('./data/community.json'));
    let result = [];
    data.split('\n').forEach(line => {
        if (line.length > 0) {
            let json = JSON.parse(line);
            if (json['topic'] == bookName) {
                result.push(line);
            }
        }
    })
    callback(line);
}