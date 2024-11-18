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

	public toString(): string {
		let output: string = "";
		for (let i = 0; i < this.statements.length; i++) {
			output += this.statements[i]?.toString();
		}
		return output;
	}
}
