import { Lexer } from "../../lexer/lexer";
import { MonkeyInteger, ValueObject } from "../../object/valueObject";
import { Parser } from "../../parser/parser";
import { evaluate } from "../evaluator";

describe("Evaluator", () => {
  it.each([
    ['5', 5],
    ['10', 10],
  ])("should evaluate integer literals", (input, output) => {
    const evaluated = testEval(input);
    testIntegerObject(evaluated, output);
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