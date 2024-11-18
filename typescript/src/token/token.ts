export type Token = {
	type: TokenItem;
	literal: string;
};

export type TokenItem = (typeof TokenType)[keyof typeof TokenType];

export const TokenType = {
	Illegal: "ILLEGAL",
	Eof: "EOF",
	// Identifiers + literals
	Ident: "IDENT", // add, foobar, x, y, ...
	Int: "INT", // 1343456

	// Operators
	Assign: "=",
	Plus: "+",
	Minus: "-",
	Bang: "!",
	Asterisk: "*",
	Slash: "/",

	EQ: "==",
	NOT_EQ: "!=",

	LT: "<",
	GT: ">",

	// Delimiters
	Comma: ",",
	Semicolon: ";",

	LParen: "(",
	RParen: ")",
	LBrace: "{",
	RBrace: "}",

	// Keywords
	Function: "FUNCTION",
	Let: "LET",
	If: "IF",
	Else: "ELSE",
	Return: "RETURN",
	True: "TRUE",
	False: "FALSE",
} as const;

export const Keywords = {
	fn: createToken({ tokenType: TokenType.Function, ch: "fn" }),
	let: createToken({ tokenType: TokenType.Let, ch: "let" }),
	if: createToken({ tokenType: TokenType.If, ch: "if" }),
	else: createToken({ tokenType: TokenType.Else, ch: "else" }),
	return: createToken({ tokenType: TokenType.Return, ch: "return" }),
	true: createToken({ tokenType: TokenType.True, ch: "true" }),
	false: createToken({ tokenType: TokenType.False, ch: "false" }),
} as const;

export function createToken({
	tokenType,
	ch,
}: {
	tokenType: TokenItem;
	ch: string;
}): Token {
	return { type: tokenType, literal: String(ch) };
}
