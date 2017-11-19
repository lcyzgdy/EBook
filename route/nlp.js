//const Client = require('../nlp-module/luis_sdk')
let key = require('../private/private');
//let https = require('https');
let request = require('request');
let querystring = require('querystring');

/**
* @param str string
* @param callback (response body)
*/
exports.myNlpProcess = (str, callback) => {
    let result = '';
    get(String(str), (body) => {
        callback(body);
    });
}

var endPoint = "https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/";
var appId = key.AppId;

var get = (utterance, callback) => {
    var queryParams = {
        "subscription-key": key.AppKey,
        "timezoneOffset": "0",
        "verbose": true,
        "q": utterance
    }
    var requestUrl = endPoint + appId + '?' + querystring.stringify(queryParams);
    //console.log(requestUrl);
    request(requestUrl, (err, res, body) => {
        if (err) {
            console.log(err);
            return;
        }
        callback(body);
    })
};