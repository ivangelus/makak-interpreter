import { Lexer } from "../../lexer/lexer";
import { Parser } from "../../parser/parser";

describe('ast', () => {
    describe('program', () => {
        it('should have utility toString function', () => {
            const input = "let myVar = anotherVar;";
            const lexer = new Lexer(input);
            const parser = new Parser(lexer);
            const program = parser.parseProgram();
            const stringified = program.toString();
            
            expect(stringified).toBe("let myVar = anotherVar;")
        })

    })
})