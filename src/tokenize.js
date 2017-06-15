/**
 * Created by swxy on 2017/6/14.
 */


class Token {
    constructor(p) {
        this.line = p.line;
        this.value = p.value;
        this.start = p.start;
        this.end = p.end;
    }
}

module.exports = Token;