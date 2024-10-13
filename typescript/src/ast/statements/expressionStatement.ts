import { Token } from "../../token/token";
import { Expression } from "../expressions/expression";
import { Statement } from "./statement";

export class ExpressionStatement extends Statement {
    public token: Token; // the first token of expression
    private expression: Expression;

    constructor(token: Token) {
        super(token)
    }

    public setExpression(e: Expression) {
        this.expression = e;
    }

    public toString(): string {
        if(this.expression !== null) {
            return this.expression.toString();
        }
        return '';
    }
}