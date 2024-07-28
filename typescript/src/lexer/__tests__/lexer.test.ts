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
});
