import { Token, TokenType, createToken } from "../token/token";

export class Lexer {
    private input: string;
    private position: number;
    private readPosition: number;
    private ch: string | 0;
    private inputLength: number;

    constructor(input: string) {
        this.input = input;
        this.position = 0;
        this.readPosition = 1;
        this.ch = input[0];
        this.inputLength = input.length;
    }

    private readChar(): void {
        if (this.readPosition >= this.inputLength) {
            this.ch = 0;
        } else {
            this.ch = this.input[this.readPosition];
        }
        this.position = this.readPosition;
        this.readPosition += 1;
    }

    public nextToken() {
        let tok: Token;
        switch (this.ch) {
            case '=':
                tok = createToken({ tokenType: TokenType.Assign, ch: this.ch });
                break;
            case ';':
                tok = createToken({ tokenType: TokenType.Semicolon, ch: this.ch });
                break;
            case '(':
                tok = createToken({ tokenType: TokenType.LParen, ch: this.ch });
                break;
            case ')':
                tok = createToken({ tokenType: TokenType.RParen, ch: this.ch });
                break;
            case ',':
                tok = createToken({ tokenType: TokenType.Comma, ch: this.ch });
                break;
            case '+':
                tok = createToken({ tokenType: TokenType.Plus, ch: this.ch });
                break;
            case '{':
                tok = createToken({ tokenType: TokenType.LBrace, ch: this.ch });
                break;
            case '}':
                tok = createToken({ tokenType: TokenType.RBrace, ch: this.ch });
                break;
            case 0:
                tok = createToken({ tokenType: TokenType.Eof, ch: '' });
                break;
        }
        this.readChar();
        return tok;
    }
}