import { Token } from "../../token/token";
import { Expression } from "./expression";

export class Boolean extends Expression {
	public token: Token; // the token.TRUE || token.FALSE token
	public value: boolean;

	constructor(token: Token, value: boolean) {
		super(token);
		this.value = value;
	}

	public getValue(): boolean {
		return this.value;
	}

	public toString(): string {
		return this.token.literal;
	}
}
