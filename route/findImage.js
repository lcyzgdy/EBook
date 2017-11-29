let fs = require('fs');


/**
 * 
 * @param {string} uuid 
 * @param {(err: Error, path: string[]) => void} callback 
 */
exports.findImageFile = (uuid, callback) => {
    fs.readFile('./data/image.json', (err, data) => {
        if (err) {
            console.log(__filename + 'err11');
            console.log(err.message);
            callback(err, null);
            return;
        }
        let pathTemp = [];
        String(data).split('\n').forEach(line => {
            if (line.length > 0) {
                let json = JSON.parse(line);
                if (json['uuid'] == uuid) {
                    json['path'].forEach(one => {
                        pathTemp.push(one);
                    })
                }
            }
        })
        callback(null, pathTemp);
    })
}