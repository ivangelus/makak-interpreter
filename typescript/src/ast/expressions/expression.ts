import { Token } from "../../token/token";
import { Node } from "../node";

export class Expression extends Node {
  constructor(token: Token) {
    super(token);
  }
  expressionNode(): string {
    return "string";
  }
}
