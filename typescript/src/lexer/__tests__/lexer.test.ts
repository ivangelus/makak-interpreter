import { TokenType } from "../../token/token";
import { Lexer } from "../lexer";

describe("Lexer", () => {
  it("return expected token array with given input", () => {
    const input = `=+(){},;`;
    const lexer = new Lexer(input);
    const testCases = [
      { expectedType: TokenType.Assign, expectedLiteral: "=" },
      { expectedType: TokenType.Plus, expectedLiteral: "+" },
      { expectedType: TokenType.LParen, expectedLiteral: "(" },
      { expectedType: TokenType.RParen, expectedLiteral: ")" },
      { expectedType: TokenType.LBrace, expectedLiteral: "{" },
      { expectedType: TokenType.RBrace, expectedLiteral: "}" },
      { expectedType: TokenType.Comma, expectedLiteral: "," },
      { expectedType: TokenType.Semicolon, expectedLiteral: ";" },
      { expectedType: TokenType.Eof, expectedLiteral: "" },
    ];

    for (let i = 0; i < testCases.length; i++) {
        const tok = lexer.nextToken();
        expect(tok.type).toEqual(testCases[i].expectedType);
        expect(tok.literal).toEqual(testCases[i].expectedLiteral);
    }
  });

  it("works with more comprehesive subset of monkey language", () => {
    const input = `let five = 5;
    let ten = 10;
    
    let add = fn(x, y) {
      x + y;
    };
    
    let result = add(five, ten);
    `;
    const lexer = new Lexer(input);
    const testCases = [
      {expectedType: TokenType.Let, expectedLiteral: "let"},
      { expectedType: TokenType.Ident, expectedLiteral: "five"},
      { expectedType: TokenType.Assign, expectedLiteral: "="},
      { expectedType: TokenType.Int, expectedLiteral: "5"},
      { expectedType: TokenType.Semicolon, expectedLiteral: ";"},
      { expectedType: TokenType.Let, expectedLiteral: "let"},
      { expectedType: TokenType.Ident, expectedLiteral: "ten"},
      { expectedType: TokenType.Assign, expectedLiteral: "="},
      { expectedType: TokenType.Int, expectedLiteral: "10"},
      { expectedType: TokenType.Semicolon, expectedLiteral: ";"},
      { expectedType: TokenType.Let, expectedLiteral: "let"},
      { expectedType: TokenType.Ident, expectedLiteral: "add"},
      { expectedType: TokenType.Assign, expectedLiteral: "="},
      { expectedType: TokenType.Function, expectedLiteral: "fn"},
      { expectedType: TokenType.LParen, expectedLiteral: "("},
      { expectedType: TokenType.Ident, expectedLiteral: "x"},
      { expectedType: TokenType.Comma, expectedLiteral: ","},
      { expectedType: TokenType.Ident, expectedLiteral: "y"},
      { expectedType: TokenType.RParen, expectedLiteral: ")"},
      { expectedType: TokenType.LBrace, expectedLiteral: "{"},
      { expectedType: TokenType.Ident, expectedLiteral: "x"},
      { expectedType: TokenType.Plus, expectedLiteral: "+"},
      { expectedType: TokenType.Ident, expectedLiteral: "y"},
      { expectedType: TokenType.Semicolon, expectedLiteral: ";"},
      { expectedType: TokenType.RBrace, expectedLiteral: "}"},
      { expectedType: TokenType.Semicolon, expectedLiteral: ";"},
      { expectedType: TokenType.Let, expectedLiteral: "let"},
      { expectedType: TokenType.Ident, expectedLiteral: "result"},
      { expectedType: TokenType.Assign, expectedLiteral: "="},
      { expectedType: TokenType.Ident, expectedLiteral: "add"},
      { expectedType: TokenType.LParen, expectedLiteral: "("},
      { expectedType: TokenType.Ident, expectedLiteral: "five"},
      { expectedType: TokenType.Comma, expectedLiteral: ","},
      { expectedType: TokenType.Ident, expectedLiteral: "ten"},
      { expectedType: TokenType.RParen, expectedLiteral: ")"},
      { expectedType: TokenType.Semicolon, expectedLiteral: ";"},
      { expectedType: TokenType.Eof, expectedLiteral: ""},
    ];

    for (let i = 0; i < testCases.length; i++) {
      const tok = lexer.nextToken();
      expect(tok.type).toEqual(testCases[i].expectedType);
      expect(tok.literal).toEqual(testCases[i].expectedLiteral);
  }
  })
});
