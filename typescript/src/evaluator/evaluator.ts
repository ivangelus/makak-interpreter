import { IntegerLiteral } from "../ast/expressions/integerLiteral";
import { Boolean } from "../ast/expressions/boolean";
import { Node } from "../ast/node";
import { Program } from "../ast/program";
import { ExpressionStatement } from "../ast/statements/expressionStatement";
import { Statement } from "../ast/statements/statement";
import { MonkeyBoolean, MonkeyInteger, ValueObject } from "../object/valueObject";

const TRUE = new MonkeyBoolean(true);
const FALSE = new MonkeyBoolean(false);

export function evaluate(node: Node): ValueObject {
    switch (node.constructor.name) {
        // statements
        case 'Program':
            return evalStatements((node as unknown as Program).statements);
        case 'ExpressionStatement':
            return evaluate((node as unknown as ExpressionStatement).getExpression());
        // expressions
        case 'IntegerLiteral':
            return new MonkeyInteger((node as unknown as IntegerLiteral).getValue());
        case 'Boolean':
            return nativeBoolToBoolObject((node as unknown as Boolean).getValue());
        default:
            return null;
    }
}

function evalStatements(stmts: Statement[]): ValueObject {
    let result: ValueObject;

    for (let i = 0; i < stmts.length; i++) {
        result = evaluate(stmts[i]);
    }

    return result;
}

function nativeBoolToBoolObject(bool: boolean): ValueObject {
    if (bool) {
        return TRUE;
    } else {
        return FALSE;
    }
}