let nlp = require('./route/nlp');
let sell = require('./data/sell');
let user = require('./data/userInfo');


nlp.myNlpProcess('866bb860-cd25-11e7-8110-b151030945d0', '我想买清华大学出版社的计算机网络', false, (err, intent, entities) => {
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