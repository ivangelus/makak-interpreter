let traceLevel: number = 0;

const traceIdentPlaceholder: string = "\t";

function identLevel(): string {
	return traceIdentPlaceholder.repeat(traceLevel - 1);
}

function tracePrint(fs: string): void {
	console.log(`\n ${identLevel()} ${fs}`)
}

function incIdent() {
    traceLevel = traceLevel + 1
};
function decIdent() {
    traceLevel = traceLevel - 1
};

function trace(msg: string): string {
	incIdent();
	tracePrint(`BEGIN  ${msg}`);
	return msg;
}

function untrace(msg: string) {
	tracePrint("END " + msg);
	decIdent()
}