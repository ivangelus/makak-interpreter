import { Token } from "../../token/token";
import { Expression } from "./expression";

export class InfixExpression extends Expression {
    public token: Token; // The operator token
    private operator: string;
    private right: Expression;
    private left: Expression;

    constructor(token: Token, operator: string, left: Expression) {
        super(token);
        this.operator = operator;
        this.left = left;
    }

    public toString(): string {
        let output = '';
        output += '(';
        output += this.left.toString();
        output += ` ${this.operator} `;
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

    public setRight(exp: Expression): void {
        this.right = exp;
    }

    public getLeft(): Expression {
        return this.left;
    }

    public setLeft(exp: Expression): void {
        this.left = exp;
    }
}