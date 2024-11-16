import { ValueObject } from "./valueObject";

export class MonkeyEnvironment {
  store: Map<string, ValueObject>;

  constructor(store: Map<string, ValueObject>) {
    this.store = store;
  }

  public getValue(key: string): ValueObject {
    return this.store.get(key);
  }

  public setValue(key: string, value: ValueObject): ValueObject {
    this.store.set(key, value);
    return value;
  }
}
