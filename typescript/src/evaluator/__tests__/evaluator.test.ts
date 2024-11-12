import { Lexer } from "../../lexer/lexer";
import { MonkeyBoolean, MonkeyInteger, ValueObject } from "../../object/valueObject";
import { Parser } from "../../parser/parser";
import { evaluate } from "../evaluator";

describe("Evaluator", () => {
  it.each([
    ['5', 5],
    ['10', 10],
    ['-5', -5],
    ['-10', -10],
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
    ['true', true],
    ['false', false],
  ])("should evaluate booleans", (input, output) => {
    const evaluated = testEval(input);
    testBooleanObject(evaluated, output);
  });

  it.each([
    ['!true', false],
    ['!false', true],
    ['!5', false],
    ['!!true', true],
    ['!!false', false],
    ['!!5', true],
  ])("should evaluate bang prefix expressions", (input, output) => {
    const evaluated = testEval(input);
    testBooleanObject(evaluated, output);
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