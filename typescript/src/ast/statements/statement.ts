import { Token } from "../../token/token";
import { Node } from "../node";

export class Statement extends Node {
	constructor(token: Token) {
		super(token);
	}

	statementNode(): string {
		return "string";
	}
}
