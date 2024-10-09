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

  public getName(): Identifier {
    return this.name;
  }
}
