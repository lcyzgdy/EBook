let nlp = require('./route/nlp');
let sell = require('./data/sell');

nlp.myNlpProcess('我想买计导', (err, intent, entities) => {
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

sell.addSellData('e0d9d3862dfb270de65719d43749df5e', '李四', '计算机科学导论', 20, null, '清华大学出版社', '', (err, uuid) => {
    if (err) {
        console.log(err.message);
    }
})