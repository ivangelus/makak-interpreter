import { Lexer } from "../lexer/lexer";
import { Token, TokenItem, TokenType } from "../token/token";
import { Program } from "../ast/program";
import { Statement } from "../ast/statements/statement";
import { LetStatement } from "../ast/statements/letStatement";
import { Identifier } from "../ast/expressions/identifier";
import { ReturnStatement } from "../ast/statements/returnStatement";
import { ExpressionStatement } from "../ast/statements/expressionStatement";
import { Expression } from "../ast/expressions/expression";

export const Precedence = {
  Lowest: 0,
  Equals: 1, // ==
  LessGreater: 2, // > or <
  Sum: 3, // +
  Product: 4, // *
  Prefix: 5, // -X or !X
  Call: 6, // myFunction(X)
} as const;

export type PrecedenceValue = (typeof Precedence)[keyof typeof Precedence];

export class Parser {
  private curToken: Token;
  private peekToken: Token;
  private lexer: Lexer;
  private errors: string[] = [];

  constructor(lexer: Lexer) {
    this.lexer = lexer;
    this.nextToken();
    this.nextToken();
  }

  private nextToken() {
    this.curToken = this.peekToken;
    this.peekToken = this.lexer.nextToken();
  }

  public parseProgram(): Program {
    const program = new Program();
    while (this.curToken.type !== TokenType.Eof) {
      const statement = this.parseStatement();
      if (statement !== null) {
        program.appendStatement(statement);
      }
      this.nextToken();
    }
    return program;
  }

  private parseStatement(): Statement | null {
    switch (this.curToken.type) {
      case TokenType.Let:
        return this.parseLetStatement();
      case TokenType.Return:
        return this.parseReturnStatement();
      default:
        return this.parseExpressionStatement();
    }
  }

  private parseReturnStatement(): ReturnStatement | null {
    const statement = new ReturnStatement(this.curToken);
    this.nextToken();

    // TODO: We're skipping the expressions until we
    // encounter a semicolon
    while (!this.curTokenIs(TokenType.Semicolon)) {
      this.nextToken();
    }

    return statement;
  }

  private parseLetStatement(): LetStatement | null {
    const statement = new LetStatement(this.curToken);
    if (!this.expectPeek(TokenType.Ident)) {
      return null;
    }

    const identifier = new Identifier(this.curToken, this.curToken.literal);
    statement.setName(identifier);

    if (!this.expectPeek(TokenType.Assign)) {
      return null;
    }

    // TODO: We're skipping the expressions until we
    // encounter a semicolon
    while (!this.curTokenIs(TokenType.Semicolon)) {
      this.nextToken();
    }

    return statement;
  }

  private parseExpressionStatement(): ExpressionStatement {
    const expStmt = new ExpressionStatement(this.curToken);

    expStmt.setExpression(this.parseExpression(Precedence.Lowest))

    if(this.peekTokenIs(TokenType.Semicolon)) {
      this.nextToken();
    }

    return expStmt;
  }

  private parseExpression(precedence: PrecedenceValue): Expression | null {
    const prefixFn = this.prefixParseFnSupplier();

    if (prefixFn === null) {
      return null;
    }

    const leftExp = prefixFn();

    return leftExp;
  }

  private prefixParseFnSupplier()  {
    switch(this.curToken.type) {
      case TokenType.Ident:
          return () => new Identifier(this.curToken, this.curToken.literal);
      default:
          return null;
    }
  }

  private curTokenIs(t: TokenItem): boolean {
    return this.curToken.type === t;
  }

  private peekTokenIs(t: TokenItem): boolean {
    return this.peekToken.type === t;
  }

  private expectPeek(expected: TokenItem): boolean {
    if (this.peekTokenIs(expected)) {
      this.nextToken();
      return true;
    } else {
      this.peekError(expected);
      return false;
    }
  }

  private peekError(t: TokenItem) {
    this.errors.push(
      `expected next token to be ${t}, instead got ${this.peekToken.type}`,
    );
  }

  public getErrors() {
    return this.errors;
  }
}
