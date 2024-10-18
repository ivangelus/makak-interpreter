import { InfixExpression } from "../../ast/expressions/infix";
import { IntegerLiteral } from "../../ast/expressions/integerLiteral";
import { PrefixExpression } from "../../ast/expressions/prefix";
import { ExpressionStatement } from "../../ast/statements/expressionStatement";
import { LetStatement } from "../../ast/statements/letStatement";
import { Lexer } from "../../lexer/lexer";
import { TokenType } from "../../token/token";
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
        testCases[i].expectedIdentifier
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

    // TODO added prefix error because it is not implemented needs to be removed once it is supporting all token types
    const errors = parser.getErrors();
    expect(errors.length).toBe(4);
    expect(errors[0]).toBe("expected next token to be =, instead got INT");
    expect(errors[1]).toBe("expected next token to be IDENT, instead got =");
    expect(errors[2]).toBe("no prefix parse function for = found");
    expect(errors[3]).toBe("expected next token to be IDENT, instead got INT");
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
      // TODO
      // expect((stmt as ReturnStatement).getName().getValue()).toEqual(
      //   testCases[i].expectedIdentifier,
      // );
    }
  });

  it("should parse identifier expressions", () => {
    const input = "foobar;";
    const lexer = new Lexer(input);
    const parser = new Parser(lexer);
    const program = parser.parseProgram();

    const errors = parser.getErrors();

    expect(errors.length).toBe(0);

    expect(program.statements.length).toEqual(1);
    expect(program.statements[0].constructor.name).toEqual(
      "ExpressionStatement"
    );
    expect(
      (program.statements[0] as unknown as ExpressionStatement).getExpression()
        .constructor.name
    ).toEqual("Identifier");
  });

  it("should parse integer literal expressions", () => {
    const input = "5;";
    const lexer = new Lexer(input);
    const parser = new Parser(lexer);
    const program = parser.parseProgram();

    const errors = parser.getErrors();

    expect(errors.length).toBe(0);

    expect(program.statements.length).toEqual(1);
    expect(program.statements[0].constructor.name).toEqual(
      "ExpressionStatement"
    );
    expect(
      (program.statements[0] as unknown as ExpressionStatement).getExpression()
        .constructor.name
    ).toEqual("IntegerLiteral");
    expect(
      (
        (
          program.statements[0] as unknown as ExpressionStatement
        ).getExpression() as unknown as IntegerLiteral
      ).getValue()
    ).toEqual(5);
    expect(
      (
        (
          program.statements[0] as unknown as ExpressionStatement
        ).getExpression() as unknown as IntegerLiteral
      ).getValue()
    ).toEqual(5);
  });

  describe("prefix operators", () => {
    it('should parse "!" prefix operator', () => {
      const input = "!5;";
      const lexer = new Lexer(input);
      const parser = new Parser(lexer);
      const program = parser.parseProgram();

      const errors = parser.getErrors();

      expect(errors.length).toBe(0);

      expect(program.statements.length).toEqual(1);
      const expStmt = program.statements[0] as unknown as ExpressionStatement;
      expect(expStmt.constructor.name).toEqual("ExpressionStatement");

      const prefixExp = expStmt.getExpression() as unknown as PrefixExpression;
      expect(prefixExp.constructor.name).toEqual("PrefixExpression");
      expect(prefixExp.getOperator()).toEqual("!");

      const prefixRigthExp = prefixExp.getRight() as unknown as IntegerLiteral;
      expect(prefixRigthExp.token.type).toEqual(TokenType.Int);
      expect(prefixRigthExp.token.literal).toEqual("5");
      expect(prefixRigthExp.getValue()).toEqual(5);
    });

    // TODO a lot of duplication with "!" prefix test
    it('should parse "-" prefix operator', () => {
      const input = "-15;";
      const lexer = new Lexer(input);
      const parser = new Parser(lexer);
      const program = parser.parseProgram();

      const errors = parser.getErrors();

      expect(errors.length).toBe(0);

      expect(program.statements.length).toEqual(1);

      const expStmt = program.statements[0] as unknown as ExpressionStatement;
      expect(expStmt.constructor.name).toEqual("ExpressionStatement");

      const prefixExp = expStmt.getExpression() as unknown as PrefixExpression;
      expect(prefixExp.constructor.name).toEqual("PrefixExpression");
      expect(prefixExp.getOperator()).toEqual("-");

      const prefixRigthExp = prefixExp.getRight() as unknown as IntegerLiteral;
      expect(prefixRigthExp.token.type).toEqual(TokenType.Int);
      expect(prefixRigthExp.token.literal).toEqual("15");
      expect(prefixRigthExp.getValue()).toEqual(15);
    });
  });

  describe("infix operators", () => {
    it.each([
      ["5 + 5;", 5, "+", 5],
      ["5 - 5;", 5, "-", 5],
      ["5 * 5;", 5, "*", 5],
      ["5 / 5;", 5, "/", 5],
      ["5 > 5;", 5, ">", 5],
      ["5 < 5;", 5, "<", 5],
      ["5 == 5;", 5, "==", 5],
      ["5 != 5;", 5, "!=", 5],
    ])(
      "should parse infix operator expressions",
      (input, leftValue, operator, rightValue) => {
        const lexer = new Lexer(input);
        const parser = new Parser(lexer);
        const program = parser.parseProgram();

        const errors = parser.getErrors();

        expect(errors.length).toBe(0);

        expect(program.statements.length).toEqual(1);

        const expStmt = program.statements[0] as unknown as ExpressionStatement;
        expect(expStmt.constructor.name).toEqual("ExpressionStatement");

        const infixExp = expStmt.getExpression() as unknown as InfixExpression;
        expect(infixExp.constructor.name).toEqual("InfixExpression");
        expect(infixExp.getOperator()).toEqual(operator);

        const infixLeftExp = infixExp.getLeft() as unknown as IntegerLiteral;
        expect(infixLeftExp.token.type).toEqual(TokenType.Int);
        expect(infixLeftExp.token.literal).toEqual(String(leftValue));
        expect(infixLeftExp.getValue()).toEqual(leftValue);

        const infixRigthExp = infixExp.getRight() as unknown as IntegerLiteral;
        expect(infixRigthExp.token.type).toEqual(TokenType.Int);
        expect(infixLeftExp.token.literal).toEqual(String(rightValue));
        expect(infixRigthExp.getValue()).toEqual(rightValue);
      }
    );
  });

  describe("parsing expressions", () => {
    it.each([
      ["-a * b", "((-a) * b)"],
      ["!-a;", "(!(-a))"],
      ["a + b + c;", "((a + b) + c)"],
      ["a + b - c;", "((a + b) - c)"],
      ["a * b * c;", "((a * b) * c)"],
    ])("should parse properly", (input, stringified) => {
      const lexer = new Lexer(input);
      const parser = new Parser(lexer);
      const program = parser.parseProgram();

      const errors = parser.getErrors();

      expect(errors.length).toBe(0);
      expect(program.toString()).toEqual(stringified);
    });
  });
});
