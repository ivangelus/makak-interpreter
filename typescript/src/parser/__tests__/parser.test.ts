import { LetStatement } from "../../ast/statements/letStatement";
import { ReturnStatement } from "../../ast/statements/returnStatement";
import { Lexer } from "../../lexer/lexer";
import { Parser } from "../parser";

describe("Parser", () => {
  it("should parse let statements", () => {
    const input = `
        let x = 5;
        let y = 10;
        let foobar = 838383;
        `;
    const lexer = new Lexer(input);

    const parser = new Parser(lexer);

    const testCases = [
      { expectedIdentifier: "x" },
      { expectedIdentifier: "y" },
      { expectedIdentifier: "foobar" },
    ];

    const program = parser.parseProgram();

    for (let i = 0; i < testCases.length; i++) {
      const stmt = program.statements[i];
      expect(stmt.tokenLiteral()).toEqual("let");
      expect((stmt as LetStatement).getName().getValue()).toEqual(
        testCases[i].expectedIdentifier,
      );
    }
  });

  it("should handle errors and keep them internally", () => {
    const input = `
      let x 5;
      let = 10;
      let 838383;
    `;
    const lexer = new Lexer(input);

    const parser = new Parser(lexer);

    parser.parseProgram();

    const errors = parser.getErrors();
    expect(errors.length).toBe(3);
    expect(errors[0]).toBe("expected next token to be =, instead got INT");
    expect(errors[1]).toBe("expected next token to be IDENT, instead got =");
    expect(errors[2]).toBe("expected next token to be IDENT, instead got INT");
  });

  it("should parse return statements", () => {
    const input = `
    return 5;
    return 10;
    return 993322;
    `;

    const lexer = new Lexer(input);

    const parser = new Parser(lexer);

    const testCases = [
      { expectedIdentifier: "x" },
      { expectedIdentifier: "y" },
      { expectedIdentifier: "foobar" },
    ];

    const program = parser.parseProgram();

    expect(program.statements.length).toEqual(3);

    for (let i = 0; i < testCases.length; i++) {
      const stmt = program.statements[i];
      expect(stmt.tokenLiteral()).toEqual("return");
      // expect((stmt as ReturnStatement).getName().getValue()).toEqual(
      //   testCases[i].expectedIdentifier,
      // );
    }
  });
});
