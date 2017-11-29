let fs = require('fs');
let uuid = require('node-uuid');

/**
 * 
 * @param {string} filename 
 * @param {any} chunk 
 * @param {(err:Error, imageUri: string) => void} callback
 */
exports.saveImage = (filename, chunk, callback) => {
    fileName += uuid.v1() + '.png';
    fs.writeFile(fileName, chunk, (err) => {
        if (err) {
            callback(err, null);
            return;
        }
        callback(null, fileName);
    });
}