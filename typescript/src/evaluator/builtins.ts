import {
	MonkeyBuiltin,
	MonkeyInteger,
	MonkeyNull,
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
				default:
					return newError(
						`argument to "len" not supported, got ${args[0].getType()}`,
					);
			}
		}),
	],
]);
