declare function safeJSONStringify(value?: unknown): string;
declare function safeJSONParse(value?: string): any;
declare const safeJSON: {
    stringify: typeof safeJSONStringify;
    parse: typeof safeJSONParse;
};
export { safeJSON, safeJSONParse, safeJSONStringify };
export default safeJSON;
//# sourceMappingURL=json.d.ts.map