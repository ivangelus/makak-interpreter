import * as crypto from "node:crypto";
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
export const STRING_OBJECT = "STRING";
export const BUILTIN_OBJECT = "BUILTIN";
export const ARRAY_OBJECT = "ARRAY";

export class ValueObject {
	public getType(): ValueObjectType {
		return "";
	}

	public inspect(): string {
		return "";
	}
}

export type HashKey = {
	type: ValueObjectType;
	value: number;
};

export class MonkeyInteger extends ValueObject {
	value: number;

	constructor(value: number) {
		super();
		this.value = value;
	}

	public hashKey(): HashKey {
		return { type: this.getType(), value: this.value };
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

export class MonkeyString extends ValueObject {
	value: string;

	constructor(value: string) {
		super();
		this.value = value;
	}

	public hashKey(): HashKey {
		const hash = crypto.createHash("sha256");
		hash.update(this.value);
		const hashBuffer = hash.digest();

		// Read first 6 bytes (48 bits) and convert to a regular number
		const numericHash = hashBuffer.readUIntBE(0, 6); // Ensures result is within Number's safe range

		return {
			type: this.getType(),
			value: numericHash,
		};
	}

	public inspect(): string {
		return this.value;
	}

	public getType(): ValueObjectType {
		return STRING_OBJECT;
	}

	public getValue(): string {
		return this.value;
	}
}

export class MonkeyBoolean extends ValueObject {
	value: boolean;

	constructor(value: boolean) {
		super();
		this.value = value;
	}

	public hashKey(): HashKey {
		let value: number;

		if (this.value) {
			value = 1;
		} else {
			value = 0;
		}

		return { type: this.getType(), value };
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

	constructor(
		params: Identifier[],
		body: BlockStatement,
		env: MonkeyEnvironment,
	) {
		super();
		this.params = params;
		this.body = body;
		this.env = env;
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

	getEnv(): MonkeyEnvironment {
		return this.env;
	}

	public getParams(): Identifier[] {
		return this.params;
	}

	public getBody(): BlockStatement {
		return this.body;
	}
}

export type BuiltinFunction = (
	args?: ValueObject | ValueObject[],
) => ValueObject;
export class MonkeyBuiltin extends ValueObject {
	private fn: BuiltinFunction;

	constructor(fn: BuiltinFunction) {
		super();
		this.fn = fn;
	}

	public getFn(): BuiltinFunction {
		return this.fn;
	}

	public getType(): ValueObjectType {
		return BUILTIN_OBJECT;
	}

	public inspect(): string {
		return "builtin function";
	}
}

export class MonkeyArray extends ValueObject {
	private elements: ValueObject[];

	constructor(elements: ValueObject[]) {
		super();
		this.elements = elements;
	}

	public getType(): ValueObjectType {
		return ARRAY_OBJECT;
	}

	public inspect(): string {
		let out = "";

		const elements: string[] = [];
		for (let i = 0; i < this.elements.length; i++) {
			elements.push(this.elements[i].inspect());
		}

		out += "[";
		out += elements.join(", ");
		out += "]";

		return out;
	}

	public getElements(): ValueObject[] {
		return this.elements;
	}
}
