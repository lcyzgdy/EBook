let nlp = require('./route/nlp');
let sell = require('./data/sell');
let user = require('./data/userInfo');


nlp.myNlpProcess('866bb860-cd25-11e7-8110-b151030945d0', '我想以50元出售罗贯中的三国演义', true, (err, intent, entities) => {
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