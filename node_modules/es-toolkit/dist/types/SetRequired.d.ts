import { Simplify } from "./Simplify.js";

//#region src/types/SetRequired.d.ts
/**
 * Makes the given keys `K` of `T` required, leaving the rest unchanged.
 * Like the built-in `Required`, but scoped to specific keys.
 *
 * Distributes over unions, so a union stays a union.
 *
 * @template T - The object type to transform.
 * @template K - The keys to make required.
 *
 * @example
 * type User = { id: number; name: string; avatar?: string };
 * type ProfileUser = SetRequired<User, 'avatar'>;
 * // => { id: number; name: string; avatar: string }
 */
type SetRequired<T, K extends keyof T> = T extends unknown ? Simplify<T & Required<Pick<T, K>>> : never;
//#endregion
export { SetRequired };