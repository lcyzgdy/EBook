let fs = require('fs');

/**
 * 
 * @param {string} filename 
 * @param {any} chunk 
 * @param {(err:Error, imageUri: string) => void} callback
 */
exports.saveImage = (filename, chunk, callback) => {
    fileName += (new Date()).getTime() + '_Image.png';
    fs.writeFile(fileName, chunk, (err) => {
        if (err) {
            callback(err, null);
            return;
        }
        callback(null, fileName);
    });
}