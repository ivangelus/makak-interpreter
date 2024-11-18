import { Token } from "../../token/token";
import { BlockStatement } from "../statements/blockStatement";
import { Expression } from "./expression";
import { Identifier } from "./identifier";

export class FunctionLiteral extends Expression {
	public token: Token; // fn token
	private params: Identifier[] = [];
	private body: BlockStatement;

	public tokenLiteral(): string {
		return this.token.literal;
	}

	public toString(): string {
		const params = [];
		for (let i = 0; i < this.params.length; i++) {
			params.push(this.params[i].toString());
		}

		let output = "";
		output += this.tokenLiteral();
		output += "(";
		output += params.join(", ");
		output += ") ";
		output += this.body.toString();

		return output;
	}

	public getParams(): any {
		return this.params;
	}

	public setParams(params: any): void {
		this.params = params;
	}

	public getBody(): BlockStatement {
		return this.body;
	}

	public setBody(body: BlockStatement): void {
		this.body = body;
	}
}
