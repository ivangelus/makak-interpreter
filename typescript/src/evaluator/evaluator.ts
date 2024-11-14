import { IntegerLiteral } from "../ast/expressions/integerLiteral";
import { Boolean } from "../ast/expressions/boolean";
import { Node } from "../ast/node";
import { Program } from "../ast/program";
import { ExpressionStatement } from "../ast/statements/expressionStatement";
import { Statement } from "../ast/statements/statement";
import { INTEGER_OBJECT, MonkeyBoolean, MonkeyInteger, MonkeyNull, MonkeyReturn, RETURN_VALUE_OBJECT, ValueObject } from "../object/valueObject";
import { PrefixExpression } from "../ast/expressions/prefix";
import { InfixExpression } from "../ast/expressions/infix";
import { IfExpression } from "../ast/expressions/ifExpression";
import { ReturnStatement } from "../ast/statements/returnStatement";
import { BlockStatement } from "../ast/statements/blockStatement";

const TRUE = new MonkeyBoolean(true);
const FALSE = new MonkeyBoolean(false);
const NULL = new MonkeyNull();

export function evaluate(node: Node): ValueObject {
    switch (node.constructor.name) {
        // statements
        case 'Program':
            return evalProgram((node as unknown as Program).statements);
        case 'BlockStatement':
            return evalBlockStatement((node as unknown as BlockStatement));
        case 'ExpressionStatement':
            return evaluate((node as unknown as ExpressionStatement).getExpression());
        case 'ReturnStatement':
            const val = evaluate((node as unknown as ReturnStatement).getReturnValue());
            return new MonkeyReturn(val);
        // expressions
        case 'IntegerLiteral':
            return new MonkeyInteger((node as unknown as IntegerLiteral).getValue());
        case 'Boolean':
            return nativeBoolToBoolObject((node as unknown as Boolean).getValue());
        case 'PrefixExpression':
            const rightPrefix = evaluate((node as unknown as PrefixExpression).getRight());
            return evalPrefixExpression((node as unknown as PrefixExpression).getOperator(), rightPrefix);
        case 'InfixExpression':
            const leftInfix = evaluate((node as unknown as InfixExpression).getLeft())
            const rightInfix = evaluate((node as unknown as PrefixExpression).getRight());
            return evalInfixExpression((node as unknown as InfixExpression).getOperator(), leftInfix, rightInfix);
        case 'IfExpression':
            return evalIfExpression(node as unknown as IfExpression);
        default:
            return null;
    }
}

function evalIfExpression(ie: IfExpression): ValueObject {
    const condition = evaluate(ie.getCondition());

    if (isTruthy(condition)) {
        return evaluate(ie.getConsequence());
    } else if (ie.getAlternative() !== null) {
        return evaluate(ie.getAlternative());
    } else {
        return NULL;
    }
}

function isTruthy(obj: ValueObject): boolean {
    switch (obj) {
        case NULL:
            return false;
        case TRUE:
            return true;
        case FALSE:
            return false;
        default:
            return true;
        }
}

function evalProgram(stmts: Statement[]): ValueObject {
    let result: ValueObject;

    for (let i = 0; i < stmts.length; i++) {
        result = evaluate(stmts[i]);

        if (result.getType() === RETURN_VALUE_OBJECT) {
            return (result as unknown as MonkeyReturn).getValue();
        }
    }

    return result;
}

function evalBlockStatement(block: BlockStatement): ValueObject {
    let result: ValueObject;
    const stmts = block.getStatements()

    for (let i = 0; i < stmts.length; i++) {
        result = evaluate(stmts[i])

        if (result !== null && result.getType() === RETURN_VALUE_OBJECT) {
            return result
        }
    }

    return result
}

function nativeBoolToBoolObject(bool: boolean): ValueObject {
    if (bool) {
        return TRUE;
    } else {
        return FALSE;
    }
}

function evalInfixExpression(
  operator: string,
  left: ValueObject,
  right: ValueObject
): ValueObject {
  if (left.getType() === INTEGER_OBJECT && right.getType() === INTEGER_OBJECT) {
    return evalIntegerInfixExpressions(operator, left, right);
  } else if (operator === "==") {
    return nativeBoolToBoolObject(left === right);
  } else if (operator === "!=") {
    return nativeBoolToBoolObject(left !== right);
  } else {
    return NULL;
  }
}

function evalIntegerInfixExpressions(operator: string, left: ValueObject, right: ValueObject): ValueObject {
    const leftValue = (left as unknown as MonkeyInteger).getValue();
    const rightValue = (right as unknown as MonkeyInteger).getValue();
    switch (operator) {
        case '+':
            return new MonkeyInteger(leftValue + rightValue);
        case '-':
            return new MonkeyInteger(leftValue - rightValue);
        case '*':
            return new MonkeyInteger(leftValue * rightValue);
        case '/':
            return new MonkeyInteger(leftValue / rightValue);
        case '>':
            return nativeBoolToBoolObject(leftValue > rightValue);
        case '<':
            return nativeBoolToBoolObject(leftValue < rightValue);
        case '==':
            return nativeBoolToBoolObject(leftValue === rightValue);
        case '!=':
            return nativeBoolToBoolObject(leftValue !== rightValue);
        default:
            return NULL;
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