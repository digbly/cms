import { Client, RequestMethod } from './types.js';
/**
 * The precognitive HTTP client instance.
 */
export declare const client: Client;
/**
 * Resolve the url from a potential callback.
 */
export declare const resolveUrl: (url: string | (() => string)) => string;
/**
 * Resolve the method from a potential callback.
 */
export declare const resolveMethod: (method: RequestMethod | (() => RequestMethod)) => RequestMethod;
