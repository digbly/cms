import axios from 'axios';
import { ArrowDown, ArrowUp, ChevronDown, Trash2 } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { route } from '@/lib/route';
import type {
    BlockDefinition,
    PageBlockItem,
    PageSummary,
    PageTemplateDefinition,
} from '../types';

interface HomePageCustomizeProps {
    value: string;
    pages: PageSummary[];
    pageTemplates: PageTemplateDefinition[];
    availableBlocks: BlockDefinition[];
    blocks: Record<string, PageBlockItem[]>;
    onChangePage: (pageId: string) => void;
    onBlocksChange: (blocks: Record<string, PageBlockItem[]>) => void;
}

/**
 * Homepage picker plus per-container block editor for the selected page.
 *
 * The page templates and available blocks are contributed by the backend
 * (PageTemplate/PageBlock registries). Block settings use a generic
 * title/description form until a theme ships a dedicated form.
 */
export default function HomePageCustomize({
    value,
    pages,
    pageTemplates,
    availableBlocks,
    blocks,
    onChangePage,
    onBlocksChange,
}: HomePageCustomizeProps) {
    const { t } = useTranslation();

    const selectedPage = pages.find((page) => page.id === value);
    const template = pageTemplates.find((item) => item.key === selectedPage?.template);
    const templateBlocks = template?.blocks ?? null;

    const handlePageChange = async (pageId: string): Promise<void> => {
        onChangePage(pageId);

        if (!pageId) {
            onBlocksChange({});
            return;
        }

        try {
            const response = await axios.get(
                route('admin.customize.page-blocks', { page: pageId })
            );
            onBlocksChange(response.data?.blocks ?? {});
        } catch {
            onBlocksChange({});
        }
    };

    return (
        <div className="space-y-4">
            <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    {t('admin.customize.homePage.title', 'Home page')}
                </label>
                <select
                    value={value}
                    onChange={(event) => void handlePageChange(event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-white/[0.08] dark:bg-slate-900/60 dark:text-white"
                >
                    <option value="">{t('admin.customize.homePage.select', 'Select a page')}</option>
                    {pages.map((page) => (
                        <option key={page.id} value={page.id}>
                            {page.title}
                        </option>
                    ))}
                </select>
            </div>

            {templateBlocks && (
                <div className="space-y-4 border-t border-slate-100 pt-3 dark:border-white/[0.06]">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        {t('admin.customize.homePage.templateBlocks', 'Template blocks')}
                    </h5>

                    {Object.entries(templateBlocks).map(([containerKey, containerLabel]) => (
                        <div
                            key={containerKey}
                            className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3 dark:border-white/[0.08] dark:bg-slate-900/40"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                    {containerLabel}
                                </span>
                                <ContainerAddBlock
                                    containerKey={containerKey}
                                    availableBlocks={availableBlocks}
                                    onAdd={(block) => {
                                        const list = blocks[containerKey] ?? [];
                                        onBlocksChange({
                                            ...blocks,
                                            [containerKey]: [
                                                ...list,
                                                { id: null, block: block.key, label: block.label, data: {} },
                                            ],
                                        });
                                    }}
                                />
                            </div>

                            {(blocks[containerKey] ?? []).length === 0 ? (
                                <p className="py-2 text-center text-xs italic text-slate-400">
                                    {t('admin.customize.homePage.noBlocks', 'No blocks yet.')}
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {(blocks[containerKey] ?? []).map((item, index) => (
                                        <BlockRow
                                            key={item.id ?? `${containerKey}-${index}`}
                                            item={item}
                                            isFirst={index === 0}
                                            isLast={index === (blocks[containerKey] ?? []).length - 1}
                                            onMove={(direction) => {
                                                const list = [...(blocks[containerKey] ?? [])];
                                                const target = direction === 'up' ? index - 1 : index + 1;

                                                if (target < 0 || target >= list.length) {
                                                    return;
                                                }

                                                [list[index], list[target]] = [list[target], list[index]];
                                                onBlocksChange({ ...blocks, [containerKey]: list });
                                            }}
                                            onRemove={() => {
                                                const list = [...(blocks[containerKey] ?? [])];
                                                list.splice(index, 1);
                                                onBlocksChange({ ...blocks, [containerKey]: list });
                                            }}
                                            onChangeData={(field, val) => {
                                                const list = [...(blocks[containerKey] ?? [])];
                                                list[index] = {
                                                    ...list[index],
                                                    data: { ...list[index].data, [field]: val },
                                                };
                                                onBlocksChange({ ...blocks, [containerKey]: list });
                                            }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function ContainerAddBlock({
    containerKey,
    availableBlocks,
    onAdd,
}: {
    containerKey: string;
    availableBlocks: BlockDefinition[];
    onAdd: (block: BlockDefinition) => void;
}) {
    const { t } = useTranslation();

    return (
        <select
            value=""
            aria-label={t('admin.customize.homePage.addBlock', 'Add block')}
            onChange={(event) => {
                const block = availableBlocks.find((item) => item.key === event.target.value);

                if (block) {
                    onAdd(block);
                }
            }}
            className="rounded-lg border border-indigo-200 bg-white px-2 py-1 text-xs text-indigo-600 dark:border-indigo-500/30 dark:bg-slate-900 dark:text-indigo-400"
        >
            <option value="" disabled>
                + {t('admin.customize.homePage.addBlock', 'Add block')}
            </option>
            {availableBlocks.map((block) => (
                <option key={`${containerKey}-${block.key}`} value={block.key}>
                    {block.label}
                </option>
            ))}
        </select>
    );
}

function BlockRow({
    item,
    isFirst,
    isLast,
    onMove,
    onRemove,
    onChangeData,
}: {
    item: PageBlockItem;
    isFirst: boolean;
    isLast: boolean;
    onMove: (direction: 'up' | 'down') => void;
    onRemove: () => void;
    onChangeData: (field: string, value: unknown) => void;
}) {
    const { t } = useTranslation();

    return (
        <details className="group rounded-lg border border-slate-200 bg-white dark:border-white/[0.08] dark:bg-slate-900">
            <summary className="flex cursor-pointer items-center justify-between gap-2 p-2.5 text-xs">
                <span className="flex items-center gap-1.5 truncate">
                    <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform group-open:rotate-180" />
                    <span className="rounded bg-indigo-50 px-1.5 py-0.5 font-semibold text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                        {item.block}
                    </span>
                    <span className="truncate font-medium text-slate-700 dark:text-slate-200">
                        {item.label || item.block}
                    </span>
                </span>

                <span className="flex items-center gap-0.5" onClick={(event) => event.preventDefault()}>
                    <button
                        type="button"
                        disabled={isFirst}
                        onClick={() => onMove('up')}
                        className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                    >
                        <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                        type="button"
                        disabled={isLast}
                        onClick={() => onMove('down')}
                        className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                    >
                        <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                    <button
                        type="button"
                        onClick={onRemove}
                        className="p-1 text-rose-400 hover:text-rose-600"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </button>
                </span>
            </summary>

            <div className="space-y-2 border-t border-slate-100 p-3 dark:border-white/[0.06]">
                <label className="block text-[10px] font-medium text-slate-500">
                    {t('admin.customize.homePage.blockTitle', 'Title')}
                </label>
                <input
                    type="text"
                    value={String(item.data?.title ?? '')}
                    onChange={(event) => onChangeData('title', event.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs dark:border-white/[0.08] dark:bg-slate-900 dark:text-white"
                />

                <label className="block text-[10px] font-medium text-slate-500">
                    {t('admin.customize.homePage.blockDescription', 'Description')}
                </label>
                <input
                    type="text"
                    value={String(item.data?.description ?? '')}
                    onChange={(event) => onChangeData('description', event.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs dark:border-white/[0.08] dark:bg-slate-900 dark:text-white"
                />
            </div>
        </details>
    );
}
