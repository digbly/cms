import type { LayoutProps, NamedLayoutProps } from './types';
export interface LayoutDefinition<Component> {
    component: Component;
    props: Record<string, unknown>;
    name?: string;
}
export type LayoutCallbackReturn<C> = C | [C, Record<string, unknown>?] | C[] | (C | [C, Record<string, unknown>?])[] | {
    component: C;
    props?: Record<string, unknown>;
} | Record<string, C | [C, Record<string, unknown>?] | {
    component: C;
    props?: Record<string, unknown>;
}> | Partial<LayoutProps>;
export interface LayoutPropsStore {
    set(props: Partial<LayoutProps>): void;
    setFor<K extends keyof NamedLayoutProps>(name: K, props: Partial<NamedLayoutProps[K]>): void;
    get(): {
        shared: Record<string, unknown>;
        named: Record<string, Record<string, unknown>>;
    };
    reset(): void;
    subscribe(callback: () => void): () => void;
}
export declare function createLayoutPropsStore(): LayoutPropsStore;
type ComponentCheck<T> = (value: unknown) => value is T;
export declare function isPropsObject<T>(value: unknown, isComponent: ComponentCheck<T>): boolean;
export declare function isPropsObjectOrCallback<T>(value: unknown, isComponent: ComponentCheck<T>): boolean;
/**
 * Normalizes layout definitions into a consistent structure.
 */
export declare function normalizeLayouts<T>(layout: unknown, isComponent: ComponentCheck<T>, isRenderFunction?: (value: unknown) => boolean): LayoutDefinition<T>[];
export {};
