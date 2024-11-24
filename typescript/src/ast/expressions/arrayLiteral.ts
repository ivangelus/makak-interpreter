import { Token } from "../../token/token";
import { Expression } from "./expression";

export class ArrayLiteral extends Expression {
	public token: Token; // the [ token
	private elements: Expression[];

	constructor(token: Token) {
		super(token);
	}

	public tokenLiteral(): string {
		return this.token.literal;
	}

	public toString(): string {
		let out = "";
		const elements: string[] = [];
		for (let i = 0; i < this.elements.length; i++) {
			elements.push(this.elements[i].toString());
		}
		out += "[";
		out += elements.join(", ");
		out += "]";

		return out;
	}

	public getElements(): Expression[] {
		return this.elements;
	}

	public setElements(elements: Expression[]): void {
		this.elements = elements;
	}
}
