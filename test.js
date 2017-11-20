let nlp = require('./route/nlp');
let sell = require('./data/sell');
let user = require('./data/userInfo');

/*nlp.myNlpProcess('我想买计导', (err, intent, entities) => {
    if (err) {
        console.log(err.message);
        return;
    }
    console.log(intent);
    //console.log(entities.toString());
    entities.forEach(element => {
        console.log(JSON.stringify(element));
    })
})
*/

user.searchUserByUuid('e0d9d3862dfb270de65719d43749df5e', (err, info) => {
    if (err) {
        console.log(err.message);
    }
})