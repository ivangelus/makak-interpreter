import { Statement } from "./statements/statement";
import { Node } from "./node";

export class Program extends Node {
  public statements: Statement[] = [];

  constructor() {
    super(null);
  }

  public appendStatement(s: Statement): void {
    this.statements.push(s);
  }
}
