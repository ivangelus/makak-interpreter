import { Token } from "../../token/token";
import { Expression } from "./expression";

export class Identifier extends Expression {
  constructor(token: Token, value: string) {
    super(token);
    this.value = value;
  }
  public token: Token; // the token.IDENT token
  public value: string;

  public getValue(): string {
    return this.value;
  }
}
