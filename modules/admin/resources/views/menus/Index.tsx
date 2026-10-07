import { useEffect, useState, type FormEvent } from 'react';
import { router, usePage } from '@inertiajs/react';
import { Menu as MenuIcon, Plus, Save, Trash2 } from 'lucide-react';
import AdminLayout from '@modules/admin/resources/views/layouts/AdminLayout';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Checkbox from '@/components/ui/Checkbox';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import PageHeader from '@/components/ui/PageHeader';
import Select from '@/components/ui/Select';
import { useTranslation } from '@/hooks/useTranslation';
import { route } from '@/lib/route';
import type { SharedProps } from '@/types';
import CustomLinkBox from './components/CustomLinkBox';
import MenuBoxAccordion from './components/MenuBoxAccordion';
import MenuBuilder from './components/MenuBuilder';
import type { AdminMenu, MenuBox, MenuItem, MenuLocations } from './types';

interface MenusProps {
    title: string;
    menus: AdminMenu[];
    boxes: MenuBox[];
    locations: MenuLocations;
    abilities: { create: boolean; update: boolean; delete: boolean };
    selectedMenuId: string | null;
}

const isTempId = (id: string): boolean => id.startsWith('new-');

const serializeItems = (items: MenuItem[]): unknown[] =>
    items.map((item) => {
        const payload: Record<string, unknown> = {
            label: item.label,
            target: item.target ?? '_self',
            children: serializeItems(item.children ?? []),
        };

        if (!isTempId(item.id)) {
            payload.id = item.id;
        }

        if (item.is_custom) {
            payload.is_custom = 1;
            payload.link = item.link ?? '';
        } else {
            payload.key = item.box_key;
            payload.menuable_id = item.menuable_id;
        }

        return payload;
    });

const resolveSelectedLocations = (menuId: string, locations: MenuLocations): string[] =>
    Object.entries(locations.selected ?? {})
        .filter(([, assignedMenuId]) => assignedMenuId === menuId)
        .map(([location]) => location);

export default function Menus({ title, menus, boxes, locations, abilities, selectedMenuId }: MenusProps) {
    const { t } = useTranslation();
    const { locale, errors } = usePage<SharedProps>().props;

    const [selectedId, setSelectedId] = useState<string | null>(
        selectedMenuId ?? menus[0]?.id ?? null
    );
    const [isCreating, setIsCreating] = useState(false);
    const [newName, setNewName] = useState('');
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [name, setName] = useState('');
    const [items, setItems] = useState<MenuItem[]>([]);
    const [selectedLocations, setSelectedLocations] = useState<string[]>([]);

    const activeMenu = menus.find((menu) => menu.id === selectedId) ?? null;

    useEffect(() => {
        if (selectedMenuId) {
            setSelectedId(selectedMenuId);
        }
    }, [selectedMenuId]);

    useEffect(() => {
        if (selectedId && !menus.some((menu) => menu.id === selectedId)) {
            setSelectedId(menus[0]?.id ?? null);
        }
    }, [menus, selectedId]);

    useEffect(() => {
        if (!activeMenu) {
            return;
        }

        setName(activeMenu.name);
        setItems(activeMenu.items ?? []);
        setSelectedLocations(resolveSelectedLocations(activeMenu.id, locations));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeMenu?.id]);

    const handleCreate = (event: FormEvent) => {
        event.preventDefault();

        if (!newName.trim()) {
            return;
        }

        router.post(
            route('admin.menus.store'),
            { name: newName.trim() },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setNewName('');
                    setIsCreating(false);
                },
            }
        );
    };

    const handleSave = () => {
        if (!activeMenu) {
            return;
        }

        setIsSaving(true);
        router.put(
            route('admin.menus.update', { menu: activeMenu.id }),
            {
                name,
                content: JSON.stringify(serializeItems(items)),
                locale,
                location: selectedLocations,
            },
            {
                preserveScroll: true,
                onFinish: () => setIsSaving(false),
            }
        );
    };

    const handleDelete = () => {
        if (!activeMenu) {
            return;
        }

        router.delete(route('admin.menus.destroy', { menu: activeMenu.id }), {
            preserveScroll: true,
            onFinish: () => setConfirmDelete(false),
        });
    };

    const toggleLocation = (key: string) => {
        setSelectedLocations((previous) =>
            previous.includes(key) ? previous.filter((value) => value !== key) : [...previous, key]
        );
    };

    return (
        <AdminLayout title={title}>
            <PageHeader
                title={title}
                description={t('admin.menus.subtitle', 'Build the navigation menus used across your website.')}
                actions={
                    abilities.create && (
                        <Button
                            onClick={() => setIsCreating((value) => !value)}
                            leftIcon={<Plus className="h-4 w-4" />}
                        >
                            {t('admin.menus.createNew', 'Create new menu')}
                        </Button>
                    )
                }
            />

            <Card className="mb-6">
                <div className="flex flex-wrap items-center gap-4 p-4">
                    {menus.length > 0 ? (
                        <>
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                {t('admin.menus.selectMenu', 'Select a menu to edit:')}
                            </span>
                            <div className="min-w-[200px] max-w-sm flex-1">
                                <Select
                                    value={selectedId ?? ''}
                                    onChange={(event) => setSelectedId(event.target.value)}
                                    aria-label={t('admin.menus.selectMenu', 'Select a menu to edit:')}
                                >
                                    {menus.map((menu) => (
                                        <option key={menu.id} value={menu.id}>
                                            {menu.name}
                                        </option>
                                    ))}
                                </Select>
                            </div>
                            <span className="text-sm text-slate-500">{t('admin.menus.or', 'or')}</span>
                            {abilities.create && (
                                <button
                                    type="button"
                                    onClick={() => setIsCreating((value) => !value)}
                                    className="text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-500"
                                >
                                    {t('admin.menus.createNew', 'Create new menu')}
                                </button>
                            )}
                        </>
                    ) : (
                        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                            <MenuIcon className="h-4 w-4" />
                            <span>{t('admin.menus.empty', 'No menus yet. Create your first menu to get started.')}</span>
                        </div>
                    )}
                </div>
            </Card>

            {isCreating && (
                <Card className="mb-6">
                    <form onSubmit={handleCreate} className="flex flex-wrap items-end gap-4 p-4">
                        <div className="min-w-[220px] flex-1">
                            <Input
                                id="menu-create-name"
                                label={t('admin.menus.name', 'Menu name')}
                                value={newName}
                                onChange={(event) => setNewName(event.target.value)}
                                placeholder={t('admin.menus.namePlaceholder', 'Main menu')}
                                error={errors?.name}
                            />
                        </div>
                        <Button type="submit" leftIcon={<Plus className="h-4 w-4" />}>
                            {t('admin.menus.addMenu', 'Add menu')}
                        </Button>
                    </form>
                </Card>
            )}

            {activeMenu && (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-1">
                        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                            {t('admin.menus.addItems', 'Add menu items')}
                        </h3>

                        {boxes.map((box) => (
                            <MenuBoxAccordion
                                key={box.key}
                                box={box}
                                onAddItems={(newItems) => setItems((previous) => [...previous, ...newItems])}
                            />
                        ))}

                        <CustomLinkBox
                            onAddItems={(newItems) => setItems((previous) => [...previous, ...newItems])}
                        />
                    </div>

                    <div className="lg:col-span-2">
                        <Card>
                            <div className="flex flex-wrap items-end gap-4 p-4">
                                <div className="min-w-[220px] flex-1">
                                    <Input
                                        id="menu-editor-name"
                                        label={t('admin.menus.name', 'Menu name')}
                                        value={name}
                                        onChange={(event) => setName(event.target.value)}
                                        error={errors?.name}
                                    />
                                </div>
                                {abilities.update && (
                                    <Button
                                        onClick={handleSave}
                                        isLoading={isSaving}
                                        leftIcon={<Save className="h-4 w-4" />}
                                    >
                                        {t('admin.menus.save', 'Save menu')}
                                    </Button>
                                )}
                            </div>

                            <div className="border-t border-slate-200 px-4 py-3 text-sm font-semibold dark:border-white/10">
                                {t('admin.menus.structure', 'Menu structure')}
                            </div>

                            <div className="border-t border-slate-100 bg-slate-50/50 p-4 dark:border-white/10 dark:bg-white/[0.01]">
                                <MenuBuilder items={items} onChange={setItems} />
                            </div>

                            {locations.data.length > 0 && (
                                <>
                                    <div className="border-t border-slate-200 px-4 py-3 text-sm font-semibold dark:border-white/10">
                                        {t('admin.menus.settings', 'Menu settings')}
                                    </div>
                                    <div className="space-y-2 border-t border-slate-100 p-4 dark:border-white/10">
                                        {locations.data.map((location) => (
                                            <Checkbox
                                                key={location.key}
                                                checked={selectedLocations.includes(location.key)}
                                                onChange={() => toggleLocation(location.key)}
                                                label={location.label}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}

                            <div className="flex items-center justify-between border-t border-slate-200 p-4 dark:border-white/10">
                                {abilities.delete ? (
                                    <Button
                                        variant="ghost"
                                        onClick={() => setConfirmDelete(true)}
                                        leftIcon={<Trash2 className="h-4 w-4" />}
                                        className="text-rose-600 hover:bg-rose-500/10 hover:text-rose-500"
                                    >
                                        {t('admin.menus.delete', 'Delete menu')}
                                    </Button>
                                ) : (
                                    <span />
                                )}

                                {abilities.update && (
                                    <Button
                                        onClick={handleSave}
                                        isLoading={isSaving}
                                        leftIcon={<Save className="h-4 w-4" />}
                                    >
                                        {t('admin.menus.save', 'Save menu')}
                                    </Button>
                                )}
                            </div>
                        </Card>
                    </div>
                </div>
            )}

            <Modal
                open={confirmDelete}
                title={t('admin.menus.deleteDialog.title', 'Delete menu')}
                onClose={() => setConfirmDelete(false)}
            >
                <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">
                    {t(
                        'admin.menus.deleteDialog.description',
                        'Are you sure you want to delete "{{name}}"? This cannot be undone.'
                    ).replace('{{name}}', name)}
                </p>
                <div className="flex justify-end gap-3">
                    <Button variant="secondary" onClick={() => setConfirmDelete(false)}>
                        {t('admin.menus.deleteDialog.cancel', 'Cancel')}
                    </Button>
                    <Button variant="danger" onClick={handleDelete}>
                        {t('admin.menus.deleteDialog.confirm', 'Delete')}
                    </Button>
                </div>
            </Modal>
        </AdminLayout>
    );
}
