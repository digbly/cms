import type { HeadManager, HeadManagerOnUpdateCallback, Page, ServerHeadOption } from './types';
export declare function resolveServerHead(page: Page, serverHead?: ServerHeadOption): string[];
export default function createHeadManager(isServer: boolean, titleCallback: (title: string) => string, onUpdate: HeadManagerOnUpdateCallback, initialServerHead?: Array<string>): HeadManager;
