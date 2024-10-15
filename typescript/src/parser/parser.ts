import { Lexer } from "../lexer/lexer";
import { Token, TokenItem, TokenType } from "../token/token";
import { Program } from "../ast/program";
import { Statement } from "../ast/statements/statement";
import { LetStatement } from "../ast/statements/letStatement";
import { Identifier } from "../ast/expressions/identifier";
import { ReturnStatement } from "../ast/statements/returnStatement";
import { ExpressionStatement } from "../ast/statements/expressionStatement";
import { Expression } from "../ast/expressions/expression";
import { IntegerLiteral } from "../ast/expressions/integerLiteral";
import { PrefixExpression } from "../ast/expressions/prefix";
import { InfixExpression } from "../ast/expressions/infix";

const Precedence = {
  Lowest: 0,
  Equals: 1, // ==
  LessGreater: 2, // > or <
  Sum: 3, // +
  Product: 4, // *
  Prefix: 5, // -X or !X
  Call: 6, // myFunction(X)
} as const;

const precedenceTable = {
  [TokenType.EQ]: Precedence.Equals,
  [TokenType.NOT_EQ]: Precedence.Equals,
  [TokenType.LT]: Precedence.LessGreater,
  [TokenType.GT]: Precedence.LessGreater,
  [TokenType.Plus]: Precedence.Sum,
  [TokenType.Minus]: Precedence.Sum,
  [TokenType.Slash]: Precedence.Product,
  [TokenType.Asterisk]: Precedence.Product,
} as unknown as Record<TokenItem, PrecedenceValue>;

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

    expStmt.setExpression(this.parseExpression(Precedence.Lowest));

    if (this.peekTokenIs(TokenType.Semicolon)) {
      this.nextToken();
    }

    return expStmt;
  }

  private parseIntegerLiteral = (): Expression => {
    const intValue = Number(this.curToken.literal);
    const intLit = new IntegerLiteral(this.curToken, intValue);

    return intLit;
  };

  private parseIdentifier = (): Expression => {
    return new Identifier(this.curToken, this.curToken.literal);
  };

  private parseExpression(precedence: PrecedenceValue): Expression | null {
    const prefixFn = this.prefixParseFnSupplier();

    if (prefixFn === null) {
      this.errors.push(`no prefix parse function for ${this.curToken.type} found`)
      return null;
    }

    let leftExp = prefixFn();

    while (
      !this.curTokenIs(TokenType.Semicolon) &&
      precedence < this.peekPrecedence()
    ) {
      const infixFn = this.infixParseFnSupplier();

      if (infixFn === null) {
        return leftExp;
      }
      this.nextToken();
      leftExp = infixFn(leftExp);
    }

    return leftExp;
  }

  private prefixParseFnSupplier() {
    switch (this.curToken.type) {
      case TokenType.Ident:
        return this.parseIdentifier;
      case TokenType.Int:
        return this.parseIntegerLiteral;
      case TokenType.Bang:
        return this.parsePrefixExpression;
      case TokenType.Minus:
        return this.parsePrefixExpression;
      default:
        return null;
    }
  }

  private infixParseFnSupplier() {
    switch (this.peekToken.type) {
      case TokenType.Plus:
        return this.parseInfixExpression;
      case TokenType.Minus:
        return this.parseInfixExpression;
      case TokenType.Slash:
        return this.parseInfixExpression;
      case TokenType.Asterisk:
        return this.parseInfixExpression;
      case TokenType.EQ:
        return this.parseInfixExpression;
      case TokenType.NOT_EQ:
        return this.parseInfixExpression;
      case TokenType.LT:
        return this.parseInfixExpression;
      case TokenType.GT:
        return this.parseInfixExpression;
      default:
        return null;
    }
  }

  private parsePrefixExpression = (): Expression => {
    const prefixExpr = new PrefixExpression(
      this.curToken,
      this.curToken.literal
    );

    this.nextToken();

    prefixExpr.setRight(this.parseExpression(Precedence.Prefix));

    return prefixExpr;
  };

  private parseInfixExpression = (left: Expression): Expression => {
    const infixExpr = new InfixExpression(
      this.curToken,
      this.curToken.literal,
      left
    );
    const precedence = this.curPrecedence();
    this.nextToken();
    const right = this.parseExpression(precedence);
    infixExpr.setRight(right);

    return infixExpr;
  };

  private curTokenIs(t: TokenItem): boolean {
    return this.curToken.type === t;
  }

  private peekPrecedence(): PrecedenceValue {
    const precedence = precedenceTable[this.peekToken.type];
    if (precedence) {
      return precedence;
    }
    return Precedence.Lowest;
  }

  private curPrecedence(): PrecedenceValue {
    const precedence = precedenceTable[this.curToken.type];
    if (precedence) {
      return precedence;
    }
    return Precedence.Lowest;
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
      `expected next token to be ${t}, instead got ${this.peekToken.type}`
    );
  }

  public getErrors() {
    return this.errors;
  }
}
