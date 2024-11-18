import { Token } from "../../token/token";
import { Statement } from "./statement";

export class BlockStatement extends Statement {
	public token: Token; // the TokenItem.LBrace token -> {
	private statements: Statement[] = [];

	constructor(token: Token) {
		super(token);
	}

	public tokenLiteral(): string {
		return this.token.literal;
	}

	public toString(): string {
		let output = "";
		for (let i = 0; i < this.statements.length; i++) {
			output += this.statements[i].toString();
		}
		return output;
	}

	public getStatements(): Statement[] {
		return this.statements;
	}

	public appendStatement(stmt: Statement): void {
		this.statements.push(stmt);
	}
}
