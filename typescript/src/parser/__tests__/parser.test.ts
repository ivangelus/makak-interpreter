import { Boolean } from "../../ast/expressions/boolean";
import { Expression } from "../../ast/expressions/expression";
import { Identifier } from "../../ast/expressions/identifier";
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
    it.each([
      ["!5;", "!", 5],
      ["-15;", "-", 15],
      ["!true;", "!", true],
      ["!false;", "!", false],
    ])(
      "should parse infix operator expressions",
      (input, operator, rightValue) => {
        const lexer = new Lexer(input);
        const parser = new Parser(lexer);
        const program = parser.parseProgram();

        const errors = parser.getErrors();

        expect(errors.length).toBe(0);

        expect(program.statements.length).toEqual(1);

        const expStmt = program.statements[0] as unknown as ExpressionStatement;
        expect(expStmt.constructor.name).toEqual("ExpressionStatement");

        const prefixExp =
          expStmt.getExpression() as unknown as PrefixExpression;
        expect(prefixExp.constructor.name).toEqual("PrefixExpression");
        expect(prefixExp.getOperator()).toEqual(operator);

        const prefixRightExp = prefixExp.getRight();
        testLiteralExpression(prefixRightExp, rightValue);
      }
    );
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
      ["true == true", true, "==", true],
      ["true != false", true, "!=", false],
      ["false == false", false, "==", false],
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

        const infixLeftExp = infixExp.getLeft();
        testLiteralExpression(infixLeftExp, leftValue);

        const infixRigthExp = infixExp.getRight();
        testLiteralExpression(infixRigthExp, rightValue);
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
      ["true", "true"],
      ["false", "false"],
      ["3 > 5 == false", "((3 > 5) == false)"],
      ["3 < 5 == true", "((3 < 5) == true)"],
      ["1 + (2 + 3) + 4", "((1 + (2 + 3)) + 4)"],
      ["(5 + 5) * 2", "((5 + 5) * 2)"],
      ["2 / (5 + 5)", "(2 / (5 + 5))"],
      ["-(5 + 5)", "(-(5 + 5))"],
      ["!(true == true)", "(!(true == true))"],
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

function testLiteralExpression(exp: Expression, value: any): void {
  switch (typeof value) {
    case "number":
      return testIntegerLiteral(exp as unknown as IntegerLiteral, value);
    case "string":
      return testIdentifier(exp as unknown as Identifier, value);
    case "boolean":
      return testBooleanLiteral(exp as unknown as Boolean, value);
  }
}

function testIntegerLiteral(
  integerLiteral: IntegerLiteral,
  value: number
): void {
  expect(integerLiteral.constructor.name).toEqual("IntegerLiteral");
  expect(integerLiteral.token.type).toEqual(TokenType.Int);
  expect(integerLiteral.token.literal).toEqual(String(value));
  expect(integerLiteral.getValue()).toEqual(value);
}

function testIdentifier(identifier: Identifier, value: string): void {
  expect(identifier.constructor.name).toEqual("Identifier");
  expect(identifier.token.type).toEqual(TokenType.Ident);
  expect(identifier.getValue()).toEqual(value);
}

function testBooleanLiteral(booleanLiteral: Boolean, value: boolean): void {
  expect(booleanLiteral.constructor.name).toEqual("Boolean");
  expect(booleanLiteral.getValue()).toEqual(value);
}

// function testInfixExpression(exp: InfixExpression, left: Expression, operator: string, right: Expression): void {
//   expect(exp.constructor.name).toEqual("InfixExpression");

// 	testLiteralExpression(exp.getLeft(), left);
//   expect(exp.getOperator()).toEqual(operator);
//   testLiteralExpression(exp.getRight(), right);
// }
