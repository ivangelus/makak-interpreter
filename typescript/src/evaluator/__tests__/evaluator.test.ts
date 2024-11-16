import { Lexer } from "../../lexer/lexer";
import { ERROR_OBJECT, MonkeyBoolean, MonkeyError, MonkeyInteger, MonkeyNull, NULL_OBJECT, ValueObject } from "../../object/valueObject";
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
    [
      "5 + true;",
      "type mismatch: INTEGER + BOOLEAN",
    ],
  [
      "5 + true; 5;",
      "type mismatch: INTEGER + BOOLEAN",
  ],
  [
      "-true",
      "unknown operator: -BOOLEAN",
  ],
  [
      "true + false;",
      "unknown operator: BOOLEAN + BOOLEAN",
  ],
  [
      "5; true + false; 5",
      "unknown operator: BOOLEAN + BOOLEAN",
  ],
  [
      "if (10 > 1) { true + false; }",
      "unknown operator: BOOLEAN + BOOLEAN",
  ],
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
  ])("should handle syntax errors", (input, output) => {
    const evaluated = testEval(input);

    expect(evaluated.getType()).toEqual(ERROR_OBJECT);
    expect((evaluated as unknown as MonkeyError).getMessage()).toEqual(output);
  });
});


function testEval(input: string): ValueObject {
    const lexer = new Lexer(input);
    const parser = new Parser(lexer);
    const program = parser.parseProgram();

    return evaluate(program);
}

function testIntegerObject(obj: ValueObject, expected: number): void {
    expect(obj.constructor.name).toEqual('MonkeyInteger');
    expect((obj as unknown as MonkeyInteger).getValue()).toEqual(expected);
}

function testBooleanObject(obj: ValueObject, expected: boolean): void {
    expect(obj.constructor.name).toEqual('MonkeyBoolean');
    expect((obj as unknown as MonkeyBoolean).getValue()).toEqual(expected);
}

function testNullObject(obj: ValueObject): void {
  expect((obj as unknown as MonkeyNull).getType()).toEqual(NULL_OBJECT);
}