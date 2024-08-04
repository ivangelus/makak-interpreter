import readline from "node:readline";
import { Lexer } from "../lexer/lexer";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: ">> ",
});

rl.prompt();

rl.on("line", (input: any) => {
  if (input && input.length) {
    const lexer = new Lexer(input);
    while (true) {
      const token = lexer.nextToken();
      console.log(token);
      if (token.type === "EOF") {
        break;
      }
    }
  }
  rl.prompt();
});

rl.on("close", () => {
  console.log("aaand its gone");
});
