let fs = require('fs');

exports.saveImage = async (filename, chunk) => {
    let fileName = (new Date()).getTime() + '_Image.png';
    fs.writeFile(fileName, chunk, (err) => {
        if (err) {
            console.log(err.message);
            return;
        }
    })
    return fileName;
}