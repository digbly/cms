//#region src/string/dedent.d.ts
/**
 * Removes common leading whitespace from each line of a multi-line string.
 *
 * This function can be used as a regular function, as a tagged template literal,
 * or composed with another tag function (TC39 String.dedent proposal).
 * It calculates the common indentation across all non-empty lines and removes it,
 * preserving relative indentation differences between lines.
 * The first and last lines are removed if they are empty or contain only whitespace.
 *
 * @param {string | TemplateStringsArray | Function} str - The string, template literal, or tag function to dedent.
 * @param {unknown[]} values - The values to interpolate when used as a tagged template literal.
 * @returns {string | Function} The dedented string, or a dedented tag function when composed.
 *
 * @example
 * // As a regular function
 * dedent("  hello\n  world"); // "hello\nworld"
 *
 * @example
 * // As a tagged template literal
 * dedent`
 *   hello
 *   world
 * `; // "hello\nworld"
 *
 * @example
 * // Tag composition
 * const html = dedent((strings, ...values) => strings.join(''));
 * html`
 *   <div>Hello</div>
 * `; // "<div>Hello</div>"
 */
declare function dedent(str: string): string;
declare function dedent(str: TemplateStringsArray, ...values: unknown[]): string;
declare function dedent<T>(tagFn: (strings: TemplateStringsArray, ...values: unknown[]) => T): (strings: TemplateStringsArray, ...values: unknown[]) => T;
//#endregion
export { dedent };