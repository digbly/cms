//#region src/string/dedent.ts
function dedent(str, ...values) {
	switch (typeof str) {
		case "function": return function(strings, ...args) {
			return str(dedentTemplateStringsArray(strings), ...args);
		};
		case "string": return dedentImpl(str);
		default: {
			let text = str[0];
			for (let i = 0; i < values.length; i++) text += String(values[i]) + str[i + 1];
			return dedentImpl(text);
		}
	}
}
function dedentTemplateStringsArray(strings) {
	const parts = dedentImpl(strings.join("\0")).split("\0");
	return Object.assign(parts, { raw: parts });
}
function dedentImpl(text) {
	text = text.replace(/\r\n/g, "\n");
	const lines = text.split("\n");
	if (lines.length > 0 && lines[0].trim() === "") lines.shift();
	if (lines.length > 0 && lines[lines.length - 1].trim() === "") lines.pop();
	let commonIndent = Infinity;
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		if (line.trim() === "") continue;
		let indent = 0;
		while (indent < line.length && (line[indent] === " " || line[indent] === "	")) indent++;
		if (indent < commonIndent) commonIndent = indent;
	}
	if (commonIndent === Infinity) return "";
	for (let i = 0; i < lines.length; i++) if (lines[i].trim() === "") lines[i] = "";
	else lines[i] = lines[i].slice(commonIndent);
	return lines.join("\n");
}
//#endregion
exports.dedent = dedent;
