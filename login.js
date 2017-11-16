//let http = require('http');

exports.routeLogin = (username, password) => {
    if (username == 'Admin' && password == '123456') {
        console.log('login');
        return 0;
    }
    else {
        console.log('login failed');
        return 1;
    }
}