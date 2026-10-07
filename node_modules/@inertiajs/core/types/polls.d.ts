import { Poll, PollCallback } from './poll';
import { PollOptions } from './types';
declare class Polls {
    protected polls: Poll[];
    constructor();
    get count(): number;
    add(interval: number, cb: PollCallback, options: PollOptions): {
        stop: VoidFunction;
        start: VoidFunction;
        destroy: VoidFunction;
    };
    clear(): void;
    protected setupVisibilityListener(): void;
}
export declare const polls: Polls;
export {};
