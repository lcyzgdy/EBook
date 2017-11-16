let http = require('http');
let express = require('express');
let app = express();

let saveImage = require('./upload');
let routeLogin = require('./login');

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
    let enity = '';
    req.on('data', (chunk) => {
        enity += String(chunk);
    });
    req.on('end', () => {
        let enityJson = JSON.parse(enity);
        if (enity['query-type'] == 'nl') {

        }
    });
});

let imageFileName = '';

app.post('/upload', (req, res) => {
    let enity = '';
    req.on('data', (chunk) => {
        enity += String(chunk);
    });
    req.on('end', () => {
        let enityJson = JSON.parse(enity);
        if (enity['upload-type'] == 'image') {

        }
    });
});

app.listen(8086);
console.log('OK');