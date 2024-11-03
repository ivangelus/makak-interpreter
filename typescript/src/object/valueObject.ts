
type ValueObjectType = string;

const INTEGER_OBJECT = 'INTEGER';
const BOOLEAN_OBJECT = 'BOOLEAN';
const NULL_OBJECT = 'NULL';

export class ValueObject {
    public getType(): ValueObjectType {
        return '';
    }

    public inspect(): string {
        return '';
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

    public inspect(): string {
        return this.value.toString();
    }

    public getType(): ValueObjectType {
        return BOOLEAN_OBJECT;
    }
}

export class MonkeyNull extends ValueObject {

    public inspect(): string {
        return 'null';
    }

    public getType(): ValueObjectType {
        return NULL_OBJECT;
    }
}