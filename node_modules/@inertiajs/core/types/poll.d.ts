import { PollOptions } from './types';
type PollHooks = {
    onStart: (cancel: VoidFunction) => void;
    onFinish: VoidFunction;
};
export type PollCallback = (hooks: PollHooks) => void;
export declare class Poll {
    protected intervalId: number | null;
    protected timeoutId: number | null;
    protected throttle: boolean;
    protected keepAlive: boolean;
    protected cb: PollCallback;
    protected interval: number;
    protected cbCount: number;
    protected mode: 'overlap' | 'cancel' | 'rest';
    protected inFlight: boolean;
    protected currentCancel: VoidFunction | null;
    protected stopped: boolean;
    protected instanceId: number;
    constructor(interval: number, cb: PollCallback, options: PollOptions);
    stop(): void;
    start(): void;
    isInBackground(hidden: boolean): void;
    protected scheduleNext(): void;
    protected tick(): void;
    protected fire(): void;
}
export {};
