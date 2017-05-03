/**
 * Created by swxy on 2017/5/3.
 */

const path = require('path');
const fs = require('fs');
const jsonFilePath = path.resolve(process.argv[2]);
const jsPath = jsonFilePath.replace('.json', '.js');
const writeStream = fs.createWriteStream(jsPath);
const readStream = fs.createReadStream(jsonFilePath);
writeStream.write('module.exports = ');
readStream.pipe(writeStream);
writeStream.on('close', () => {
    console.log('write success');
    const jsonObj = require(jsPath);
    const jsonData = JSON.stringify(jsonObj, null, 4);
    fs.writeFile(jsonFilePath, jsonData, {encoding: 'utf-8'}, (err) => {
        if (err) throw err;
        console.log('The file has been formatted!');
    })
});
