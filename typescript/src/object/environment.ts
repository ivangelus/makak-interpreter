import { ValueObject } from "./valueObject";

export class MonkeyEnvironment {
	store: Map<string, ValueObject>;
	outer: MonkeyEnvironment;

	constructor(store: Map<string, ValueObject>) {
		this.store = store;
	}

	public getValue(key: string): ValueObject {
		let obj = this.store.get(key);
		if (!obj && this.outer) {
			obj = this.outer.getValue(key);
		}
		return obj;
	}

	public setValue(key: string, value: ValueObject): ValueObject {
		this.store.set(key, value);
		return value;
	}

	public setOuter(env: MonkeyEnvironment) {
		this.outer = env;
	}
}
