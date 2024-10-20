import { Token } from "../../token/token";
import { Expression } from "./expression";
import { BlockStatement } from "../statements/blockStatement";

export class IfExpression extends Expression {
    public token: Token; // the TokenItem.If token
    private condition: Expression;
    private consequence: BlockStatement;
    private alternative: BlockStatement | null = null;

    public tokenLiteral(): string {
        return this.token.literal;
    }

    public toString(): string {
     let output = '';
     output += 'if';   
     output += this.condition.toString();   
     output += ' ';   
     output += this.consequence.toString();
     if (this.alternative !== null) {
        output += this.alternative.toString();
     }

     return output;
    }

    public getCondition(): Expression {
        return this.condition;
    }

   public setCondition(cond: Expression): void {
       this.condition = cond;
}

    public getConsequence(): BlockStatement {
        return this.consequence;
    }

    public setConsequence(cons: BlockStatement): void {
        this.consequence = cons;
    }

    public getAlternative(): BlockStatement {
        return this.alternative;
    }

    public setAlternative(alt: BlockStatement): void {
        this.alternative = alt;
    }
}