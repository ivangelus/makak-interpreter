import { Keywords, Token, TokenType, createToken } from "../token/token";

const _0 = "0".charCodeAt(0);
const _9 = "9".charCodeAt(0);

const a = "a".charCodeAt(0);
const z = "z".charCodeAt(0);

const A = "A".charCodeAt(0);
const Z = "Z".charCodeAt(0);

const _ = "_".charCodeAt(0);

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

  private isLetter(ch: string): boolean {
    const char = ch.charCodeAt(0);
    return (a <= char && z >= char) || (A <= char && Z >= char) || char === _;
  }

  private isNumber(ch: string): boolean {
    const char = ch.charCodeAt(0);
    return _0 <= char && _9 >= char;
  }

  private readIdentifier(): string {
    const position = this.position;

    while (this.isLetter(this.input[this.position])) {
        this.readChar();
    }

    return this.input.slice(position, this.position);
  }

  private readNumber(): string {
    const position = this.position;

    while (this.isNumber(this.input[this.position])) {
        this.readChar();
    }

    return this.input.slice(position, this.position);
  }

  private skipWhitespace() {
    while (
      this.input[this.position] === " " ||
      this.input[this.position] === "\t" ||
      this.input[this.position] === "\r" ||
      this.input[this.position] === "\n"
    ) {
      this.readChar();
    }
  }

  public nextToken() {
    this.skipWhitespace();

    let tok: Token;
    switch (this.ch) {
      case "=":
        tok = createToken({ tokenType: TokenType.Assign, ch: this.ch });
        break;
      case ";":
        tok = createToken({ tokenType: TokenType.Semicolon, ch: this.ch });
        break;
      case "!":
        tok = createToken({ tokenType: TokenType.Bang, ch: this.ch });
        break;
      case "*":
        tok = createToken({ tokenType: TokenType.Asterisk, ch: this.ch });
        break;
      case ">":
        tok = createToken({ tokenType: TokenType.GT, ch: this.ch });
        break;
      case "<":
        tok = createToken({ tokenType: TokenType.LT, ch: this.ch });
        break;
      case "/":
        tok = createToken({ tokenType: TokenType.Slash, ch: this.ch });
        break;
      case "(":
        tok = createToken({ tokenType: TokenType.LParen, ch: this.ch });
        break;
      case ")":
        tok = createToken({ tokenType: TokenType.RParen, ch: this.ch });
        break;
      case ",":
        tok = createToken({ tokenType: TokenType.Comma, ch: this.ch });
        break;
      case "+":
        tok = createToken({ tokenType: TokenType.Plus, ch: this.ch });
        break;
      case "-":
        tok = createToken({ tokenType: TokenType.Minus, ch: this.ch });
        break;
      case "{":
        tok = createToken({ tokenType: TokenType.LBrace, ch: this.ch });
        break;
      case "}":
        tok = createToken({ tokenType: TokenType.RBrace, ch: this.ch });
        break;
      case 0:
        tok = createToken({ tokenType: TokenType.Eof, ch: "" });
        break;
      default:
        if (this.isLetter(this.ch)) {
          const ident = this.readIdentifier();
          const keyword = Keywords[ident as keyof typeof Keywords];
          if (keyword) {
            return keyword;
          } else {
            return createToken({ tokenType: TokenType.Ident, ch: ident });
          }
        } else if(this.isNumber(this.ch)) {
            const ident = this.readNumber();
            return createToken({ tokenType: TokenType.Int, ch: ident });
        } else {
          tok = createToken({ tokenType: TokenType.Illegal, ch: this.ch });
        }
    }
    this.readChar();
    return tok;
  }
}
