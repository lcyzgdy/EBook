const Client = require('../nlp-module/luis_sdk')
let key = require('../private/private')
let https = require('https');
let request = require('request');

exports.myNlpProcessAsync = (str, callback) => {
    console.log(endPoint + String(str));
    let result = '';
    https.get(endPoint + String(str), (res) => {
        console.log(res.statusCode);
        res.on('error', (err) => {
            console.log(err.message);
            result = err.message;
        });
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        res.on('end', () => {
            result = String(data);
            callback(result);
        });
    });
}

var endPoint = "https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/";
var appId = key.AppId;

var get = (utterance) => {
    var queryParams = {
        "subscription-key": key.AppKey,
        "timezoneOffset": "0",
        "verbose": true,
        "q": utterance
    }
    var req = endPoint + appId + '?' + querystring.stringify(queryParams);
};