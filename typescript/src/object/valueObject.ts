import { Identifier } from "../ast/expressions/identifier";
import { BlockStatement } from "../ast/statements/blockStatement";
import { MonkeyEnvironment } from "./environment";

type ValueObjectType = string;

export const INTEGER_OBJECT = "INTEGER";
const BOOLEAN_OBJECT = "BOOLEAN";
export const NULL_OBJECT = "NULL";
export const RETURN_VALUE_OBJECT = "RETURN_VALUE";
export const ERROR_OBJECT = "ERROR";
export const FUNCTION_OBJECT = "FUNCTION";

export class ValueObject {
	public getType(): ValueObjectType {
		return "";
	}

	public inspect(): string {
		return "";
	}
}

export class MonkeyInteger extends ValueObject {
	value: number;

	constructor(value: number) {
		super();
		this.value = value;
	}

	public inspect(): string {
		return this.value.toString();
	}

	public getType(): ValueObjectType {
		return INTEGER_OBJECT;
	}

	public getValue(): number {
		return this.value;
	}
}

export class MonkeyBoolean extends ValueObject {
	value: boolean;

	constructor(value: boolean) {
		super();
		this.value = value;
	}

	public inspect(): string {
		return this.value.toString();
	}

	public getType(): ValueObjectType {
		return BOOLEAN_OBJECT;
	}

	public getValue(): boolean {
		return this.value;
	}
}

export class MonkeyNull extends ValueObject {
	public inspect(): string {
		return "null";
	}

	public getType(): ValueObjectType {
		return NULL_OBJECT;
	}
}

export class MonkeyReturn extends ValueObject {
	value: ValueObject;
	constructor(value: ValueObject) {
		super();
		this.value = value;
	}

	public inspect(): string {
		return this.value.inspect();
	}

	public getType(): ValueObjectType {
		return RETURN_VALUE_OBJECT;
	}

	public getValue(): ValueObject {
		return this.value;
	}
}

export class MonkeyError extends ValueObject {
	private message: string;

	constructor(message: string) {
		super();
		this.message = message;
	}

	public inspect(): string {
		return `Error: ${this.message}`;
	}

	public getType(): ValueObjectType {
		return ERROR_OBJECT;
	}

	public getMessage(): string {
		return this.message;
	}
}

export class MonkeyFunction extends ValueObject {
	public params: Identifier[];
	public body: BlockStatement;
	public env: MonkeyEnvironment;

	constructor(params: Identifier[], body: BlockStatement) {
		super();
		this.params = params;
		this.body = body;
	}

	public inspect(): string {
		const params: string[] = [];
		for (let i = 0; i < this.params.length; i++) {
			params.push(this.params[i].toString());
		}
		let out = "";
		out += "fn";
		out += "(";
		out += params.join(", ");
		out += ") {\n";
		out += this.body.toString();
		out += "\n}";

		return out;
	}

	public getType(): ValueObjectType {
		return FUNCTION_OBJECT;
	}

	public getParams(): Identifier[] {
		return this.params;
	}

	public getBody(): BlockStatement {
		return this.body;
	}
}
