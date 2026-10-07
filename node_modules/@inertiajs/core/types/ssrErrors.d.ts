/**
 * SSR Error Classification
 *
 * This module detects common SSR errors and provides helpful hints
 * to developers on how to fix them. The most common issue is using
 * browser-specific APIs (like window, document) that don't exist
 * in the Node.js server environment.
 */
export type SSRErrorType = 'browser-api' | 'component-resolution' | 'render' | 'unknown';
type SourceMapResolver = (file: string, line: number, column: number) => {
    file: string;
    line: number;
    column: number;
} | null;
export declare function setSourceMapResolver(resolver: SourceMapResolver | null): void;
export interface ClassifiedSSRError {
    error: string;
    type: SSRErrorType;
    component?: string;
    url?: string;
    browserApi?: string;
    hint: string;
    stack?: string;
    sourceLocation?: string;
    timestamp: string;
}
export declare function classifySSRError(error: unknown, component?: string, url?: string): ClassifiedSSRError;
export declare function formatConsoleError(classified: ClassifiedSSRError, root?: string, formatErrors?: boolean, suppressedWarnings?: string[]): string;
export {};
