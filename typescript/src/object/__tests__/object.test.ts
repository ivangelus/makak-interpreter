import { MonkeyString } from "../valueObject";

describe("hashKey", () => {
	it("should support string objects", () => {
		const hello1 = new MonkeyString("hello world");
		const hello2 = new MonkeyString("hello world");
		const diff1 = new MonkeyString("the same still");
		const diff2 = new MonkeyString("the same still");

		expect(hello1.hashKey()).toEqual(hello2.hashKey());
		expect(diff1.hashKey()).toEqual(diff2.hashKey());
		expect(hello1.hashKey()).not.toEqual(diff1.hashKey());
	});
});
