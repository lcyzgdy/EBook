let fs = require('fs');
let uuid = require('node-uuid');

/**
 * 
 * @param {string} filename 
 * @param {any} chunk 
 * @param {(err:Error, imageUri: string) => void} callback
 */
exports.saveImage = (filename, chunk, callback) => {
    newFileName = uuid.v1();
    let json = JSON.parse('{}');
    json['key'] = filename;
    json['value'] = newFileName;
    fs.open('./data/image.json', 'a', (err, fd) => {
        if (err) {
            console.log(err.message);
            console.log(__filename + 'err13');
            callback(err, null);
            return;
        }
        fs.writeFile(fd, JSON.stringify(json) + '\n', (err) => {
            if (err) {
                console.log(__filename + 'err14');
                callback(err, null);
                return;
            }
            fs.writeFileSync('./data/image/' + newFileName + '.jpg', chunk);
            callback(null, newFileName);
        })
    })
    //fs.writeFile(fileName, chunk, (err) => {
    //    if (err) {
    //        callback(err, null);
    //        return;
    //    }
    //    callback(null, fileName);
    //});
}