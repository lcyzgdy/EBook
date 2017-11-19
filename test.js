let nlp = require('./route/nlp');

nlp.myNlpProcess('读高等数学是怎样一种体验？', (err, result) => {
    if (err) {
        console.log(err.message);
        return;
    }
    console.log(result);
})