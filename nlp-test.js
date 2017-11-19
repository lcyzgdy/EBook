let nlpModule = require('./route/nlp');

nlpModule.myNlpProcess('我想买C#', (err, result) => {
    if (err) {
        console.log(err.message);
        return;
    }
    console.log(result);
});