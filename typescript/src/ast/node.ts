import { Token } from "../token/token";

export class Node {
	public token: Token;

	constructor(token: Token) {
		this.token = token;
	}

	public tokenLiteral(): string {
		return this.token.literal;
	}

	public toString(): string {
		return "string";
	}
}
