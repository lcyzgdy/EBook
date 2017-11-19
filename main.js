import { myNlpProcess } from './route/nlp1';

let http = require('http');
let express = require('express');
let app = express();

let saveImage = require('./route/saveImage');
let routeLogin = require('./route/login');
let nlpModule = require('./route/nlp');

app.get('/login', (req, res) => {
    let info = '';
    req.on('data', (chunk) => {
        info += String(chunk);
    });
    req.on('end', () => {
        let infoJson = JSON.parse(info);
        res.end('{status:' + routeLogin(infoJson['username'], infoJson['password']).toString() + '}');
    });
});

app.get('/query', (req, res) => {
    let queryContent = '';
    req.on('data', (chunk) => {
        queryContent += String(chunk);
    });
    req.on('end', () => {
        let enityJson = JSON.parse(queryContent);
        if (queryContent['query-type'] == 'nl') {
            var result = nlpModule.myNlpProcess(queryContent['query-content'], () => {
                
            });
            res.write(result);
        }
    });
});

let imageFileName = '';

app.post('/upload', (req, res) => {
    let queryContent = '';
    req.on('data', (chunk) => {
        queryContent += String(chunk);
    });
    req.on('end', () => {
        let enityJson = JSON.parse(queryContent);
        if (queryContent['upload-type'] == 'image') {

        }
    });
});

app.listen(8086);
console.log('OK');