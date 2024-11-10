import { IntegerLiteral } from "../ast/expressions/integerLiteral";
import { Boolean } from "../ast/expressions/boolean";
import { Node } from "../ast/node";
import { Program } from "../ast/program";
import { ExpressionStatement } from "../ast/statements/expressionStatement";
import { Statement } from "../ast/statements/statement";
import { INTEGER_OBJECT, MonkeyBoolean, MonkeyInteger, MonkeyNull, ValueObject } from "../object/valueObject";
import { PrefixExpression } from "../ast/expressions/prefix";

const TRUE = new MonkeyBoolean(true);
const FALSE = new MonkeyBoolean(false);
const NULL = new MonkeyNull();

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
        case 'PrefixExpression':
            const right = evaluate((node as unknown as PrefixExpression).getRight());
            return evalPrefixExpression((node as unknown as PrefixExpression).getOperator(), right);
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

function evalPrefixExpression(operator: string, right: ValueObject): ValueObject {
    switch (operator) {
        case '!':
            return evalBangPrefixOperatorExpression(right);
        case '-':
            return evalMinusPrefixOperatorExpression(right);
        default:
            return null;
    }
}

function evalBangPrefixOperatorExpression(right: ValueObject): ValueObject {
    switch (right) {
        case FALSE:
            return TRUE;
        case TRUE:
            return FALSE;
        case NULL:
            return TRUE;
        default:
            return FALSE;
    }
}

function evalMinusPrefixOperatorExpression(right: ValueObject): ValueObject {
    if (right.getType() != INTEGER_OBJECT) {
        return NULL
    }

    const value = (right as unknown as MonkeyInteger).getValue()
    return new MonkeyInteger(-value);
}