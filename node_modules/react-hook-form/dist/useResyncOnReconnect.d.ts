export declare function useResyncOnReconnect<T>(getInitialValue?: () => T): {
    resyncIfNeeded: (enabled: boolean, getCurrentValue: () => T, setValue: (value: T) => void) => void;
    snapshot: (enabled: boolean, getCurrentValue: () => T) => void;
};
//# sourceMappingURL=useResyncOnReconnect.d.ts.map