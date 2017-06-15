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
        this.type = null;
    }

    nextToken() {
        this.start = this.pos;
        if (this.start === 6) {
            debugger
        }
        this.skipSpace();
        // 结束
        if (this.pos >= this.input.length) return this.finishToken('end');
        let code = this.input.charCodeAt(this.start);
        if (isIdentifierChar(code)) return this.readToken();

        return this.getTokenFormCode(code);
    }

    getTokenFormCode(code) {
        switch (code) {
            case 44:
                this.pos++;
                return this.finishToken(TokenTypes.comma); // ","
            case 91:
                this.pos++;
                return this.finishToken(TokenTypes.bracketL);
            case 93:
                this.pos++;
                return this.finishToken(TokenTypes.bracketR);
            case 123:
                this.pos++;
                return this.finishToken(TokenTypes.braceL);
            case 125:
                this.pos++;
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
                return console.error("Unterminated string constant");
            }
            let code = this.input.charCodeAt(this.pos);
            if (code === quote) {
                return this.finishToken('string', this.input.slice(chunkStart, this.pos++));
            }
            if (isNewLine(code)) {
                return console.error("Unterminated string constant");
            }
            this.pos++;
        }
    }

    readNumber(code) {

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
                    ++this.pos;
                    ++this.curLine;
                    this.lineStart = this.pos;
                    break;
                default:
                    return;
            }
        }
    }
}

module.exports = Parser;