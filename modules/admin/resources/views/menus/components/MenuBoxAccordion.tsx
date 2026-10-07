import { useEffect, useState } from 'react';
import axios from 'axios';
import { ChevronDown, Loader2, Plus, Search } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useTranslation } from '@/hooks/useTranslation';
import { route } from '@/lib/route';
import type { MenuBox, MenuBoxItem, MenuItem } from '../types';

interface MenuBoxAccordionProps {
    box: MenuBox;
    onAddItems: (items: MenuItem[]) => void;
}

let tempCounter = 0;

const makeTempId = (): string => `new-${Date.now()}-${(tempCounter += 1)}`;

export default function MenuBoxAccordion({ box, onAddItems }: MenuBoxAccordionProps) {
    const { t } = useTranslation();

    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'latest' | 'search'>('latest');
    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [items, setItems] = useState<MenuBoxItem[]>([]);
    const [isFetching, setIsFetching] = useState(false);

    useEffect(() => {
        const handle = window.setTimeout(() => setSearch(searchInput.trim()), 400);

        return () => window.clearTimeout(handle);
    }, [searchInput]);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        let cancelled = false;
        setIsFetching(true);

        axios
            .get(
                route('admin.menus.box-items', {
                    box: box.key,
                    q: activeTab === 'search' ? search || undefined : undefined,
                })
            )
            .then((response) => {
                if (!cancelled) {
                    setItems(response.data?.results ?? []);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setItems([]);
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setIsFetching(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [isOpen, activeTab, search, box.key]);

    const switchTab = (tab: 'latest' | 'search') => {
        setActiveTab(tab);
        setSelectedIds([]);
    };

    const toggleSelected = (id: string, checked: boolean) => {
        setSelectedIds((previous) =>
            checked ? [...previous, id] : previous.filter((value) => value !== id)
        );
    };

    const allSelected = items.length > 0 && selectedIds.length === items.length;

    const handleAdd = () => {
        const selected = items.filter((item) => selectedIds.includes(String(item.id)));

        if (selected.length === 0) {
            return;
        }

        onAddItems(
            selected.map((item) => ({
                id: makeTempId(),
                label: item.text,
                link: '',
                target: '_self',
                is_custom: false,
                box_key: box.key,
                menuable_id: String(item.id),
                menuable_type: item.menuable_class ?? null,
                menuable_class_name: item.menuable_class_name ?? null,
                children: [],
            }))
        );

        setSelectedIds([]);
    };

    return (
        <div className="mb-4 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-white/[0.07] dark:bg-slate-900">
            <button
                type="button"
                onClick={() => setIsOpen((value) => !value)}
                className="flex w-full items-center justify-between bg-slate-50/60 px-4 py-3 transition-colors hover:bg-slate-100 dark:bg-white/[0.02] dark:hover:bg-white/[0.04]"
            >
                <span className="font-medium text-slate-700 dark:text-slate-200">{box.label}</span>
                <ChevronDown
                    className={`h-5 w-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {isOpen && (
                <div className="border-t border-slate-100 p-4 dark:border-white/[0.06]">
                    <div className="mb-4 flex gap-4 border-b border-slate-100 dark:border-white/[0.06]">
                        {(['latest', 'search'] as const).map((tab) => (
                            <button
                                key={tab}
                                type="button"
                                onClick={() => switchTab(tab)}
                                className={`border-b-2 pb-2 text-sm font-medium transition-colors ${
                                    activeTab === tab
                                        ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                                        : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                                }`}
                            >
                                {tab === 'latest'
                                    ? t('admin.menus.boxes.latest', 'Latest')
                                    : t('admin.menus.boxes.search', 'Search')}
                            </button>
                        ))}
                    </div>

                    {activeTab === 'search' && (
                        <div className="mb-4">
                            <Input
                                value={searchInput}
                                onChange={(event) => setSearchInput(event.target.value)}
                                placeholder={t('admin.menus.boxes.searchPlaceholder', 'Search...')}
                                leftIcon={<Search className="h-4 w-4" />}
                            />
                        </div>
                    )}

                    <div className="mb-4 max-h-60 space-y-2 overflow-y-auto">
                        {isFetching ? (
                            <div className="flex items-center justify-center gap-2 py-4 text-sm text-slate-500 dark:text-slate-400">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>{t('admin.menus.boxes.loading', 'Loading...')}</span>
                            </div>
                        ) : items.length > 0 ? (
                            items.map((item) => (
                                <label
                                    key={item.id}
                                    className="flex cursor-pointer items-center gap-3 rounded-lg px-1 py-1.5 transition-colors hover:bg-slate-50 dark:hover:bg-white/[0.03]"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.includes(String(item.id))}
                                        onChange={(event) => toggleSelected(String(item.id), event.target.checked)}
                                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span className="text-sm text-slate-700 dark:text-slate-200">{item.text}</span>
                                </label>
                            ))
                        ) : (
                            <div className="py-4 text-center text-sm text-slate-500 dark:text-slate-400">
                                {t('admin.menus.boxes.empty', 'No items found.')}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 pt-4 dark:border-white/[0.06]">
                        <label className="flex cursor-pointer items-center gap-2">
                            <input
                                type="checkbox"
                                checked={allSelected}
                                onChange={(event) =>
                                    setSelectedIds(event.target.checked ? items.map((item) => String(item.id)) : [])
                                }
                                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="text-sm text-slate-600 dark:text-slate-400">
                                {t('admin.menus.boxes.selectAll', 'Select all')}
                            </span>
                        </label>

                        <Button
                            type="button"
                            size="sm"
                            onClick={handleAdd}
                            disabled={selectedIds.length === 0}
                            leftIcon={<Plus className="h-4 w-4" />}
                        >
                            {t('admin.menus.boxes.addToMenu', 'Add to menu')}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
