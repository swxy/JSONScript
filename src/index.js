/**
 * Created by swxy on 2017/5/3.
 *
 * JSONScript is a tiny JSON parser written in JavaScript
 *
 * This file define the main parser interface
 */

const Parser = require('./state');

function parse(input, options) {
    // todo
    const p = parser(options, input);
    while (p.type !== 'end') {
        p.nextToken();
    }
    return p;
}


function parser(options, input) {
    return new Parser(String(input))
}


module.exports = parse;
