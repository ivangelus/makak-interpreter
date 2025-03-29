import { IntegerLiteral } from "../ast/expressions/integerLiteral";
import { Boolean } from "../ast/expressions/boolean";
import { Node } from "../ast/node";
import { Program } from "../ast/program";
import { ExpressionStatement } from "../ast/statements/expressionStatement";
import { Statement } from "../ast/statements/statement";
import {
	ARRAY_OBJECT,
	BOOLEAN_OBJECT,
	BUILTIN_OBJECT,
	ERROR_OBJECT,
	FUNCTION_OBJECT,
	HASH_OBJECT,
	HashKey,
	HashPair,
	INTEGER_OBJECT,
	MonkeyArray,
	MonkeyBoolean,
	MonkeyBuiltin,
	MonkeyError,
	MonkeyFunction,
	MonkeyHash,
	MonkeyInteger,
	MonkeyNull,
	MonkeyReturn,
	MonkeyString,
	RETURN_VALUE_OBJECT,
	STRING_OBJECT,
	ValueObject,
} from "../object/valueObject";
import { PrefixExpression } from "../ast/expressions/prefix";
import { InfixExpression } from "../ast/expressions/infix";
import { IfExpression } from "../ast/expressions/ifExpression";
import { ReturnStatement } from "../ast/statements/returnStatement";
import { BlockStatement } from "../ast/statements/blockStatement";
import { LetStatement } from "../ast/statements/letStatement";
import { MonkeyEnvironment } from "../object/environment";
import { Identifier } from "../ast/expressions/identifier";
import { FunctionLiteral } from "../ast/expressions/functionLiteral";
import { CallExpression } from "../ast/expressions/callExpression";
import { Expression } from "../ast/expressions/expression";
import { StringLiteral } from "../ast/expressions/stringLiteral";
import { builtins } from "./builtins";
import { ArrayLiteral } from "../ast/expressions/arrayLiteral";
import { IndexExpression } from "../ast/expressions/indexExpression";
import { HashLiteral } from "../ast/expressions/hashLiteral";

export const TRUE = new MonkeyBoolean(true);
export const FALSE = new MonkeyBoolean(false);
export const NULL = new MonkeyNull();

export function evaluate(node: Node, env: MonkeyEnvironment): ValueObject {
	switch (node.constructor.name) {
		// statements
		case "Program":
			return evalProgram((node as unknown as Program).statements, env);
		case "BlockStatement":
			return evalBlockStatement(node as unknown as BlockStatement, env);
		case "ExpressionStatement":
			return evaluate(
				(node as unknown as ExpressionStatement).getExpression(),
				env,
			);
		case "ReturnStatement":
			const returnValue = evaluate(
				(node as unknown as ReturnStatement).getReturnValue(),
				env,
			);
			if (isErrorObject(returnValue)) {
				return returnValue;
			}
			return new MonkeyReturn(returnValue);
		case "LetStatement":
			const letValue = evaluate(
				(node as unknown as LetStatement).getValue(),
				env,
			);
			if (isErrorObject(letValue)) {
				return letValue;
			}
			env.setValue(
				(node as unknown as LetStatement).getName().getValue(),
				letValue,
			);
		// expressions
		case "IntegerLiteral":
			return new MonkeyInteger((node as unknown as IntegerLiteral).getValue());
		case "StringLiteral":
			return new MonkeyString((node as unknown as StringLiteral).getValue());
		case "Boolean":
			return nativeBoolToBoolObject((node as unknown as Boolean).getValue());
		case "PrefixExpression":
			const rightPrefix = evaluate(
				(node as unknown as PrefixExpression).getRight(),
				env,
			);
			if (isErrorObject(rightPrefix)) {
				return rightPrefix;
			}
			return evalPrefixExpression(
				(node as unknown as PrefixExpression).getOperator(),
				rightPrefix,
			);
		case "InfixExpression":
			const leftInfix = evaluate(
				(node as unknown as InfixExpression).getLeft(),
				env,
			);
			if (isErrorObject(leftInfix)) {
				return leftInfix;
			}
			const rightInfix = evaluate(
				(node as unknown as PrefixExpression).getRight(),
				env,
			);
			if (isErrorObject(rightInfix)) {
				return rightInfix;
			}
			return evalInfixExpression(
				(node as unknown as InfixExpression).getOperator(),
				leftInfix,
				rightInfix,
			);
		case "IfExpression":
			return evalIfExpression(node as unknown as IfExpression, env);
		case "Identifier":
			return evalIdentifier(node as unknown as Identifier, env);
		case "FunctionLiteral":
			const params = (node as unknown as FunctionLiteral).getParams();
			const body = (node as unknown as FunctionLiteral).getBody();
			return new MonkeyFunction(params, body, env);
		case "CallExpression":
			const evaluatedFn = evaluate(
				(node as unknown as CallExpression).getFunction(),
				env,
			);
			if (isErrorObject(evaluatedFn)) {
				return evaluatedFn;
			}
			const args = evalExpressions(
				(node as unknown as CallExpression).getArgs(),
				env,
			);
			if (args.length === 1 && isErrorObject(args[0])) {
				return args[0];
			}

			return applyFunction(evaluatedFn, args);
		case "ArrayLiteral":
			const elements = evalExpressions(
				(node as unknown as ArrayLiteral).getElements(),
				env,
			);
			if (elements.length === 1 && isErrorObject(elements[0])) {
				return elements[0];
			}
			return new MonkeyArray(elements);
		case "IndexExpression":
			const left = evaluate(
				(node as unknown as IndexExpression).getLeft(),
				env,
			);
			if (isErrorObject(left)) {
				return left;
			}
			const index = evaluate(
				(node as unknown as IndexExpression).getIndex(),
				env,
			);
			if (isErrorObject(index)) {
				return index;
			}
			return evalIndexExpression(left, index);
		case "HashLiteral":
			return evalHashLiteral(node as unknown as HashLiteral, env);
		default:
			return null;
	}
}

function applyFunction(fn: ValueObject, args: ValueObject[]) {
	switch (fn.getType()) {
		case FUNCTION_OBJECT:
			const extendedEnv = extendFnEnv(fn as unknown as MonkeyFunction, args);
			const evaluated = evaluate(
				(fn as unknown as MonkeyFunction).getBody(),
				extendedEnv,
			);
			return unwrapReturnValue(evaluated);
		case BUILTIN_OBJECT:
			return (fn as unknown as MonkeyBuiltin).getFn()(
				Array.isArray(args) ? args : [args],
			);
		default:
			return newError(`not a function: ${fn.getType()}`);
	}
}

function extendFnEnv(fn: MonkeyFunction, args: ValueObject[]) {
	const env = new MonkeyEnvironment(new Map());
	env.setOuter(fn.getEnv());
	const params = fn.getParams();
	for (let i = 0; i < params.length; i++) {
		env.setValue(params[i].getValue(), args[i]);
	}

	return env;
}

function unwrapReturnValue(val: ValueObject): ValueObject {
	if (val.getType() === RETURN_VALUE_OBJECT) {
		return (val as unknown as MonkeyReturn).getValue();
	}

	return val;
}

function evalHashLiteral(
	node: HashLiteral,
	env: MonkeyEnvironment,
): ValueObject {
	const pairs = new Map<HashKey, HashPair>();
	for (const [keyNode, valueNode] of node.getPairs()) {
		const key = evaluate(keyNode, env);
		if (isErrorObject(key)) {
			return key;
		}
		if (
			![HASH_OBJECT, INTEGER_OBJECT, STRING_OBJECT, BOOLEAN_OBJECT].includes(
				key.getType(),
			)
		) {
			return newError(`unusable as hash key: ${key.getType()}`);
		}

		const value = evaluate(valueNode, env);
		if (isErrorObject(value)) {
			return value;
		}

		// @ts-ignore
		const hashed = key.hashKey();

		pairs.set(hashed as HashKey, { key, value } as HashPair);
	}
	return new MonkeyHash(pairs);
}

function evalExpressions(
	exps: Expression[],
	env: MonkeyEnvironment,
): ValueObject[] {
	const result: ValueObject[] = [];

	for (let i = 0; i < exps.length; i++) {
		const evaluated = evaluate(exps[i], env);

		if (isErrorObject(evaluated)) {
			return [evaluated];
		}
		result.push(evaluated);
	}
	return result;
}

function evalArrayIndexExpression(
	array: ValueObject,
	index: ValueObject,
): ValueObject {
	const arrayObject = array as unknown as MonkeyArray;
	const idx = (index as unknown as IntegerLiteral).getValue();
	const max = arrayObject.getElements().length - 1;

	if (idx < 0 || idx > max) {
		return NULL;
	}

	return arrayObject.getElements()[idx];
}

function evalIndexExpression(
	left: ValueObject,
	index: ValueObject,
): ValueObject {
	if (left.getType() === ARRAY_OBJECT && index.getType() === INTEGER_OBJECT) {
		return evalArrayIndexExpression(left, index);
	} else if (left.getType() === HASH_OBJECT) {
		return evalHashIndexExpression(left as unknown as MonkeyHash, index);
	} else {
		return newError(`index operator not supported: ${left.getType()}`);
	}
}

function evalHashIndexExpression(
	hash: MonkeyHash,
	index: ValueObject,
): ValueObject {
	if (
		![HASH_OBJECT, INTEGER_OBJECT, STRING_OBJECT, BOOLEAN_OBJECT].includes(
			index.getType(),
		)
	) {
		return newError(`unusable as hash key: ${index.getType()}`);
	}

	// @ts-ignore
	const pair = hash.getPairs().get(index.hashKey());
	if (!pair) {
		return NULL;
	}
	return pair.value;
}

function evalIfExpression(
	ie: IfExpression,
	env: MonkeyEnvironment,
): ValueObject {
	const condition = evaluate(ie.getCondition(), env);
	if (isErrorObject(condition)) {
		return condition;
	}

	if (isTruthy(condition)) {
		return evaluate(ie.getConsequence(), env);
	} else if (ie.getAlternative() !== null) {
		return evaluate(ie.getAlternative(), env);
	} else {
		return NULL;
	}
}

function evalIdentifier(node: Identifier, env: MonkeyEnvironment): ValueObject {
	const ident = node.getValue();

	const builtin = builtins.get(ident);
	if (builtin) {
		return builtin;
	}

	const value = env.getValue(ident);
	if (!value) {
		return newError(`identifier not found: ${ident}`);
	}
	return value;
}

function isErrorObject(obj: ValueObject): boolean {
	if (obj !== NULL) {
		return obj.getType() === ERROR_OBJECT;
	}
	return false;
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

function evalProgram(stmts: Statement[], env: MonkeyEnvironment): ValueObject {
	let result: ValueObject;

	for (let i = 0; i < stmts.length; i++) {
		result = evaluate(stmts[i], env);

		switch (result.getType()) {
			case RETURN_VALUE_OBJECT:
				return (result as unknown as MonkeyReturn).getValue();
			case ERROR_OBJECT:
				return result;
		}
	}

	return result;
}

function evalBlockStatement(
	block: BlockStatement,
	env: MonkeyEnvironment,
): ValueObject {
	let result: ValueObject;
	const stmts = block.getStatements();

	for (let i = 0; i < stmts.length; i++) {
		result = evaluate(stmts[i], env);

		if (
			result !== null &&
			(result.getType() === RETURN_VALUE_OBJECT ||
				result.getType() === ERROR_OBJECT)
		) {
			return result;
		}
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

function evalInfixExpression(
	operator: string,
	left: ValueObject,
	right: ValueObject,
): ValueObject {
	if (left.getType() === INTEGER_OBJECT && right.getType() === INTEGER_OBJECT) {
		return evalIntegerInfixExpressions(operator, left, right);
	} else if (operator === "==") {
		return nativeBoolToBoolObject(left === right);
	} else if (operator === "!=") {
		return nativeBoolToBoolObject(left !== right);
	} else if (left.getType() !== right.getType()) {
		return newError(
			`type mismatch: ${left.getType()} ${operator} ${right.getType()}`,
		);
	} else if (
		left.getType() === STRING_OBJECT &&
		right.getType() === STRING_OBJECT
	) {
		return evalStringInfixExpression(operator, left, right);
	} else {
		return newError(
			`unknown operator: ${left.getType()} ${operator} ${right.getType()}`,
		);
	}
}

function evalStringInfixExpression(
	operator: string,
	left: ValueObject,
	right: ValueObject,
): ValueObject {
	if (operator !== "+") {
		return newError(
			`unknown operator: ${left.getType()} ${operator} ${right.getType()}`,
		);
	}

	const leftVal = (left as unknown as MonkeyString).getValue();
	const rightVal = (right as unknown as MonkeyString).getValue();

	return new MonkeyString(leftVal + rightVal);
}

function evalIntegerInfixExpressions(
	operator: string,
	left: ValueObject,
	right: ValueObject,
): ValueObject {
	const leftValue = (left as unknown as MonkeyInteger).getValue();
	const rightValue = (right as unknown as MonkeyInteger).getValue();
	switch (operator) {
		case "+":
			return new MonkeyInteger(leftValue + rightValue);
		case "-":
			return new MonkeyInteger(leftValue - rightValue);
		case "*":
			return new MonkeyInteger(leftValue * rightValue);
		case "/":
			return new MonkeyInteger(leftValue / rightValue);
		case ">":
			return nativeBoolToBoolObject(leftValue > rightValue);
		case "<":
			return nativeBoolToBoolObject(leftValue < rightValue);
		case "==":
			return nativeBoolToBoolObject(leftValue === rightValue);
		case "!=":
			return nativeBoolToBoolObject(leftValue !== rightValue);
		default:
			return newError(
				`unknown operator: ${left.getType()} ${operator} ${right.getType()}`,
			);
	}
}

function evalPrefixExpression(
	operator: string,
	right: ValueObject,
): ValueObject {
	switch (operator) {
		case "!":
			return evalBangPrefixOperatorExpression(right);
		case "-":
			return evalMinusPrefixOperatorExpression(right);
		default:
			return newError(`unknown operator: ${operator}${right.getType()}`);
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
		return newError(`unknown operator: -${right.getType()}`);
	}

	const value = (right as unknown as MonkeyInteger).getValue();
	return new MonkeyInteger(-value);
}

export function newError(message: string) {
	return new MonkeyError(message);
}
