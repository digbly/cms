import { ActiveVisit } from './types';
type VisitFilter = Pick<ActiveVisit, 'only' | 'except'>;
export declare const isPathOrSubPath: (path: string, candidate: string) => boolean;
export declare const partialReloadRequestsProp: (visit: VisitFilter, prop: string) => boolean;
export declare const partialReloadRequestsSomeProps: (visit: VisitFilter, props: string[]) => boolean;
export {};
