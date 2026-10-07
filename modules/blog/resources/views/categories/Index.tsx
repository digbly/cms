import { useState, type FormEvent } from 'react';
import { Link, router } from '@inertiajs/react';
import { FolderTree, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import AdminLayout from '@modules/admin/resources/views/layouts/AdminLayout';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import ErrorAlert from '@/components/ui/ErrorAlert';
import Input from '@/components/ui/Input';
import PageHeader from '@/components/ui/PageHeader';
import Pagination from '@/components/ui/Pagination';
import TableCard from '@/components/ui/TableCard';
import { route } from '@/lib/route';
import { useTranslation } from '@/hooks/useTranslation';
import ConfirmDialog from '../components/ConfirmDialog';
import type { AdminCategory, BlogAbilities, Paginated } from '../types';

interface CategoriesProps {
    title: string;
    categories: Paginated<AdminCategory>;
    filters: { search: string | null };
    abilities: BlogAbilities;
}

export default function Categories({ title, categories, filters, abilities }: CategoriesProps) {
    const { t } = useTranslation();

    const [search, setSearch] = useState(filters.search ?? '');
    const [deleteTarget, setDeleteTarget] = useState<AdminCategory | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const indexUrl = route('admin.blog.categories.index');

    const applyFilters = (overrides: Record<string, string | null> = {}) => {
        const params: Record<string, string> = {};
        const merged = { search, ...overrides };

        Object.entries(merged).forEach(([key, value]) => {
            if (value) {
                params[key] = value;
            }
        });

        router.get(indexUrl, params, { preserveState: true, replace: true });
    };

    const onSearch = (event: FormEvent) => {
        event.preventDefault();
        applyFilters({ search });
    };

    const confirmDelete = () => {
        if (!deleteTarget) {
            return;
        }

        setError(null);
        setDeleting(true);

        router.delete(route('admin.blog.categories.destroy', { category: deleteTarget.id }), {
            preserveScroll: true,
            onError: () => setError(t('blog.categories.errors.deleteFailed', 'Failed to delete the category.')),
            onFinish: () => {
                setDeleting(false);
                setDeleteTarget(null);
            },
        });
    };

    return (
        <AdminLayout title={title}>
            <PageHeader
                title={title}
                description={t('blog.categories.subtitle', 'Group your posts into navigable categories.')}
                actions={
                    abilities.create && (
                        <Link href={route('admin.blog.categories.create')}>
                            <Button leftIcon={<Plus className="h-4 w-4" />}>
                                {t('blog.categories.add', 'Add category')}
                            </Button>
                        </Link>
                    )
                }
            />

            {error && (
                <div className="mb-4">
                    <ErrorAlert message={error} />
                </div>
            )}

            <form onSubmit={onSearch} className="mb-4 flex flex-wrap items-center gap-3">
                <div className="min-w-[200px] flex-1">
                    <Input
                        placeholder={t('blog.categories.searchPlaceholder', 'Search categories')}
                        leftIcon={<Search className="h-4 w-4" />}
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                    />
                </div>

                <Button type="submit" variant="secondary">
                    {t('blog.categories.filters.search', 'Search')}
                </Button>
            </form>

            <TableCard
                head={
                    <tr>
                        <th className="px-6 py-3 font-semibold">{t('blog.categories.table.name', 'Name')}</th>
                        <th className="px-6 py-3 font-semibold">{t('blog.categories.table.slug', 'Slug')}</th>
                        <th className="px-6 py-3 font-semibold">{t('blog.categories.table.posts', 'Posts')}</th>
                        <th className="px-6 py-3 font-semibold">{t('blog.categories.table.home', 'Home')}</th>
                        <th className="px-6 py-3 text-right font-semibold">
                            {t('blog.categories.table.actions', 'Actions')}
                        </th>
                    </tr>
                }
                footer={
                    categories.meta.last_page > 1 ? (
                        <Pagination
                            meta={categories.meta}
                            onPageChange={(page) => applyFilters({ page: String(page) })}
                        />
                    ) : undefined
                }
            >
                {categories.data.length === 0 && (
                    <tr>
                        <td colSpan={5}>
                            <EmptyState
                                icon={FolderTree}
                                title={t('blog.categories.empty', 'No categories yet.')}
                                description={t('blog.categories.emptyHint', 'Create your first category to organise posts.')}
                            />
                        </td>
                    </tr>
                )}

                {categories.data.map((category) => (
                    <tr key={category.id} className="transition-colors hover:bg-slate-50/70 dark:hover:bg-white/[0.02]">
                        <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                            {category.name ?? '—'}
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">
                            {category.slug ?? '—'}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                            {category.posts_count ?? 0}
                        </td>
                        <td className="px-6 py-4">
                            <Badge variant={category.is_home ? 'emerald' : 'slate'} size="sm">
                                {category.is_home
                                    ? t('blog.categories.homeYes', 'Yes')
                                    : t('blog.categories.homeNo', 'No')}
                            </Badge>
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-1">
                                {abilities.update && (
                                    <Link
                                        href={route('admin.blog.categories.edit', {
                                            category: category.id,
                                        })}
                                        title={t('blog.categories.actions.edit', 'Edit category')}
                                        className="rounded-lg p-2 text-indigo-500 transition-colors hover:bg-indigo-500/10 hover:text-indigo-600 dark:text-indigo-400"
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Link>
                                )}

                                {abilities.delete && (
                                    <button
                                        type="button"
                                        title={t('blog.categories.actions.delete', 'Delete category')}
                                        onClick={() => setDeleteTarget(category)}
                                        className="rounded-lg p-2 text-rose-500 transition-colors hover:bg-rose-500/10 hover:text-rose-600 dark:text-rose-400"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        </td>
                    </tr>
                ))}
            </TableCard>

            <ConfirmDialog
                isOpen={deleteTarget !== null}
                title={t('blog.categories.deleteDialog.title', 'Delete category')}
                description={t(
                    'blog.categories.deleteDialog.description',
                    'Are you sure you want to delete "{{name}}"? Posts will not be deleted.'
                ).replace('{{name}}', deleteTarget?.name ?? '')}
                confirmLabel={t('blog.categories.deleteDialog.confirm', 'Delete')}
                cancelLabel={t('blog.categories.deleteDialog.cancel', 'Cancel')}
                isLoading={deleting}
                variant="danger"
                onConfirm={confirmDelete}
                onClose={() => setDeleteTarget(null)}
            />
        </AdminLayout>
    );
}
