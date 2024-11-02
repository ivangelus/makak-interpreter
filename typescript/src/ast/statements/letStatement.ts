import { Token } from "../../token/token";
import { Expression } from "../expressions/expression";
import { Identifier } from "../expressions/identifier";
import { Statement } from "./statement";

export class LetStatement extends Statement {
  public token: Token; // the token.LET token
  public name: Identifier;
  public value: Expression;

  constructor(token: Token) {
    super(token);
  }

  public setName(identifier: Identifier) {
    this.name = identifier;
  }

  public setValue(v: Expression): void {
    this.value = v;
  }

  public getName(): Identifier {
    return this.name;
  }

  public toString(): string {
    let output: string = '';
    output += `${this.token.literal} `;
    output += `${this.name.toString()}`;
    output += ' = ';

    if (this.value && this.value !== null) {
      output += `${this.value.toString()}`;
    }
    output += ';';

    return output;
  }
}
