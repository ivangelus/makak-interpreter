import { Token } from "../../token/token";
import { Expression } from "./expression";
import { Identifier } from "./identifier";

export class CallExpression extends Expression {
    token: Token; // the ( token
    function: Expression; // identifier or function literal
    arguments: Expression[] = [];

    constructor (token: Token, fn: Expression) {
        super(token);
        this.function = fn;
    }

    public tokenLiteral(): string {
        return this.token.literal;
    }

    public toString(): string {
        let out = '';
        const args = [];
        for (let i = 0; i < this.arguments.length; i++) {
            args.push(this.arguments[i].toString());
        }
        out += this.function.toString();
        out += '(';
        out += args.join(', ');
        out += ')';

        return out;
    }

    public getArgs(): Expression[] {
        return this.arguments;
    }

    public setArgs(args: Expression[]): void {
        this.arguments = args;
    }

    public getFunction(): Expression {
        return this.function;
    }
}