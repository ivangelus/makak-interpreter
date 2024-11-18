import { Token } from "../../token/token";
import { Expression } from "./expression";

export class Identifier extends Expression {
	public token: Token; // the token.IDENT token
	public value: string;

	constructor(token: Token, value: string) {
		super(token);
		this.value = value;
	}

	public getValue(): string {
		return this.value;
	}

	public toString(): string {
		return this.value;
	}
}
