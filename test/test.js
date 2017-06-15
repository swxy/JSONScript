/**
 * Created by swxy on 2017/6/15.
 */
const fs = require('fs');
const path = require('path');
const Parser = require('../src');
fs.readFile(path.join(__dirname, './test.json'), (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    const p = Parser(data);
    console.dir(p.body);
})
