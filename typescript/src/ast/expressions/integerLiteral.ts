import { Token } from "../../token/token";
import { Expression } from "./expression";

export class IntegerLiteral extends Expression {
  public token: Token; // the token.INT token
  public value: number;

  constructor(token: Token, value: number) {
    super(token);
    this.value = value;
  }

  public getValue(): number {
    return this.value;
  }

  public toString(): string {
    return this.token.literal;
  }
}
