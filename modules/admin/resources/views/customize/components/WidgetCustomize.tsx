import { useState } from 'react';
import { ChevronDown, GripVertical, Trash2 } from 'lucide-react';
import {
    closestCenter,
    DndContext,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTranslation } from '@/hooks/useTranslation';
import WidgetFormRenderer from '../../widgets/components/FormRenderer';
import type { SidebarWidgetItem } from '../../widgets/types';
import type { CustomizeWidgetData } from '../types';

interface WidgetCustomizeProps {
    data: CustomizeWidgetData;
    items: Record<string, SidebarWidgetItem[]>;
    theme: string | null;
    onChange: (items: Record<string, SidebarWidgetItem[]>) => void;
}

const generateTempKey = (): string =>
    `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

const itemKey = (item: SidebarWidgetItem, index: number): string =>
    item._tempKey ?? item.id ?? String(index);

/**
 * Widget editor embedded in the customizer. Unlike the standalone widgets
 * screen, changes are kept in local state and published together with the
 * other customizer settings.
 */
export default function WidgetCustomize({ data, items, theme, onChange }: WidgetCustomizeProps) {
    const { t } = useTranslation();
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const itemsFor = (key: string): SidebarWidgetItem[] => items[key] ?? [];

    const setSidebarItems = (key: string, next: SidebarWidgetItem[]): void => {
        onChange({ ...items, [key]: next });
    };

    const handleAdd = (sidebarKey: string, widgetKey: string): void => {
        const widget = data.widgets.find((item) => item.key === widgetKey);

        if (!widget) {
            return;
        }

        setSidebarItems(sidebarKey, [
            ...itemsFor(sidebarKey),
            {
                id: '',
                widget: widget.key,
                label: widget.label,
                data: {},
                _tempKey: generateTempKey(),
            },
        ]);
    };

    const handleChange = (
        sidebarKey: string,
        index: number,
        patch: { label?: string; data?: Record<string, unknown> }
    ): void => {
        const list = [...itemsFor(sidebarKey)];
        const target = list[index];

        if (!target) {
            return;
        }

        list[index] = {
            ...target,
            label: patch.label ?? target.label,
            data: patch.data ?? target.data,
        };

        setSidebarItems(sidebarKey, list);
    };

    const handleDragEnd = (sidebarKey: string, event: DragEndEvent): void => {
        const { active, over } = event;

        if (!over || active.id === over.id) {
            return;
        }

        const list = itemsFor(sidebarKey);
        const oldIndex = list.findIndex((item, index) => itemKey(item, index) === active.id);
        const newIndex = list.findIndex((item, index) => itemKey(item, index) === over.id);

        if (oldIndex === -1 || newIndex === -1) {
            return;
        }

        setSidebarItems(sidebarKey, arrayMove(list, oldIndex, newIndex));
    };

    if (data.sidebars.length === 0) {
        return (
            <p className="text-sm text-slate-500 dark:text-slate-400">
                {t('admin.customize.widgets.empty', 'No sidebars available.')}
            </p>
        );
    }

    return (
        <div className="space-y-5">
            {data.sidebars.map((sidebar) => {
                const list = itemsFor(sidebar.key);
                const available = data.widgets.filter(
                    (widget) => widget.only.length === 0 || widget.only.includes(sidebar.key)
                );

                return (
                    <div key={sidebar.key} className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                    {sidebar.label}
                                </h4>
                                {sidebar.description && (
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        {sidebar.description}
                                    </p>
                                )}
                            </div>

                            <select
                                value=""
                                aria-label={t('admin.customize.widgets.add', 'Add widget')}
                                onChange={(event) => {
                                    if (event.target.value) {
                                        handleAdd(sidebar.key, event.target.value);
                                    }
                                }}
                                className="rounded-lg border border-indigo-200 bg-white px-2 py-1 text-xs text-indigo-600 dark:border-indigo-500/30 dark:bg-slate-900 dark:text-indigo-400"
                            >
                                <option value="" disabled>
                                    + {t('admin.customize.widgets.add', 'Add widget')}
                                </option>
                                {available.map((widget) => (
                                    <option key={`${sidebar.key}-${widget.key}`} value={widget.key}>
                                        {widget.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={(event) => handleDragEnd(sidebar.key, event)}
                        >
                            <SortableContext
                                items={list.map((item, index) => itemKey(item, index))}
                                strategy={verticalListSortingStrategy}
                            >
                                <div className="space-y-2 rounded-xl border border-dashed border-slate-300 p-3 dark:border-white/[0.1]">
                                    {list.length === 0 && (
                                        <p className="py-3 text-center text-xs text-slate-400">
                                            {t('admin.customize.widgets.emptySidebar', 'No widgets in this sidebar yet.')}
                                        </p>
                                    )}

                                    {list.map((item, index) => {
                                        const key = itemKey(item, index);
                                        const expandKey = `${sidebar.key}-${key}`;

                                        return (
                                            <SortableCard
                                                key={key}
                                                item={item}
                                                sortableKey={key}
                                                theme={theme}
                                                expanded={!!expanded[expandKey]}
                                                onToggle={() =>
                                                    setExpanded((prev) => ({
                                                        ...prev,
                                                        [expandKey]: !prev[expandKey],
                                                    }))
                                                }
                                                onRemove={() => {
                                                    const next = [...list];
                                                    next.splice(index, 1);
                                                    setSidebarItems(sidebar.key, next);
                                                }}
                                                onChange={(patch) => handleChange(sidebar.key, index, patch)}
                                            />
                                        );
                                    })}
                                </div>
                            </SortableContext>
                        </DndContext>
                    </div>
                );
            })}
        </div>
    );
}

interface SortableCardProps {
    item: SidebarWidgetItem;
    sortableKey: string;
    expanded: boolean;
    theme: string | null;
    onToggle: () => void;
    onRemove: () => void;
    onChange: (patch: { label?: string; data?: Record<string, unknown> }) => void;
}

function SortableCard({
    item,
    sortableKey,
    expanded,
    theme,
    onToggle,
    onRemove,
    onChange,
}: SortableCardProps) {
    const { t } = useTranslation();
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: sortableKey,
    });

    return (
        <div
            ref={setNodeRef}
            style={{ transform: CSS.Transform.toString(transform), transition }}
            className={`rounded-xl border border-slate-200 bg-white dark:border-white/[0.08] dark:bg-slate-900 ${
                isDragging ? 'opacity-60' : ''
            }`}
        >
            <div className="flex items-center justify-between gap-2 p-3">
                <button
                    type="button"
                    className="flex flex-1 cursor-grab select-none items-center gap-2 truncate text-left"
                    {...attributes}
                    {...listeners}
                >
                    <GripVertical className="h-4 w-4 shrink-0 text-slate-400" />
                    <span className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                        {item.label}
                    </span>
                </button>

                <div className="flex items-center gap-1" onPointerDown={(event) => event.stopPropagation()}>
                    <button
                        type="button"
                        onClick={onToggle}
                        aria-label={t('admin.widgets.toggle', 'Toggle settings')}
                        className="p-1.5 text-slate-400 transition-colors hover:text-indigo-600"
                    >
                        <ChevronDown
                            className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
                        />
                    </button>
                    <button
                        type="button"
                        onClick={onRemove}
                        aria-label={t('admin.widgets.remove', 'Remove')}
                        className="p-1.5 text-rose-400 transition-colors hover:text-rose-600"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {expanded && (
                <div className="space-y-4 border-t border-slate-200 p-4 dark:border-white/[0.08]">
                    <WidgetFormRenderer
                        theme={theme}
                        widget={item.widget}
                        label={item.label}
                        data={item.data}
                        onChange={onChange}
                    />
                </div>
            )}
        </div>
    );
}
