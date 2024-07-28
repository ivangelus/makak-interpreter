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

  // Delimiters
  Comma: ",",
  Semicolon: ";",

  LParen: "(",
  RParen: ")",
  LBrace: "{",
  RBrace: "}",

  // Keywords
  Funcion: "FUNCTION",
  Let: "LET",
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
