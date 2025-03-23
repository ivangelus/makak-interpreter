import { Token } from "../../token/token";
import { Expression } from "./expression";

export class HashLiteral extends Expression {
	public token: Token; // the { token
	private pairs: Map<Expression, Expression>;

	constructor(token: Token) {
		super(token);
	}

	public tokenLiteral(): string {
		return this.token.literal;
	}

	public toString(): string {
		let out = "";

		const pairs = [];
		for (const [key, value] of this.pairs) {
			pairs.push(`${key.toString()}: ${value.toString()}`);
		}

		out += "{";
		out += pairs.join(", ");
		out += "}";

		return out;
	}

	public getPairs(): Map<Expression, Expression> {
		return this.pairs;
	}

	public setPairs(pairs: Map<Expression, Expression>): void {
		this.pairs = pairs;
	}
}
