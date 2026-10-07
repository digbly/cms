import { ValidationCallback, NamedInputEvent, SimpleValidationErrors, ValidationErrors, Validator as TValidator } from './types.js';
/**
 * Expand a wildcard path to concrete paths using the given data.
 *
 * Examples:
 * - 'users.*' with {users: [{name: 'A'}, {name: 'B'}]} => ['users.0', 'users.1']
 * - 'users.*.name' with {users: [{name: 'A'}, {name: 'B'}]} => ['users.0.name', 'users.1.name']
 * - 'author.*' with {author: {name: 'John', bio: 'Dev'}} => ['author.name', 'author.bio']
 */
export declare const expandWildcardPaths: (pattern: string, data: Record<string, unknown>) => string[];
export declare const createValidator: (callback: ValidationCallback, initialData?: Record<string, unknown>) => TValidator;
/**
 * Normalise the validation errors as Inertia formatted errors.
 */
export declare const toSimpleValidationErrors: (errors: ValidationErrors | SimpleValidationErrors) => SimpleValidationErrors;
/**
 * Normalise the validation errors as Laravel formatted errors.
 */
export declare const toValidationErrors: (errors: ValidationErrors | SimpleValidationErrors) => ValidationErrors;
/**
 * Resolve the input's "name" attribute.
 */
export declare const resolveName: (name: string | NamedInputEvent) => string;
