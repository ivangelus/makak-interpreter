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
} as const;

export const Keywords = {
  "fn": createToken({ tokenType: TokenType.Function, ch: "fn"}),
  "let": createToken({ tokenType: TokenType.Let, ch: "let"})
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
