import readline from "node:readline";
import { Lexer } from "../lexer/lexer";
import { Parser } from "../parser/parser";

const MONKEY_FACE = `            __,__
   .--.  .-"     "-.  .--.
  / .. \/  .-. .-.  \/ .. \
 | |  '|  /   Y   \  |'  | |
 | \   \  \ 0 | 0 /  /   / |
  \ '- ,\.-"""""""-./, -' /
   ''-' /_   ^ ^   _\ '-''
       |  \._   _./  |
       \   \ '~' /   /
        '._ '-=-' _.'
           '-----'
`;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: ">> ",
});

rl.prompt();

rl.on("line", (input: any) => {
  if (input && input.length) {
    const lexer = new Lexer(input);
    const parser = new Parser(lexer);
    const program = parser.parseProgram();
    const errors = parser.getErrors();
    if (errors.length !== 0) {
      printParserErrors(errors);
    }

    console.log(program.toString());
    console.log("\n");
  }
  rl.prompt();
});

rl.on("close", () => {
  console.log("aaand its gone");
});

function printParserErrors(errors: string[]) {
  console.log(MONKEY_FACE);
  console.log("Woops! We ran into some monkey business here!\n");
  console.log(" parser errors:\n");
  for (let i = 0; i < errors.length; i++) {
    console.log(`\t${errors[i]}\n`);
  }
}
