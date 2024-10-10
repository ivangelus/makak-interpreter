import { Token } from "../../token/token";
import { Expression } from "../expressions/expression";
import { Statement } from "./statement";

export class ReturnStatement extends Statement {
  public token: Token; // the `return` token
  public returnValue: Expression;

  constructor(token: Token) {
    super(token);
  }
}
