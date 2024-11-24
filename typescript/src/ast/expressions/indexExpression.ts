import { Token } from "../../token/token";
import { Expression } from "./expression";

export class IndexExpression extends Expression {
	public token: Token; // the [ token
	private left: Expression;
	private index: Expression;

	constructor(token: Token, left: Expression) {
		super(token);
		this.left = left;
	}

	public tokenLiteral(): string {
		return this.token.literal;
	}

	public toString(): string {
		let out = "";
		out += "(";
		out += this.left.toString();
		out += "[";
		out += this.index.toString();
		out += "])";
		return out;
	}

	public setLeft(exp: Expression): void {
		this.left = exp;
	}

	public getLeft(): Expression {
		return this.left;
	}

	public setIndex(exp: Expression): void {
		this.index = exp;
	}

	public getIndex(): Expression {
		return this.index;
	}
}
