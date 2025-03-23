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
import { Boolean } from "../ast/expressions/boolean";
import { IfExpression } from "../ast/expressions/ifExpression";
import { BlockStatement } from "../ast/statements/blockStatement";
import { FunctionLiteral } from "../ast/expressions/functionLiteral";
import { CallExpression } from "../ast/expressions/callExpression";
import { StringLiteral } from "../ast/expressions/stringLiteral";
import { ArrayLiteral } from "../ast/expressions/arrayLiteral";
import { IndexExpression } from "../ast/expressions/indexExpression";
import { HashLiteral } from "../ast/expressions/hashLiteral";

const Precedence = {
	Lowest: 0,
	Equals: 1, // ==
	LessGreater: 2, // > or <
	Sum: 3, // +
	Product: 4, // *
	Prefix: 5, // -X or !X
	Call: 6, // myFunction(X)
	Index: 7, // [1, 2, 3][0]
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
	[TokenType.LParen]: Precedence.Call,
	[TokenType.LBracket]: Precedence.Index,
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

		statement.setReturnValue(this.parseExpression(Precedence.Lowest));

		if (this.peekTokenIs(TokenType.Semicolon)) {
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

		this.nextToken();

		statement.setValue(this.parseExpression(Precedence.Lowest));

		if (this.peekTokenIs(TokenType.Semicolon)) {
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

	private parseHashLiteral = (): Expression => {
		const hashLiteral = new HashLiteral(this.curToken);
		const pairs = new Map<Expression, Expression>;

		while (!this.peekTokenIs(TokenType.RBrace)) {
			this.nextToken();

			const key = this.parseExpression(Precedence.Lowest);

			if (!this.expectPeek(TokenType.Colon)) {
				return null;
			}

			this.nextToken();
			const value = this.parseExpression(Precedence.Lowest);

			pairs.set(key, value);

			if (!this.peekTokenIs(TokenType.RBrace) && !this.expectPeek(TokenType.Comma)) {
				return null;
			}
		}

		if (!this.expectPeek(TokenType.RBrace)) {
			return null;
		}

		hashLiteral.setPairs(pairs);

		return hashLiteral;
	};

	private parseIdentifier = (): Expression => {
		return new Identifier(this.curToken, this.curToken.literal);
	};

	private parseBoolean = (): Expression => {
		return new Boolean(this.curToken, this.curTokenIs(TokenType.True));
	};

	private parseGroupedExpression = (): Expression | null => {
		this.nextToken();
		const exp = this.parseExpression(Precedence.Lowest);

		if (!this.expectPeek(TokenType.RParen)) {
			return null;
		}

		return exp;
	};

	public parseBlockStatement(): BlockStatement {
		const blockStatement = new BlockStatement(this.curToken);
		this.nextToken();

		while (
			!this.curTokenIs(TokenType.RBrace) &&
			!this.curTokenIs(TokenType.Eof)
		) {
			const stmt = this.parseStatement();
			if (stmt) {
				blockStatement.appendStatement(stmt);
			}
			this.nextToken();
		}

		return blockStatement;
	}

	private parseIfExpression = (): Expression | null => {
		const expression = new IfExpression(this.curToken);

		if (!this.expectPeek(TokenType.LParen)) {
			return null;
		}

		this.nextToken();
		expression.setCondition(this.parseExpression(Precedence.Lowest));

		if (!this.expectPeek(TokenType.RParen)) {
			return null;
		}

		if (!this.expectPeek(TokenType.LBrace)) {
			return null;
		}

		expression.setConsequence(this.parseBlockStatement());

		if (this.peekTokenIs(TokenType.Else)) {
			this.nextToken();

			if (!this.expectPeek(TokenType.LBrace)) {
				return null;
			}

			expression.setAlternative(this.parseBlockStatement());
		}

		return expression;
	};

	private parseFunctionParams(): Identifier[] {
		const identifiers: Identifier[] = [];

		if (this.peekTokenIs(TokenType.RParen)) {
			this.nextToken();
			return identifiers;
		}
		this.nextToken();

		const ident = new Identifier(this.curToken, this.curToken.literal);
		identifiers.push(ident);

		while (this.peekTokenIs(TokenType.Comma)) {
			this.nextToken();
			this.nextToken();
			const ident = new Identifier(this.curToken, this.curToken.literal);
			identifiers.push(ident);
		}

		if (!this.expectPeek(TokenType.RParen)) {
			return null;
		}
		return identifiers;
	}

	private parseFunctionLiteral = (): Expression | null => {
		const functionLiteral = new FunctionLiteral(this.curToken);

		if (!this.expectPeek(TokenType.LParen)) {
			return null;
		}

		functionLiteral.setParams(this.parseFunctionParams());

		if (!this.expectPeek(TokenType.LBrace)) {
			return null;
		}

		functionLiteral.setBody(this.parseBlockStatement());

		return functionLiteral;
	};

	private parseStringLiteral = (): Expression | null => {
		return new StringLiteral(this.curToken, this.curToken.literal);
	};

	private parseArrayLiteral = (): Expression | null => {
		const arrayLiteral = new ArrayLiteral(this.curToken);

		arrayLiteral.setElements(this.parseExpressionList(TokenType.RBracket));
		return arrayLiteral;
	};

	private parseExpressionList(endToken: TokenItem): Expression[] {
		const list: Expression[] = [];

		if (this.peekTokenIs(endToken)) {
			this.nextToken();
			return list;
		}

		this.nextToken();
		list.push(this.parseExpression(Precedence.Lowest));

		while (this.peekTokenIs(TokenType.Comma)) {
			this.nextToken();
			this.nextToken();
			list.push(this.parseExpression(Precedence.Lowest));
		}

		if (!this.expectPeek(endToken)) {
			return null;
		}
		return list;
	}

	private parseExpression(precedence: PrecedenceValue): Expression | null {
		const prefixFn = this.prefixParseFnSupplier();

		if (prefixFn === null) {
			this.errors.push(
				`no prefix parse function for ${this.curToken.type} found`,
			);
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
			case TokenType.True:
				return this.parseBoolean;
			case TokenType.False:
				return this.parseBoolean;
			case TokenType.LParen:
				return this.parseGroupedExpression;
			case TokenType.If:
				return this.parseIfExpression;
			case TokenType.Function:
				return this.parseFunctionLiteral;
			case TokenType.String:
				return this.parseStringLiteral;
			case TokenType.LBracket:
				return this.parseArrayLiteral;
			case TokenType.LBrace:
				return this.parseHashLiteral;
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
			case TokenType.LParen:
				return this.parseCallExpression;
			case TokenType.LBracket:
				return this.parseIndexExpression;
			default:
				return null;
		}
	}

	private parsePrefixExpression = (): Expression => {
		const prefixExpr = new PrefixExpression(
			this.curToken,
			this.curToken.literal,
		);

		this.nextToken();

		prefixExpr.setRight(this.parseExpression(Precedence.Prefix));

		return prefixExpr;
	};

	private parseCallExpression = (fn: Expression): Expression => {
		const exp = new CallExpression(this.curToken, fn);
		const args = this.parseCallArgs();
		exp.setArgs(args);
		return exp;
	};

	private parseIndexExpression = (left: Expression): Expression => {
		const exp = new IndexExpression(this.curToken, left);
		this.nextToken();
		exp.setIndex(this.parseExpression(Precedence.Lowest));
		if (!this.expectPeek(TokenType.RBracket)) {
			return null;
		}
		return exp;
	};

	private parseCallArgs(): Expression[] {
		const args: Expression[] = [];

		if (this.peekTokenIs(TokenType.RParen)) {
			this.nextToken();
			return args;
		}

		this.nextToken();
		args.push(this.parseExpression(Precedence.Lowest));

		while (this.peekTokenIs(TokenType.Comma)) {
			this.nextToken();
			this.nextToken();
			args.push(this.parseExpression(Precedence.Lowest));
		}

		if (!this.expectPeek(TokenType.RParen)) {
			return null;
		}

		return args;
	}

	private parseInfixExpression = (left: Expression): Expression => {
		const infixExpr = new InfixExpression(
			this.curToken,
			this.curToken.literal,
			left,
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
			`expected next token to be ${t}, instead got ${this.peekToken.type}`,
		);
	}

	public getErrors() {
		return this.errors;
	}
}
