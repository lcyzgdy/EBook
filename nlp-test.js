let nlpModule = require('./route/nlp');

nlpModule.myNlpProcessAsync('我想买大学计算机基础', (result) => {
    console.log(String(result));
});