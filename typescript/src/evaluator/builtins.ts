import {
	ARRAY_OBJECT,
	MonkeyArray,
	MonkeyBuiltin,
	MonkeyInteger,
	MonkeyString,
	STRING_OBJECT,
	ValueObject,
} from "../object/valueObject";
import { newError, NULL } from "./evaluator";

export const builtins = new Map<string, MonkeyBuiltin>([
	[
		"len",
		new MonkeyBuiltin(function (args: ValueObject[]): ValueObject {
			if (Array.isArray(args) && args.length !== 1) {
				return newError(
					`wrong number of arguments. got=${args.length}, want=1`,
				);
			}
			switch (args[0].getType()) {
				case STRING_OBJECT:
					return new MonkeyInteger(
						(args[0] as unknown as MonkeyString).getValue().length,
					);
				case ARRAY_OBJECT:
					return new MonkeyInteger(
						(args[0] as unknown as MonkeyArray).getElements().length,
					);
				default:
					return newError(
						`argument to "len" not supported, got ${args[0].getType()}`,
					);
			}
		}),
	],
	[
		"first",
		new MonkeyBuiltin(function (args: ValueObject[]): ValueObject {
			if (Array.isArray(args) && args.length !== 1) {
				return newError(
					`wrong number of arguments. got=${args.length}, want=1`,
				);
			}

			if (args[0].getType() !== ARRAY_OBJECT) {
				return newError(
					`argument to "first" must be ARRAY, got ${args[0].getType()}`,
				);
			}

			const arr = args[0] as unknown as MonkeyArray;

			if (arr.getElements().length > 0) {
				return arr.getElements()[0];
			}
			return NULL;
		}),
	],
	[
		"last",
		new MonkeyBuiltin(function (args: ValueObject[]): ValueObject {
			if (Array.isArray(args) && args.length !== 1) {
				return newError(
					`wrong number of arguments. got=${args.length}, want=1`,
				);
			}

			if (args[0].getType() !== ARRAY_OBJECT) {
				return newError(
					`argument to "last" must be ARRAY, got ${args[0].getType()}`,
				);
			}

			const arr = args[0] as unknown as MonkeyArray;

			if (arr.getElements().length > 0) {
				return arr.getElements()[arr.getElements().length - 1];
			}
			return NULL;
		}),
	],
	[
		"rest",
		new MonkeyBuiltin(function (args: ValueObject[]): ValueObject {
			if (Array.isArray(args) && args.length !== 1) {
				return newError(
					`wrong number of arguments. got=${args.length}, want=1`,
				);
			}

			if (args[0].getType() !== ARRAY_OBJECT) {
				return newError(
					`argument to "rest" must be ARRAY, got ${args[0].getType()}`,
				);
			}

			const arr = args[0] as unknown as MonkeyArray;
			const length = arr.getElements().length;
			if (length > 0) {
				const newElements = arr.getElements().slice(1);
				return new MonkeyArray(newElements);
			}
			return NULL;
		}),
	],
	[
		"push",
		new MonkeyBuiltin(function (args: ValueObject[]): ValueObject {
			if (Array.isArray(args) && args.length !== 2) {
				return newError(
					`wrong number of arguments. got=${args.length}, want=2`,
				);
			}

			if (args[0].getType() !== ARRAY_OBJECT) {
				return newError(
					`argument to "push" must be ARRAY, got ${args[0].getType()}`,
				);
			}

			const arr = args[0] as unknown as MonkeyArray;
			const newElements = arr.getElements().slice();
			newElements.push(args[1]);
			return new MonkeyArray(newElements);
		}),
	],
	[
		"puts",
		new MonkeyBuiltin(function (args: ValueObject[]): ValueObject {
			for (const arg of args) {
				console.log(arg.inspect());
			}

			return NULL;
		}),
	],
]);
