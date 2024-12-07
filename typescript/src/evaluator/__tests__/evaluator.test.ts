import { Lexer } from "../../lexer/lexer";
import { MonkeyEnvironment } from "../../object/environment";
import {
	ARRAY_OBJECT,
	ERROR_OBJECT,
	FUNCTION_OBJECT,
	MonkeyArray,
	MonkeyBoolean,
	MonkeyError,
	MonkeyFunction,
	MonkeyInteger,
	MonkeyNull,
	MonkeyString,
	NULL_OBJECT,
	STRING_OBJECT,
	ValueObject,
} from "../../object/valueObject";
import { Parser } from "../../parser/parser";
import { evaluate } from "../evaluator";

describe("Evaluator", () => {
	it.each([
		["5", 5],
		["10", 10],
		["-5", -5],
		["-10", -10],
		["5 + 5 + 5 + 5 - 10", 10],
		["2 * 2 * 2 * 2 * 2", 32],
		["-50 + 100 + -50", 0],
		["5 * 2 + 10", 20],
		["5 + 2 * 10", 25],
		["20 + 2 * -10", 0],
		["50 / 2 * 2 + 10", 60],
		["2 * (5 + 10)", 30],
		["3 * 3 * 3 + 10", 37],
		["3 * (3 * 3) + 10", 37],
		["(5 + 10 * 2 + 15 / 3) * 2 + -10", 50],
	])("should evaluate integer literals", (input, output) => {
		const evaluated = testEval(input);
		testIntegerObject(evaluated, output);
	});

	it.each([
		["true", true],
		["false", false],
		["1 < 2", true],
		["1 > 2", false],
		["1 < 1", false],
		["1 > 1", false],
		["1 == 1", true],
		["1 != 1", false],
		["1 == 2", false],
		["1 != 2", true],
		["true == true", true],
		["false == false", true],
		["true == false", false],
		["true != false", true],
		["false != true", true],
		["(1 < 2) == true", true],
		["(1 < 2) == false", false],
		["(1 > 2) == true", false],
		["(1 > 2) == false", true],
	])("should evaluate boolean expressions", (input, output) => {
		const evaluated = testEval(input);
		testBooleanObject(evaluated, output);
	});

	it.each([
		["!true", false],
		["!false", true],
		["!5", false],
		["!!true", true],
		["!!false", false],
		["!!5", true],
	])("should evaluate bang prefix expressions", (input, output) => {
		const evaluated = testEval(input);
		testBooleanObject(evaluated, output);
	});

	it.each([
		["if (true) { 10 }", 10],
		["if (false) { 10 }", null],
		["if (1) { 10 }", 10],
		["if (1 < 2) { 10 }", 10],
		["if (1 > 2) { 10 }", null],
		["if (1 > 2) { 10 } else { 20 }", 20],
		["if (1 < 2) { 10 } else { 20 }", 10],
	])("should evaluate if conditionals", (input, output) => {
		const evaluated = testEval(input);
		if (output !== null) {
			testIntegerObject(evaluated, output);
		} else {
			testNullObject;
		}
	});

	it.each([
		["return 10;", 10],
		["return 10; 9;", 10],
		["return 2 * 5; 9;", 10],
		["9; return 2 * 5; 9;", 10],
		[
			`
    if (10 > 1) {
      if (10 > 1) {
        return 10;
      }

      return 1;
    }
`,
			10,
		],
	])("should evaluate return statements", (input, output) => {
		const evaluated = testEval(input);
		testIntegerObject(evaluated, output);
	});

	it.each([
		["5 + true;", "type mismatch: INTEGER + BOOLEAN"],
		["5 + true; 5;", "type mismatch: INTEGER + BOOLEAN"],
		["-true", "unknown operator: -BOOLEAN"],
		["true + false;", "unknown operator: BOOLEAN + BOOLEAN"],
		["5; true + false; 5", "unknown operator: BOOLEAN + BOOLEAN"],
		["if (10 > 1) { true + false; }", "unknown operator: BOOLEAN + BOOLEAN"],
		[
			`
if (10 > 1) {
if (10 > 1) {
return true + false;
}

return 1;
}
`,
			"unknown operator: BOOLEAN + BOOLEAN",
		],
		["foobar", "identifier not found: foobar"],
		[`"Hello" - "World"`, "unknown operator: STRING - STRING"],
	])("should handle syntax errors", (input, output) => {
		const evaluated = testEval(input);

		expect(evaluated.getType()).toEqual(ERROR_OBJECT);
		expect((evaluated as unknown as MonkeyError).getMessage()).toEqual(output);
	});

	it.each([
		["let a = 5; a;", 5],
		["let a = 5 * 5; a;", 25],
		["let a = 5; let b = a; b;", 5],
		["let a = 5; let b = a; let c = a + b + 5; c;", 15],
	])("should evaluate let statements", (input, output) => {
		const evaluated = testEval(input);
		testIntegerObject(evaluated, output);
	});

	it("should evaluate string literals", () => {
		const input = `"Hello World!"`;
		const evaluated = testEval(input);

		expect(evaluated.getType()).toEqual(STRING_OBJECT);

		expect((evaluated as unknown as MonkeyString).getValue()).toEqual(
			"Hello World!",
		);
	});

	it("should support string concatenation", () => {
		const input = `"Hello" + " " + "World!"`;
		const evaluated = testEval(input);

		expect(evaluated.getType()).toEqual(STRING_OBJECT);
		expect((evaluated as unknown as MonkeyString).getValue()).toEqual(
			"Hello World!",
		);
	});

	it("should evaluate basic function", () => {
		const input = "fn(x) { x + 2; };";
		const evaluated = testEval(input);

		expect(evaluated.getType()).toEqual(FUNCTION_OBJECT);

		const params = (evaluated as unknown as MonkeyFunction).getParams();
		const body = (evaluated as unknown as MonkeyFunction).getBody();

		expect(params.length).toEqual(1);
		expect(params[0].toString()).toEqual("x");
		expect(body.toString()).toEqual("(x + 2)");
	});

	it.each([
		["let identity = fn(x) { x; }; identity(5);", 5],
		["let identity = fn(x) { return x; }; identity(5);", 5],
		["let double = fn(x) { x * 2; }; double(5);", 10],
		["let add = fn(x, y) { x + y; }; add(5, 5);", 10],
		["let add = fn(x, y) { x + y; }; add(5 + 5, add(5, 5));", 20],
		["fn(x) { x; }(5)", 5],
	])("should evaluate functions", (input, output) => {
		const evaluated = testEval(input);
		testIntegerObject(evaluated, output);
	});

	it("should work with closures", () => {
		const input = `
    let newMultiplier = fn(x) {
      fn(y) { x * y };
    };
    
    let multiplyTwo = newMultiplier(2);
    multiplyTwo(3);`;

		testIntegerObject(testEval(input), 6);
	});

	describe("builtin functions", () => {
		it.each([
			[`len("")`, 0],
			[`len("four")`, 4],
			[`len("hello world")`, 11],
			[`len([1, 2, 3])`, 3],
			[`len([])`, 0],
			[`let arr = [1, 2]; len(arr)`, 2],
			[`len(1)`, 'argument to "len" not supported, got INTEGER'],
			[`len("one", "two")`, "wrong number of arguments. got=2, want=1"],
		])("len function", (input, output) => {
			const evaluated = testEval(input);

			switch (typeof output) {
				case "string":
					expect(evaluated.getType()).toEqual(ERROR_OBJECT);
					expect((evaluated as unknown as MonkeyError).getMessage()).toEqual(
						output,
					);
					break;
				case "number":
					testIntegerObject(evaluated, output as unknown as number);
					break;
			}
		});

		it.each([
			["first([])", null],
			["first([1])", 1],
			["first([2, 3])", 2],
			["let arr = [1, 2]; first(arr)", 1],
			["first([], [])", "wrong number of arguments. got=2, want=1"],
			['first("one")', 'argument to "first" must be ARRAY, got STRING'],
		])("first function", (input, output) => {
			const evaluated = testEval(input);

			switch (typeof output) {
				case "string":
					expect(evaluated.getType()).toEqual(ERROR_OBJECT);
					expect((evaluated as unknown as MonkeyError).getMessage()).toEqual(
						output,
					);
					break;
				case "number":
					testIntegerObject(evaluated, output as unknown as number);
					break;
				case "object":
					if (output === null) {
						testNullObject(evaluated);
					}
					break;
			}
		});

		it.each([
			["last([])", null],
			["last([1])", 1],
			["last([2, 3])", 3],
			["let arr = [1, 2]; last(arr)", 2],
			["last([], [])", "wrong number of arguments. got=2, want=1"],
			['last("one")', 'argument to "last" must be ARRAY, got STRING'],
		])("last function", (input, output) => {
			const evaluated = testEval(input);

			switch (typeof output) {
				case "string":
					expect(evaluated.getType()).toEqual(ERROR_OBJECT);
					expect((evaluated as unknown as MonkeyError).getMessage()).toEqual(
						output,
					);
					break;
				case "number":
					testIntegerObject(evaluated, output as unknown as number);
					break;
				case "object":
					if (output === null) {
						testNullObject(evaluated);
					}
					break;
			}
		});

		it.each([
			["rest([])", null],
			["rest([1])", []],
			["rest([2, 3])", [3]],
			["let arr = [1, 2]; rest(arr)", [2]],
			["rest([], [])", "wrong number of arguments. got=2, want=1"],
			['rest("one")', 'argument to "rest" must be ARRAY, got STRING'],
		])("rest function", (input, output) => {
			const evaluated = testEval(input);

			switch (typeof output) {
				case "string":
					expect(evaluated.getType()).toEqual(ERROR_OBJECT);
					expect((evaluated as unknown as MonkeyError).getMessage()).toEqual(
						output,
					);
					break;
				case "number":
					testIntegerObject(evaluated, output as unknown as number);
					break;
				case "object":
					if (output === null) {
						testNullObject(evaluated);
					}
					if (Array.isArray(output)) {
						const elements = (
							evaluated as unknown as MonkeyArray
						).getElements();
						expect(elements.length).toEqual(output.length);
						for (let i = 0; i < elements.length; i++) {
							testIntegerObject(elements[i], output[i]);
						}
					}
					break;
			}
		});

		it.each([
			["push([], 1)", [1]],
			["push([1], 2)", [1, 2]],
			["let arr = [1, 2]; push(arr, 1)", [1, 2, 1]],
			["push([])", "wrong number of arguments. got=1, want=2"],
			["push([], 1, 1)", "wrong number of arguments. got=3, want=2"],
			['push("one", 1)', 'argument to "push" must be ARRAY, got STRING'],
		])("push function", (input, output) => {
			const evaluated = testEval(input);

			switch (typeof output) {
				case "string":
					expect(evaluated.getType()).toEqual(ERROR_OBJECT);
					expect((evaluated as unknown as MonkeyError).getMessage()).toEqual(
						output,
					);
					break;
				case "number":
					testIntegerObject(evaluated, output as unknown as number);
					break;
				case "object":
					if (output === null) {
						testNullObject(evaluated);
					}
					if (Array.isArray(output)) {
						const elements = (
							evaluated as unknown as MonkeyArray
						).getElements();
						expect(elements.length).toEqual(output.length);
						for (let i = 0; i < elements.length; i++) {
							testIntegerObject(elements[i], output[i]);
						}
					}
					break;
			}
		});
	});

	describe("arrays", () => {
		it("should evaluate array literals", () => {
			const input = "[1, 2 * 2, 3 + 3]";
			const evaluated = testEval(input);

			expect(evaluated.getType()).toEqual(ARRAY_OBJECT);

			const elements = (evaluated as unknown as MonkeyArray).getElements();
			expect(elements.length).toEqual(3);

			testIntegerObject(elements[0], 1);
			testIntegerObject(elements[1], 4);
			testIntegerObject(elements[2], 6);
		});

		it.each([
			["[1, 2, 3][0]", 1],
			["[1, 2, 3][1]", 2],
			["[1, 2, 3][2]", 3],
			["let i = 0; [1][i];", 1],
			["[1, 2, 3][1 + 1];", 3],
			["let myArray = [1, 2, 3]; myArray[2];", 3],
			["let myArray = [1, 2, 3]; myArray[0] + myArray[1] + myArray[2];", 6],
			["let myArray = [1, 2, 3]; let i = myArray[0]; myArray[i]", 2],
			["[1, 2, 3][3]", null],
			["[1, 2, 3][-1]", null],
		])("should support array index expressions", (input, output) => {
			const evaluated = testEval(input);
			if (typeof output === "number") {
				testIntegerObject(evaluated, output);
			} else {
				testNullObject(evaluated);
			}
		});

		it.each([
			[`len("")`, 0],
			[`len("four")`, 4],
			[`len("hello world")`, 11],
			[`len(1)`, 'argument to "len" not supported, got INTEGER'],
			[`len("one", "two")`, "wrong number of arguments. got=2, want=1"],
		])("len function", (input, output) => {
			const evaluated = testEval(input);

			switch (typeof output) {
				case "string":
					expect(evaluated.getType()).toEqual(ERROR_OBJECT);
					expect((evaluated as unknown as MonkeyError).getMessage()).toEqual(
						output,
					);
					break;
				case "number":
					testIntegerObject(evaluated, output as unknown as number);
					break;
			}
		});
	});
});

function testEval(input: string): ValueObject {
	const lexer = new Lexer(input);
	const parser = new Parser(lexer);
	const program = parser.parseProgram();
	const env = new MonkeyEnvironment(new Map());

	return evaluate(program, env);
}

function testIntegerObject(obj: ValueObject, expected: number): void {
	expect(obj.constructor.name).toEqual("MonkeyInteger");
	expect((obj as unknown as MonkeyInteger).getValue()).toEqual(expected);
}

function testBooleanObject(obj: ValueObject, expected: boolean): void {
	expect(obj.constructor.name).toEqual("MonkeyBoolean");
	expect((obj as unknown as MonkeyBoolean).getValue()).toEqual(expected);
}

function testNullObject(obj: ValueObject): void {
	expect((obj as unknown as MonkeyNull).getType()).toEqual(NULL_OBJECT);
}
