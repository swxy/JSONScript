/**
 * Created by swxy on 2017/6/14.
 */

const tyeps = {
    bracketL: '[',
    bracketR: ']',
    braceL: '{',
    braceR: '}',
    colon: ':',
    comma: ',',
    string: 'string',
    number: 'number'
};

tyeps.inclue = Object.keys(tyeps).map(key => tyeps[key]);

module.exports = tyeps;