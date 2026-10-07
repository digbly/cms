import { useMemo, useState } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    type DragEndEvent,
    type DragMoveEvent,
    type DragStartEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ChevronDown, ChevronLeft, ChevronRight, GripVertical, Trash2 } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import type { FlatMenuItem, MenuItem } from '../types';

const INDENT_STEP = 24;
const MAX_DEPTH = 2;

const levelBorder = [
    'border-l-4 border-l-indigo-500',
    'border-l-4 border-l-emerald-500',
    'border-l-4 border-l-amber-500',
];

const levelBadge = [
    'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
    'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    'bg-amber-500/10 text-amber-600 dark:text-amber-400',
];

const clampDepth = (depth: number): number => Math.max(0, Math.min(MAX_DEPTH, depth));

const flattenTree = (items: MenuItem[], depth = 0): FlatMenuItem[] =>
    items.reduce<FlatMenuItem[]>((result, item) => {
        const { children, ...rest } = item;
        result.push({ ...rest, children: [], depth });

        if (children && children.length > 0) {
            result = result.concat(flattenTree(children, depth + 1));
        }

        return result;
    }, []);

const buildTree = (flatItems: FlatMenuItem[]): MenuItem[] => {
    const root: MenuItem[] = [];
    const lastActiveAtDepth: Record<number, MenuItem> = {};

    for (const item of flatItems) {
        const node: MenuItem = {
            id: item.id,
            label: item.label,
            link: item.link,
            target: item.target,
            is_custom: item.is_custom,
            box_key: item.box_key,
            menuable_id: item.menuable_id,
            menuable_type: item.menuable_type,
            menuable_class_name: item.menuable_class_name,
            children: [],
        };

        if (item.depth === 0) {
            root.push(node);
            lastActiveAtDepth[0] = node;
        } else {
            const parent = lastActiveAtDepth[item.depth - 1];

            if (parent) {
                parent.children.push(node);
            } else {
                root.push(node);
            }

            lastActiveAtDepth[item.depth] = node;
        }
    }

    return root;
};

const normalizeDepths = (list: FlatMenuItem[]): FlatMenuItem[] => {
    let previousDepth = -1;

    return list.map((item, index) => {
        let depth = clampDepth(item.depth ?? 0);

        if (index === 0) {
            depth = 0;
        } else if (depth > previousDepth + 1) {
            depth = previousDepth + 1;
        }

        previousDepth = depth;

        return { ...item, depth };
    });
};

interface SortableMenuItemProps {
    item: FlatMenuItem;
    activeId: string | null;
    dragX: number;
    canIndent: boolean;
    canOutdent: boolean;
    onUpdate: (id: string, data: Partial<MenuItem>) => void;
    onRemove: (id: string) => void;
    onIndent: () => void;
    onOutdent: () => void;
}

const SortableMenuItem = ({
    item,
    activeId,
    dragX,
    canIndent,
    canOutdent,
    onUpdate,
    onRemove,
    onIndent,
    onOutdent,
}: SortableMenuItemProps) => {
    const { t } = useTranslation();
    const [isExpanded, setIsExpanded] = useState(false);

    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: item.id,
    });

    const currentDepth = useMemo(() => {
        if (isDragging && item.id === activeId) {
            return clampDepth(item.depth + Math.round(dragX / INDENT_STEP));
        }

        return item.depth;
    }, [isDragging, item.id, activeId, item.depth, dragX]);

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        marginLeft: `${currentDepth * INDENT_STEP}px`,
        opacity: isDragging ? 0.3 : 1,
    };

    const levelLabel = t('admin.menus.builder.level', 'Lvl {{level}}').replace(
        '{{level}}',
        String(currentDepth + 1)
    );

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`mb-2 rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-200 dark:border-white/[0.07] dark:bg-slate-900 ${
                levelBorder[currentDepth] ?? 'border-l-4 border-l-slate-200'
            }`}
        >
            <div
                className="flex cursor-grab select-none items-center justify-between p-3"
                {...attributes}
                {...listeners}
            >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                    <GripVertical className="h-4 w-4 shrink-0 text-slate-400" />
                    <span className="truncate font-medium text-slate-700 dark:text-slate-200">
                        {item.label}
                    </span>
                    <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                            levelBadge[currentDepth] ?? 'bg-slate-500/10 text-slate-500'
                        }`}
                    >
                        {levelLabel}
                    </span>
                </div>

                <div className="flex items-center gap-1" onPointerDown={(event) => event.stopPropagation()}>
                    <button
                        type="button"
                        onClick={onOutdent}
                        disabled={!canOutdent}
                        title={t('admin.menus.builder.outdent', 'Outdent')}
                        aria-label={t('admin.menus.builder.outdent', 'Outdent')}
                        className="p-1 text-slate-500 transition-colors hover:text-indigo-600 disabled:opacity-30"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={onIndent}
                        disabled={!canIndent}
                        title={t('admin.menus.builder.indent', 'Indent')}
                        aria-label={t('admin.menus.builder.indent', 'Indent')}
                        className="p-1 text-slate-500 transition-colors hover:text-indigo-600 disabled:opacity-30"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                    <div className="mx-1 h-4 w-[1px] bg-slate-200 dark:bg-white/10" />
                    <button
                        type="button"
                        onClick={() => setIsExpanded((value) => !value)}
                        aria-label={t('admin.menus.builder.toggle', 'Toggle details')}
                        className="p-1.5 text-slate-500 transition-colors hover:text-indigo-600"
                    >
                        <ChevronDown
                            className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        />
                    </button>
                    <button
                        type="button"
                        onClick={() => onRemove(item.id)}
                        aria-label={t('admin.menus.builder.remove', 'Remove item')}
                        className="p-1.5 text-slate-500 transition-colors hover:text-rose-600"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {isExpanded && (
                <div className="space-y-4 border-t border-slate-100 p-4 dark:border-white/[0.06]">
                    <div>
                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                            {t('admin.menus.builder.navigationLabel', 'Navigation label')}
                        </label>
                        <input
                            type="text"
                            value={item.label}
                            onChange={(event) => onUpdate(item.id, { label: event.target.value })}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-white/[0.08] dark:bg-slate-900/60 dark:text-white"
                        />
                    </div>

                    {item.is_custom && (
                        <div>
                            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                                {t('admin.menus.builder.url', 'URL')}
                            </label>
                            <input
                                type="text"
                                value={item.link ?? ''}
                                onChange={(event) => onUpdate(item.id, { link: event.target.value })}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-white/[0.08] dark:bg-slate-900/60 dark:text-white"
                            />
                        </div>
                    )}

                    <div>
                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                            {t('admin.menus.builder.target', 'Target')}
                        </label>
                        <select
                            value={item.target ?? '_self'}
                            onChange={(event) => onUpdate(item.id, { target: event.target.value })}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-white/[0.08] dark:bg-slate-900/60 dark:text-white"
                        >
                            <option value="_self">{t('admin.menus.builder.sameWindow', 'Same window (_self)')}</option>
                            <option value="_blank">{t('admin.menus.builder.newWindow', 'New window (_blank)')}</option>
                        </select>
                    </div>
                </div>
            )}
        </div>
    );
};

const MenuItemPreview = ({ item }: { item: FlatMenuItem }) => (
    <div
        style={{ marginLeft: `${item.depth * INDENT_STEP}px` }}
        className={`mb-2 cursor-grabbing rounded-xl border border-slate-200 bg-white opacity-90 shadow-lg dark:border-white/[0.07] dark:bg-slate-900 ${
            levelBorder[item.depth] ?? 'border-l-4 border-l-slate-200'
        }`}
    >
        <div className="flex items-center gap-3 p-3">
            <GripVertical className="h-4 w-4 shrink-0 text-slate-400" />
            <span className="truncate font-medium text-slate-700 dark:text-slate-200">{item.label}</span>
        </div>
    </div>
);

interface MenuBuilderProps {
    items: MenuItem[];
    onChange: (items: MenuItem[]) => void;
}

export default function MenuBuilder({ items, onChange }: MenuBuilderProps) {
    const { t } = useTranslation();
    const [activeId, setActiveId] = useState<string | null>(null);
    const [dragX, setDragX] = useState(0);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const flatItems = useMemo(() => flattenTree(items), [items]);

    const activeItem = useMemo(
        () => (activeId ? flatItems.find((item) => item.id === activeId) ?? null : null),
        [activeId, flatItems]
    );

    const activePreview = useMemo(
        () =>
            activeItem
                ? { ...activeItem, depth: clampDepth(activeItem.depth + Math.round(dragX / INDENT_STEP)) }
                : null,
        [activeItem, dragX]
    );

    const commit = (list: FlatMenuItem[]) => onChange(buildTree(normalizeDepths(list)));

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(String(event.active.id));
        setDragX(0);
    };

    const handleDragMove = (event: DragMoveEvent) => setDragX(event.delta.x);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over, delta } = event;
        setActiveId(null);
        setDragX(0);

        if (!over) {
            return;
        }

        const oldIndex = flatItems.findIndex((item) => item.id === active.id);
        const newIndex = flatItems.findIndex((item) => item.id === over.id);

        if (oldIndex === -1 || newIndex === -1) {
            return;
        }

        const moved = arrayMove(flatItems, oldIndex, newIndex).map((item) =>
            item.id === active.id
                ? { ...item, depth: clampDepth(item.depth + Math.round(delta.x / INDENT_STEP)) }
                : item
        );

        commit(moved);
    };

    const handleUpdate = (id: string, data: Partial<MenuItem>) => {
        commit(flatItems.map((item) => (item.id === id ? { ...item, ...data } : item)));
    };

    const handleRemove = (id: string) => commit(flatItems.filter((item) => item.id !== id));

    const handleIndent = (index: number) => {
        const updated = [...flatItems];
        updated[index] = { ...updated[index], depth: updated[index].depth + 1 };
        commit(updated);
    };

    const handleOutdent = (index: number) => {
        const updated = [...flatItems];
        updated[index] = { ...updated[index], depth: updated[index].depth - 1 };
        commit(updated);
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragMove={handleDragMove}
            onDragEnd={handleDragEnd}
            onDragCancel={() => {
                setActiveId(null);
                setDragX(0);
            }}
        >
            <div className="space-y-2">
                <SortableContext
                    items={flatItems.map((item) => item.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {flatItems.map((item, index) => {
                        const previousDepth = index > 0 ? flatItems[index - 1].depth : -1;

                        return (
                            <SortableMenuItem
                                key={item.id}
                                item={item}
                                activeId={activeId}
                                dragX={dragX}
                                canIndent={item.depth < MAX_DEPTH && item.depth <= previousDepth}
                                canOutdent={item.depth > 0}
                                onUpdate={handleUpdate}
                                onRemove={handleRemove}
                                onIndent={() => handleIndent(index)}
                                onOutdent={() => handleOutdent(index)}
                            />
                        );
                    })}
                </SortableContext>

                <DragOverlay>
                    {activePreview ? <MenuItemPreview item={activePreview} /> : null}
                </DragOverlay>

                {flatItems.length === 0 && (
                    <div className="rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center text-sm text-slate-500 dark:border-white/[0.08] dark:text-slate-400">
                        {t(
                            'admin.menus.builder.empty',
                            'Select items from the left to add them to the menu.'
                        )}
                    </div>
                )}
            </div>
        </DndContext>
    );
}
