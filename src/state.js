/**
 * Created by swxy on 2017/6/14.
 */

const Token = require('./tokenize');
const TokenTypes = require('./tokenType');

const lineBreak = /\r\n?|\n|\u2028|\u2029/;
function isNewLine(code) {
    return code === 10 || code === 13 || code === 0x2028 || code == 0x2029;
}
function isIdentifierChar(code) {
    if (code < 48) return code === 36;
    if (code < 58) return true;
    if (code < 65) return false;
    if (code < 91) return true;
    if (code < 97) return code === 95;
    if (code < 123) return true;
    return false;
}
class Parser {
    constructor(input) {
        this.input = String(input);
        this.pos = 0;
        this.start = 0;
        this.end = 0;
        this.value = null;
        this.lineStart = 0;
        this.curLine = 1;
        this.body = [];
        this.expects = []; // 用于放期待的结束符合，例如遇到 { 则往里面加一个 }
        this.type = null;
    }

    nextToken() {
        this.start = this.pos;
        this.skipSpace();
        // 结束
        if (this.pos >= this.input.length) return this.finishToken('end');
        let code = this.input.charCodeAt(this.start);
        if (isIdentifierChar(code)) return this.readToken();

        return this.getTokenFormCode(code);
    }

    getTokenFormCode(code) {
        let expect;
        switch (code) {
            case 44:
                this.pos++;
                return this.finishToken(TokenTypes.comma); // ","
            case 91:
                this.pos++;
                this.expects.push(TokenTypes.bracketR);
                return this.finishToken(TokenTypes.bracketL); // [
            case 93:
                this.pos++;
                expect = this.expects.pop();
                if (expect !== TokenTypes.bracketR) {
                    this.raise(this.pos, 'Expect ' + expect + '  rather than ' + TokenTypes.bracketR);
                }
                return this.finishToken(TokenTypes.bracketR); // ]
            case 123:
                this.pos++;
                this.expects.push(TokenTypes.braceR);
                return this.finishToken(TokenTypes.braceL);
            case 125:
                this.pos++;
                expect = this.expects.pop();
                if (expect !== TokenTypes.braceR) {
                    this.raise(this.pos, 'Expect ' + expect + '  rather than ' + TokenTypes.braceR);
                }
                return this.finishToken(TokenTypes.braceR);
            case 58:
                this.pos++;
                return this.finishToken(TokenTypes.colon);
            case 34:
            case 39: // '"', "'"
                return this.readString(code);
            case 49:
            case 50:
            case 51:
            case 52:
            case 53:
            case 54:
            case 55:
            case 56:
            case 57: // 1-9
                return this.readNumber(false);
            default:

                return false;
        }
    }

    readToken() {
        let chunkStart = this.pos;
        while (this.pos < this.input.length) {
            let ch = this.input.charCodeAt(this.pos);
            if (isIdentifierChar(ch)) {
                this.pos++
            }
            else {
                break;
            }
        }
        let word = this.input.slice(chunkStart, this.pos);
        this.finishToken(TokenTypes.string, word);
    }

    readString(quote) {
        this.pos++;
        const chunkStart = this.pos;
        while (1) {
            if (this.pos > this.input.length) {
                this.raise(this.pos, "Unterminated string constant");
            }
            let code = this.input.charCodeAt(this.pos);
            if (code === quote) {
                return this.finishToken('string', this.input.slice(chunkStart, this.pos++));
            }
            if (isNewLine(code)) {
                this.raise(this.pos, "Unterminated string constant");
            }
            this.pos++;
        }
    }

    readNumber(startsWithDot) {
        let start = this.pos, isFloat = false;
        if (!startsWithDot && this.readInt() === null) this.raise(start, "Invalid number")
        let next = this.input.charCodeAt(this.pos)
        if (next === 46) { // '.'
            ++this.pos;
            this.readInt();
            isFloat = true;
            next = this.input.charCodeAt(this.pos)
        }
        if (isIdentifierChar(next)) this.raise(this.pos, "Identifier directly after number")

        let str = this.input.slice(start, this.pos), val;

        if (isFloat) val = parseFloat(str);
        else val = parseInt(str, 10);
        return this.finishToken(TokenTypes.number, val);
    }

    readInt() {
        let start = this.pos, total = 0;
        for (let i = 0, e = Infinity; i < e; ++i) {
            let code = this.input.charCodeAt(this.pos), val;
            if (code >= 48 && code <= 57) val = code - 48; // 0-9
            else {
                val = Infinity;
                break
            }
            ++this.pos;
            total = total * 10 + val;
        }
        if (this.pos === start) return null;
        return total;
    }

    finishToken(type, val) {
        this.end = this.pos;
        this.type = type;
        if (TokenTypes.inclue.indexOf(type) !== -1) {
            this.body.push(new Token({
                value: val || type,
                end: this.end,
                start: this.start,
                line: this.curLine
            }));
        }
        if (type === 'end' && this.expects.length) {
            this.raise(this.pos, 'Expect ' + this.expects.pop());
        }
    }

    skipSpace() {
        while (this.pos < this.input.length) {
            let code = this.input.charCodeAt(this.pos);
            switch (code) {
                case 32:
                case 160: // ' '
                    ++this.pos;
                    break;
                case 13:
                    if (this.input.charCodeAt(this.pos + 1) === 10) {
                        ++this.pos;
                    }
                case 10:
                    this.expectComma(this.pos);
                    ++this.pos;
                    ++this.curLine;
                    this.lineStart = this.pos;
                    break;
                default:
                    return;
            }
        }
    }

    expectComma(pos) {
        let code = this.input.charCodeAt(pos - 1);
        let next = this.input.charCodeAt(pos + 1);
        let start = pos - 1;
        while(code === 32 && start !== 0) {
            start--;
            code = this.input.charCodeAt(start);
        }
        if (start === 0) {
            return null;
        }
        if (code === 44) { // ,
            return true;
        }
        if (code === 91 || code === 123) { // [ {
            return true;
        }
        start = pos + 1;
        while (next === 32) {
            start++;
            next = this.input.charCodeAt(start);
        }
        if (next === 93 || next === 125) {
            return true;
        }
        this.raise(pos + 1, 'Expect ,');
    }

    raise(pos, message) {
        // let loc = getLineInfo(this.input, pos);
        message += " (" + this.curLine + ":" + (this.pos - this.lineStart ) + ")";
        let err = new SyntaxError(message);
        err.pos = pos;
        // err.loc = loc;
        err.raisedAt = this.pos;
        throw err;
    }
}

module.exports = Parser;