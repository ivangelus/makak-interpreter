import { Token } from "../../token/token";
import { Expression } from "./expression";

export class StringLiteral extends Expression {
	public token: Token; // the token.String token
	public value: string;

	constructor(token: Token, value: string) {
		super(token);
		this.value = value;
	}

	public getValue(): string {
		return this.value;
	}

	public toString(): string {
		return this.token.literal;
	}
}
