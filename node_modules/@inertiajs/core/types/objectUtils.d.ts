export declare const stripTopLevelUndefined: <T extends Record<string, unknown>>(obj: T) => T;
export declare const objectsAreEqual: <T extends Record<string, any>>(obj1: T, obj2: T, excludeKeys: { [K in keyof T]: K; }[keyof T][]) => boolean;
export declare const setPathPreservingIdentity: <T>(target: T, path: string, value: unknown) => T;
