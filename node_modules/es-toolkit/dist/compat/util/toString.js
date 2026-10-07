const require_isSymbol = require("../predicate/isSymbol.js");
//#region src/compat/util/toString.ts
/**
* Converts `value` to a string.
*
* An empty string is returned for `null` and `undefined` values.
* The sign of `-0` is preserved.
*
* @param value - The value to convert.
* @returns Returns the converted string.
*
* @example
* toString(null) // returns ''
* toString(undefined) // returns ''
* toString(-0) // returns '-0'
* toString([1, 2, -0]) // returns '1,2,-0'
* toString([Symbol('a'), Symbol('b')]) // returns 'Symbol(a),Symbol(b)'
*/
function toString(value) {
	if (value == null) return "";
	return baseToString(value);
}
function baseToString(value) {
	if (typeof value === "string") return value;
	if (Array.isArray(value)) return value.map(baseToString).join(",");
	if (require_isSymbol.isSymbol(value)) return value.toString();
	const result = value + "";
	if (result === "0" && Object.is(Number(value), -0)) return "-0";
	return result;
}
//#endregion
exports.toString = toString;
