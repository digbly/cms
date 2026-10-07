import { isIterable } from "../../predicate/isIterable.mjs";
import { isArrayLike } from "../predicate/isArrayLike.mjs";
import { isMap } from "../predicate/isMap.mjs";
import { isSet } from "../predicate/isSet.mjs";
//#region src/compat/util/toArray.ts
/**
* Converts a value to an array.
*
* @param value - The value to convert.
* @returns Returns the converted array.
*
* @example
* toArray({ 'a': 1, 'b': 2 }) // => [1,2]
* toArray('abc') // => ['a', 'b', 'c']
* toArray(1) // => []
* toArray(null) // => []
*/
function toArray(value) {
	if (value == null) return [];
	if (isArrayLike(value) || isMap(value) || isSet(value)) return Array.from(value);
	if (typeof value === "object") {
		if (isIterable(value)) return Array.from(value);
		return Object.values(value);
	}
	return [];
}
//#endregion
export { toArray };
