import { useState } from 'react';
import { router } from '@inertiajs/react';
import { ChevronDown, GripVertical, Save, X } from 'lucide-react';
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
import Button from '@/components/ui/Button';
import { useTranslation } from '@/hooks/useTranslation';
import { route } from '@/lib/route';
import WidgetFormRenderer from './FormRenderer';
import type { SidebarDefinition, SidebarWidgetItem, WidgetDefinition } from '../types';

interface WidgetFormChange {
    label?: string;
    data?: Record<string, unknown>;
}

const generateTempKey = (): string =>
    `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

const sortableId = (item: SidebarWidgetItem, index: number): string =>
    item._tempKey ?? item.id ?? String(index);

const buildItems = (
    sidebarWidgets: Record<string, SidebarWidgetItem[]>
): Record<string, SidebarWidgetItem[]> => {
    const result: Record<string, SidebarWidgetItem[]> = {};

    Object.entries(sidebarWidgets ?? {}).forEach(([sidebarKey, items]) => {
        result[sidebarKey] = items.map((item) => ({
            ...item,
            data: item.data ?? {},
            _tempKey: generateTempKey(),
        }));
    });

    return result;
};

interface SortableWidgetCardProps {
    item: SidebarWidgetItem;
    index: number;
    theme: string | null;
    expanded: boolean;
    onToggle: () => void;
    onRemove: () => void;
    onChange: (patch: WidgetFormChange) => void;
}

function SortableWidgetCard({
    item,
    index,
    theme,
    expanded,
    onToggle,
    onRemove,
    onChange,
}: SortableWidgetCardProps) {
    const { t } = useTranslation();
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: sortableId(item, index),
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
                    <span className="truncate font-medium text-slate-900 dark:text-slate-100">
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

                    <div className="flex justify-end border-t border-slate-100 pt-3 dark:border-white/[0.06]">
                        <button
                            type="button"
                            onClick={onRemove}
                            className="inline-flex items-center gap-1 text-sm font-medium text-rose-600 transition-colors hover:text-rose-500"
                        >
                            <X className="h-4 w-4" />
                            {t('admin.widgets.remove', 'Remove')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

interface WidgetsEditorProps {
    widgets: WidgetDefinition[];
    sidebars: SidebarDefinition[];
    sidebarWidgets: Record<string, SidebarWidgetItem[]>;
    theme: string | null;
    locale: string;
    canUpdate: boolean;
}

export default function WidgetsEditor({
    widgets,
    sidebars,
    sidebarWidgets,
    theme,
    locale,
    canUpdate,
}: WidgetsEditorProps) {
    const { t } = useTranslation();

    const [sidebarItems, setSidebarItems] = useState<Record<string, SidebarWidgetItem[]>>(() =>
        buildItems(sidebarWidgets)
    );
    const [openWidget, setOpenWidget] = useState<string | null>(null);
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});
    const [processing, setProcessing] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const itemsFor = (sidebarKey: string): SidebarWidgetItem[] => sidebarItems[sidebarKey] ?? [];

    const handleAdd = (widget: WidgetDefinition, sidebarKey: string): void => {
        setSidebarItems((previous) => ({
            ...previous,
            [sidebarKey]: [
                ...(previous[sidebarKey] ?? []),
                {
                    id: '',
                    widget: widget.key,
                    label: widget.label,
                    data: {},
                    _tempKey: generateTempKey(),
                },
            ],
        }));
        setOpenWidget(null);
    };

    const handleRemove = (sidebarKey: string, indexToRemove: number): void => {
        setSidebarItems((previous) => {
            const current = [...(previous[sidebarKey] ?? [])];
            current.splice(indexToRemove, 1);

            return { ...previous, [sidebarKey]: current };
        });
    };

    const handleChange = (
        sidebarKey: string,
        indexToChange: number,
        patch: WidgetFormChange
    ): void => {
        setSidebarItems((previous) => {
            const current = [...(previous[sidebarKey] ?? [])];
            const target = current[indexToChange];

            if (!target) {
                return previous;
            }

            current[indexToChange] = {
                ...target,
                label: patch.label ?? target.label,
                data: patch.data ?? target.data,
            };

            return { ...previous, [sidebarKey]: current };
        });
    };

    const handleDragEnd = (event: DragEndEvent, sidebarKey: string): void => {
        const { active, over } = event;

        if (!over || active.id === over.id) {
            return;
        }

        setSidebarItems((previous) => {
            const current = previous[sidebarKey] ?? [];
            const oldIndex = current.findIndex((item, i) => sortableId(item, i) === active.id);
            const newIndex = current.findIndex((item, i) => sortableId(item, i) === over.id);

            if (oldIndex === -1 || newIndex === -1) {
                return previous;
            }

            return { ...previous, [sidebarKey]: arrayMove(current, oldIndex, newIndex) };
        });
    };

    const handleSave = (sidebar: SidebarDefinition): void => {
        setProcessing(sidebar.key);

        const payload = {
            locale,
            content: itemsFor(sidebar.key).map((item) => ({
                ...(item.id ? { id: item.id } : {}),
                widget: item.widget,
                label: item.label,
                data: item.data,
            })),
        };

        router.put(
            route('admin.widgets.update', { sidebar: sidebar.key }),
            // Widget settings are plain JSON; the server validates the shape.
            payload as unknown as Parameters<typeof router.put>[1],
            {
                preserveScroll: true,
                onFinish: () => setProcessing(null),
            }
        );
    };

    const card = 'rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-slate-900';

    return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-1">
                <div className={card}>
                    <div className="border-b border-slate-200 px-4 py-3 text-sm font-semibold dark:border-white/10">
                        {t('admin.widgets.availableWidgets', 'Available widgets')}
                    </div>
                    <div className="space-y-3 p-4">
                        {widgets.length === 0 && (
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {t('admin.widgets.noWidgets', 'No widgets are registered for the active theme.')}
                            </p>
                        )}

                        {widgets.map((widget) => {
                            const availableSidebars = sidebars.filter(
                                (sidebar) => widget.only.length === 0 || widget.only.includes(sidebar.key)
                            );

                            return (
                                <div
                                    key={widget.key}
                                    className="overflow-hidden rounded-xl border border-slate-200 dark:border-white/[0.08]"
                                >
                                    <div className="flex items-center justify-between gap-2 bg-slate-50 p-3 dark:bg-white/[0.02]">
                                        <div className="min-w-0">
                                            <h4 className="truncate font-medium text-slate-900 dark:text-slate-100">
                                                {widget.label}
                                            </h4>
                                            {widget.description && (
                                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                                    {widget.description}
                                                </p>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            aria-label={t('admin.widgets.addToSidebar', 'Add to sidebar')}
                                            onClick={() =>
                                                setOpenWidget(openWidget === widget.key ? null : widget.key)
                                            }
                                            className="p-1.5 text-slate-400 transition-colors hover:text-indigo-600"
                                        >
                                            <ChevronDown
                                                className={`h-4 w-4 transition-transform ${
                                                    openWidget === widget.key ? 'rotate-180' : ''
                                                }`}
                                            />
                                        </button>
                                    </div>

                                    {openWidget === widget.key && (
                                        <div className="space-y-2 border-t border-slate-200 p-3 dark:border-white/[0.08]">
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                {t('admin.widgets.addToSidebar', 'Add to sidebar')}
                                            </p>
                                            {availableSidebars.map((sidebar) => (
                                                <button
                                                    key={sidebar.key}
                                                    type="button"
                                                    onClick={() => handleAdd(widget, sidebar.key)}
                                                    className="w-full rounded-lg border border-indigo-100 px-3 py-2 text-left text-sm text-indigo-600 transition-colors hover:bg-indigo-50 dark:border-indigo-500/30 dark:text-indigo-400 dark:hover:bg-indigo-500/10"
                                                >
                                                    {sidebar.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="space-y-6 lg:col-span-2">
                {sidebars.map((sidebar) => {
                    const items = itemsFor(sidebar.key);

                    return (
                        <div key={sidebar.key} className={card}>
                            <div className="border-b border-slate-200 px-4 py-3 dark:border-white/10">
                                <div className="text-sm font-semibold">{sidebar.label}</div>
                                {sidebar.description && (
                                    <div className="text-xs text-slate-500 dark:text-slate-400">
                                        {sidebar.description}
                                    </div>
                                )}
                            </div>

                            <div className="p-4">
                                <DndContext
                                    sensors={sensors}
                                    collisionDetection={closestCenter}
                                    onDragEnd={(event) => handleDragEnd(event, sidebar.key)}
                                >
                                    <SortableContext
                                        items={items.map((item, i) => sortableId(item, i))}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        <div className="mb-4 min-h-[64px] space-y-3 rounded-xl border border-dashed border-slate-300 p-3 dark:border-white/[0.1]">
                                            {items.length === 0 && (
                                                <p className="py-4 text-center text-sm text-slate-500 dark:text-slate-400">
                                                    {t('admin.widgets.noWidgetsInSidebar', 'No widgets in this sidebar yet.')}
                                                </p>
                                            )}

                                            {items.map((item, i) => {
                                                const key = sortableId(item, i);

                                                return (
                                                    <SortableWidgetCard
                                                        key={key}
                                                        item={item}
                                                        index={i}
                                                        theme={theme}
                                                        expanded={!!expanded[`${sidebar.key}-${key}`]}
                                                        onToggle={() =>
                                                            setExpanded((previous) => ({
                                                                ...previous,
                                                                [`${sidebar.key}-${key}`]:
                                                                    !previous[`${sidebar.key}-${key}`],
                                                            }))
                                                        }
                                                        onRemove={() => handleRemove(sidebar.key, i)}
                                                        onChange={(patch) => handleChange(sidebar.key, i, patch)}
                                                    />
                                                );
                                            })}
                                        </div>
                                    </SortableContext>
                                </DndContext>

                                {canUpdate && (
                                    <div className="flex justify-end">
                                        <Button
                                            onClick={() => handleSave(sidebar)}
                                            isLoading={processing === sidebar.key}
                                            leftIcon={<Save className="h-4 w-4" />}
                                        >
                                            {t('admin.widgets.save', 'Save sidebar')}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
