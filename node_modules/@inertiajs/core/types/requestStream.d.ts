import { Request } from './request';
export declare class RequestStream {
    protected requests: Request[];
    protected maxConcurrent: number;
    protected interruptible: boolean;
    constructor({ maxConcurrent, interruptible }: {
        maxConcurrent: number;
        interruptible: boolean;
    });
    send(request: Request): void;
    interruptInFlight(): void;
    cancelInFlight(options?: {
        prefetch?: boolean;
        optimistic?: boolean;
    } | ((request: Request) => boolean)): void;
    protected cancel({ cancelled, interrupted }?: {
        cancelled?: boolean | undefined;
        interrupted?: boolean | undefined;
    }, force?: boolean): void;
    protected shouldCancel(): boolean;
    hasPendingOptimistic(): boolean;
}
