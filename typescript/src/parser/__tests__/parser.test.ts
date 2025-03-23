import { ArrayLiteral } from "../../ast/expressions/arrayLiteral";
import { HashLiteral } from "../../ast/expressions/hashLiteral";
import { Boolean } from "../../ast/expressions/boolean";
import { CallExpression } from "../../ast/expressions/callExpression";
import { Expression } from "../../ast/expressions/expression";
import { FunctionLiteral } from "../../ast/expressions/functionLiteral";
import { Identifier } from "../../ast/expressions/identifier";
import { IfExpression } from "../../ast/expressions/ifExpression";
import { IndexExpression } from "../../ast/expressions/indexExpression";
import { InfixExpression } from "../../ast/expressions/infix";
import { IntegerLiteral } from "../../ast/expressions/integerLiteral";
import { PrefixExpression } from "../../ast/expressions/prefix";
import { StringLiteral } from "../../ast/expressions/stringLiteral";
import { ExpressionStatement } from "../../ast/statements/expressionStatement";
import { LetStatement } from "../../ast/statements/letStatement";
import { ReturnStatement } from "../../ast/statements/returnStatement";
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
			"ExpressionStatement",
		);
		expect(
			(program.statements[0] as unknown as ExpressionStatement).getExpression()
				.constructor.name,
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
			"ExpressionStatement",
		);
		expect(
			(program.statements[0] as unknown as ExpressionStatement).getExpression()
				.constructor.name,
		).toEqual("IntegerLiteral");
		expect(
			(
				(
					program.statements[0] as unknown as ExpressionStatement
				).getExpression() as unknown as IntegerLiteral
			).getValue(),
		).toEqual(5);
	});

	it("should parse string literal expressions", () => {
		const input = '"let the strings begin";';
		const lexer = new Lexer(input);
		const parser = new Parser(lexer);
		const program = parser.parseProgram();

		const errors = parser.getErrors();

		expect(errors.length).toBe(0);

		expect(program.statements.length).toEqual(1);
		expect(program.statements[0].constructor.name).toEqual(
			"ExpressionStatement",
		);
		expect(
			(program.statements[0] as unknown as ExpressionStatement).getExpression()
				.constructor.name,
		).toEqual("StringLiteral");
		expect(
			(
				(
					program.statements[0] as unknown as ExpressionStatement
				).getExpression() as unknown as StringLiteral
			).getValue(),
		).toEqual("let the strings begin");
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
			},
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
			},
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
			["a + add(b * c) + d", "((a + add((b * c))) + d)"],
			[
				"add(a, b, 1, 2 * 3, 4 + 5, add(6, 7 * 8))",
				"add(a, b, 1, (2 * 3), (4 + 5), add(6, (7 * 8)))",
			],
			["add(a + b + c * d / f + g)", "add((((a + b) + ((c * d) / f)) + g))"],
			["a * [1, 2, 3, 4][b * c] * d", "((a * ([1, 2, 3, 4][(b * c)])) * d)"],
			[
				"add(a * b[2], b[1], 2 * [1, 2][1])",
				"add((a * (b[2])), (b[1]), (2 * ([1, 2][1])))",
			],
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

describe("if expressions", () => {
	it("should parse if expression", () => {
		const input = "if (x < y) { x }";
		const lexer = new Lexer(input);
		const parser = new Parser(lexer);
		const program = parser.parseProgram();
		const errors = parser.getErrors();

		expect(errors.length).toBe(0);
		const statements = program.statements;
		expect(statements.length).toBe(1);

		const expStmt = program.statements[0] as unknown as ExpressionStatement;
		expect(expStmt.constructor.name).toEqual("ExpressionStatement");

		const ifExp = expStmt.getExpression() as unknown as IfExpression;
		expect(ifExp.constructor.name).toEqual("IfExpression");
		testInfixExpression(
			ifExp.getCondition() as unknown as InfixExpression,
			"x",
			"<",
			"y",
		);

		const consequence = ifExp.getConsequence();
		expect(consequence.constructor.name).toEqual("BlockStatement");
		const consStmts = consequence.getStatements();
		expect(consStmts.length).toEqual(1);
		expect(consStmts[0].constructor.name).toEqual("ExpressionStatement");
		const childExpStmt = consStmts[0] as unknown as ExpressionStatement;
		testIdentifier(childExpStmt.getExpression() as unknown as Identifier, "x");

		expect(ifExp.getAlternative()).toEqual(null);
	});

	it("should parse if/else expression", () => {
		const input = "if (x < y) { x } else { y }";
		const lexer = new Lexer(input);
		const parser = new Parser(lexer);
		const program = parser.parseProgram();
		const errors = parser.getErrors();

		expect(errors.length).toBe(0);
		const statements = program.statements;
		expect(statements.length).toBe(1);

		const expStmt = program.statements[0] as unknown as ExpressionStatement;
		expect(expStmt.constructor.name).toEqual("ExpressionStatement");

		const ifExp = expStmt.getExpression() as unknown as IfExpression;
		expect(ifExp.constructor.name).toEqual("IfExpression");
		testInfixExpression(
			ifExp.getCondition() as unknown as InfixExpression,
			"x",
			"<",
			"y",
		);

		const consequence = ifExp.getConsequence();
		expect(consequence.constructor.name).toEqual("BlockStatement");
		const consStmts = consequence.getStatements();
		expect(consStmts.length).toEqual(1);
		expect(consStmts[0].constructor.name).toEqual("ExpressionStatement");
		const childConsStmt = consStmts[0] as unknown as ExpressionStatement;
		testIdentifier(childConsStmt.getExpression() as unknown as Identifier, "x");

		const alternative = ifExp.getAlternative();
		expect(alternative.constructor.name).toEqual("BlockStatement");
		const altStmts = alternative.getStatements();
		expect(altStmts.length).toEqual(1);
		expect(altStmts[0].constructor.name).toEqual("ExpressionStatement");
		const childValStmt = altStmts[0] as unknown as ExpressionStatement;
		testIdentifier(childValStmt.getExpression() as unknown as Identifier, "y");
	});
});

describe("function literals", () => {
	it("should parse function literals", () => {
		const input = "fn (x, y) { x + y; }";
		const lexer = new Lexer(input);
		const parser = new Parser(lexer);
		const program = parser.parseProgram();
		const errors = parser.getErrors();

		expect(errors.length).toBe(0);
		const statements = program.statements;
		expect(statements.length).toBe(1);

		const expStmt = program.statements[0] as unknown as ExpressionStatement;
		expect(expStmt.constructor.name).toEqual("ExpressionStatement");

		const fnExp = expStmt.getExpression() as unknown as FunctionLiteral;
		expect(fnExp.constructor.name).toEqual("FunctionLiteral");

		const params = fnExp.getParams();
		expect(params.length).toBe(2);

		testLiteralExpression(params[0], "x");
		testLiteralExpression(params[1], "y");

		const body = fnExp.getBody();
		expect(body.constructor.name).toEqual("BlockStatement");
		const bodyStmts = body.getStatements();
		expect(bodyStmts.length).toEqual(1);
		expect(bodyStmts[0].constructor.name).toEqual("ExpressionStatement");
		const childBodyStmt = bodyStmts[0] as unknown as ExpressionStatement;
		testInfixExpression(
			childBodyStmt.getExpression() as unknown as InfixExpression,
			"x",
			"+",
			"y",
		);
	});

	it.each([
		["fn() {};", []],
		["fn(x) {};", ["x"]],
		["fn(x, y, z) {};", ["x", "y", "z"]],
	])("should parse fn params properly", (input, expectedParams) => {
		const lexer = new Lexer(input);
		const parser = new Parser(lexer);
		const program = parser.parseProgram();
		const errors = parser.getErrors();

		const stmt = program.statements[0] as unknown as ExpressionStatement;
		const funcLit = stmt.getExpression() as unknown as FunctionLiteral;

		const params = funcLit.getParams();
		expect(params.length).toBe(expectedParams.length);

		for (let i = 0; i < params.length; i++) {
			testLiteralExpression(params[i], expectedParams[i]);
		}
	});
});

describe("call expressions", () => {
	it("should parse call expressions", () => {
		const input = "add(1, 2 * 3, 4 + 5);";
		const lexer = new Lexer(input);
		const parser = new Parser(lexer);
		const program = parser.parseProgram();
		const errors = parser.getErrors();

		expect(errors.length).toBe(0);
		const statements = program.statements;
		expect(statements.length).toBe(1);

		const expStmt = program.statements[0] as unknown as ExpressionStatement;
		expect(expStmt.constructor.name).toEqual("ExpressionStatement");

		const callExp = expStmt.getExpression() as unknown as CallExpression;
		expect(callExp.constructor.name).toEqual("CallExpression");

		const args = callExp.getArgs();
		expect(args.length).toBe(3);

		testLiteralExpression(args[0], 1);
		testIdentifier(callExp.getFunction() as unknown as Identifier, "add");

		testInfixExpression(args[1] as unknown as InfixExpression, 2, "*", 3);
		testInfixExpression(args[2] as unknown as InfixExpression, 4, "+", 5);
	});
});

describe("array literal", () => {
	it("should parse array literals", () => {
		const input = "[1, 2 * 2, 3 + 3]";
		const lexer = new Lexer(input);
		const parser = new Parser(lexer);
		const program = parser.parseProgram();
		const errors = parser.getErrors();

		expect(errors.length).toBe(0);
		const statements = program.statements;
		expect(statements.length).toBe(1);

		const expStmt = program.statements[0] as unknown as ExpressionStatement;
		expect(expStmt.constructor.name).toEqual("ExpressionStatement");

		const arrLit = expStmt.getExpression() as unknown as ArrayLiteral;
		expect(arrLit.constructor.name).toEqual("ArrayLiteral");

		const elements = arrLit.getElements();
		expect(elements.length).toBe(3);

		testIntegerLiteral(elements[0] as unknown as IntegerLiteral, 1);
		testInfixExpression(elements[1] as unknown as InfixExpression, 2, "*", 2);
		testInfixExpression(elements[2] as unknown as InfixExpression, 3, "+", 3);
	});
});

describe("hash literal", () => {
	it("should parse hash literals", () => {
		const input = `{ "one": 1, "two": 2, "three": 3 }`;
		const lexer = new Lexer(input);
		const parser = new Parser(lexer);
		const program = parser.parseProgram();
		const errors = parser.getErrors();

		expect(errors.length).toBe(0);
		const statements = program.statements;
		expect(statements.length).toBe(1);

		const expStmt = program.statements[0] as unknown as ExpressionStatement;
		expect(expStmt.constructor.name).toEqual("ExpressionStatement");

		const hashLiteral = expStmt.getExpression() as unknown as HashLiteral;
		expect(hashLiteral.constructor.name).toEqual("HashLiteral");

		const pairs = hashLiteral.getPairs();
		expect(pairs.size).toEqual(3);

		const expected = new Map([
			["one", 1],
			["two", 2],
			["three", 3],
		]);

		for (const [key, value] of pairs) {
			const stringLiteral = key as unknown as StringLiteral;
			const integerLiteral = value as unknown as IntegerLiteral;
			expect(stringLiteral.constructor.name).toEqual("StringLiteral");
			expect(integerLiteral.constructor.name).toEqual("IntegerLiteral");

			const expectedValue = expected.get(key.toString());

			testIntegerLiteral(integerLiteral, expectedValue);
		}
	});

	it("should parse empty hash literals", () => {
		const input = `{}`;
		const lexer = new Lexer(input);
		const parser = new Parser(lexer);
		const program = parser.parseProgram();
		const errors = parser.getErrors();

		expect(errors.length).toBe(0);
		const statements = program.statements;
		expect(statements.length).toBe(1);

		const expStmt = program.statements[0] as unknown as ExpressionStatement;
		expect(expStmt.constructor.name).toEqual("ExpressionStatement");

		const hashLiteral = expStmt.getExpression() as unknown as HashLiteral;
		expect(hashLiteral.constructor.name).toEqual("HashLiteral");

		const pairs = hashLiteral.getPairs();
		expect(pairs.size).toEqual(0);
	});

	it("should parse hash literals with expressions", () => {
		const input = `{ "one": 0 + 1, "two": 10 - 8, "three": 15 / 5 }`;
		const lexer = new Lexer(input);
		const parser = new Parser(lexer);
		const program = parser.parseProgram();
		const errors = parser.getErrors();

		expect(errors.length).toBe(0);
		const statements = program.statements;
		expect(statements.length).toBe(1);

		const expStmt = program.statements[0] as unknown as ExpressionStatement;
		expect(expStmt.constructor.name).toEqual("ExpressionStatement");

		const hashLiteral = expStmt.getExpression() as unknown as HashLiteral;
		expect(hashLiteral.constructor.name).toEqual("HashLiteral");

		const pairs = hashLiteral.getPairs();
		expect(pairs.size).toEqual(3);

		const expected = new Map([
			["one", (e: InfixExpression) => testInfixExpression(e, 0, "+", 1)],
			["two", (e: InfixExpression) => testInfixExpression(e, 10, "-", 8)],
			["three", (e: InfixExpression) => testInfixExpression(e, 15, "/", 5)],
		]);

		for (const [key, value] of pairs) {
			const stringLiteral = key as unknown as StringLiteral;
			expect(stringLiteral.constructor.name).toEqual("StringLiteral");
			const testFunc = expected.get(stringLiteral.toString());
			expect(testFunc).toBeDefined();
			testFunc(value as unknown as InfixExpression);
		}
	});


});

describe("index expression", () => {
	it("should parse index expressions", () => {
		const input = "myArray[1 + 1]";
		const lexer = new Lexer(input);
		const parser = new Parser(lexer);
		const program = parser.parseProgram();
		const errors = parser.getErrors();

		expect(errors.length).toBe(0);
		const statements = program.statements;
		expect(statements.length).toBe(1);

		const expStmt = program.statements[0] as unknown as ExpressionStatement;
		expect(expStmt.constructor.name).toEqual("ExpressionStatement");

		const indexExp = expStmt.getExpression() as unknown as IndexExpression;
		expect(indexExp.constructor.name).toEqual("IndexExpression");

		const index = indexExp.getIndex();
		const left = indexExp.getLeft();

		testIdentifier(left as unknown as Identifier, "myArray");
		testInfixExpression(index as unknown as InfixExpression, 1, "+", 1);
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
	value: number,
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

function testInfixExpression(
	exp: InfixExpression,
	left: string | number,
	operator: string,
	right: string | number,
): void {
	expect(exp.constructor.name).toEqual("InfixExpression");

	testLiteralExpression(exp.getLeft(), left);
	expect(exp.getOperator()).toEqual(operator);
	testLiteralExpression(exp.getRight(), right);
}
