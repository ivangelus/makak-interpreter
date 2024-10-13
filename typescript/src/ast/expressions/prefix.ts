import { Token } from "../../token/token";
import { Expression } from "./expression";

export class PrefixExpression extends Expression {
    public token: Token; // The prefix token, e.g. !
    private operator: string;
    private right: Expression;

    constructor(token: Token, operator: string) {
        super(token);
        this.operator = operator;
    }

    public toString(): string {
        let output = '';
        output += '(';
        output += this.operator;
        output += this.right.toString();
        output += ')';

        return output;
    }

    public getOperator(): string {
        return this.operator;
    }

    public getRight(): Expression {
        return this.right;
    }

    public setRight(right: Expression): void {
        this.right = right;
    }
}