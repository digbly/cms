import { useState, type FormEvent } from 'react';
import { router, usePage } from '@inertiajs/react';
import { Check, MessageSquare, Search, ShieldAlert, Trash2, X } from 'lucide-react';
import AdminLayout from '@modules/admin/resources/views/layouts/AdminLayout';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import ErrorAlert from '@/components/ui/ErrorAlert';
import Input from '@/components/ui/Input';
import PageHeader from '@/components/ui/PageHeader';
import Pagination from '@/components/ui/Pagination';
import Select from '@/components/ui/Select';
import TableCard from '@/components/ui/TableCard';
import { route } from '@/lib/route';
import { useTranslation } from '@/hooks/useTranslation';
import type { SharedProps } from '@/types';
import ConfirmDialog from '../components/ConfirmDialog';
import type { AdminComment, BlogAbilities, CommentStatus, Paginated } from '../types';

interface CommentsProps {
    title: string;
    comments: Paginated<AdminComment>;
    filters: { search: string | null; status: string | null };
    abilities: BlogAbilities;
}

const statusVariant = (status: CommentStatus) => {
    switch (status) {
        case 'approved':
            return 'emerald' as const;
        case 'pending':
            return 'amber' as const;
        case 'spam':
            return 'rose' as const;
        default:
            return 'slate' as const;
    }
};

export default function Comments({ title, comments, filters, abilities }: CommentsProps) {
    const { t } = useTranslation();
    const { locale } = usePage<SharedProps>().props;

    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    const [deleteTarget, setDeleteTarget] = useState<AdminComment | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const indexUrl = route('admin.blog.comments.index');

    const applyFilters = (overrides: Record<string, string | null> = {}) => {
        const params: Record<string, string> = {};
        const merged = { search, status, ...overrides };

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

    const formatDate = (value?: string | null): string =>
        value
            ? new Date(value).toLocaleDateString(locale, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
              })
            : '—';

    const changeStatus = (comment: AdminComment, nextStatus: CommentStatus) => {
        setError(null);

        router.put(
            route('admin.blog.comments.update', { comment: comment.id }),
            { status: nextStatus },
            { preserveScroll: true, onError: () => setError(t('blog.comments.errors.updateFailed', 'Failed to update the comment.')) }
        );
    };

    const confirmDelete = () => {
        if (!deleteTarget) {
            return;
        }

        setError(null);
        setDeleting(true);

        router.delete(route('admin.blog.comments.destroy', { comment: deleteTarget.id }), {
            preserveScroll: true,
            onError: () => setError(t('blog.comments.errors.deleteFailed', 'Failed to delete the comment.')),
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
                description={t('blog.comments.subtitle', 'Moderate the conversation on your posts.')}
            />

            {error && (
                <div className="mb-4">
                    <ErrorAlert message={error} />
                </div>
            )}

            <form onSubmit={onSearch} className="mb-4 flex flex-wrap items-center gap-3">
                <div className="min-w-[200px] flex-1">
                    <Input
                        placeholder={t('blog.comments.searchPlaceholder', 'Search comments')}
                        leftIcon={<Search className="h-4 w-4" />}
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                    />
                </div>

                <div className="w-full sm:w-48">
                    <Select
                        value={status}
                        onChange={(event) => {
                            setStatus(event.target.value);
                            applyFilters({ status: event.target.value });
                        }}
                    >
                        <option value="">{t('blog.comments.filters.allStatuses', 'All statuses')}</option>
                        <option value="pending">{t('blog.comments.filters.pending', 'Pending')}</option>
                        <option value="approved">{t('blog.comments.filters.approved', 'Approved')}</option>
                        <option value="spam">{t('blog.comments.filters.spam', 'Spam')}</option>
                        <option value="rejected">{t('blog.comments.filters.rejected', 'Rejected')}</option>
                    </Select>
                </div>

                <Button type="submit" variant="secondary">
                    {t('blog.comments.filters.search', 'Search')}
                </Button>
            </form>

            <TableCard
                head={
                    <tr>
                        <th className="px-6 py-3 font-semibold">{t('blog.comments.table.author', 'Author')}</th>
                        <th className="px-6 py-3 font-semibold">{t('blog.comments.table.comment', 'Comment')}</th>
                        <th className="px-6 py-3 font-semibold">{t('blog.comments.table.status', 'Status')}</th>
                        <th className="px-6 py-3 font-semibold">{t('blog.comments.table.created', 'Created')}</th>
                        <th className="px-6 py-3 text-right font-semibold">
                            {t('blog.comments.table.actions', 'Actions')}
                        </th>
                    </tr>
                }
                footer={
                    comments.meta.last_page > 1 ? (
                        <Pagination
                            meta={comments.meta}
                            onPageChange={(page) => applyFilters({ page: String(page) })}
                        />
                    ) : undefined
                }
            >
                {comments.data.length === 0 && (
                    <tr>
                        <td colSpan={5}>
                            <EmptyState
                                icon={MessageSquare}
                                title={t('blog.comments.empty', 'No comments match your filters.')}
                                description={t('blog.comments.emptyHint', 'New comments will appear here for moderation.')}
                            />
                        </td>
                    </tr>
                )}

                {comments.data.map((comment) => (
                    <tr key={comment.id} className="transition-colors hover:bg-slate-50/70 dark:hover:bg-white/[0.02]">
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                            {comment.name || '—'}
                        </td>
                        <td className="px-6 py-4">
                            <p className="line-clamp-2 max-w-md text-sm text-slate-600 dark:text-slate-300">
                                {comment.content}
                            </p>
                        </td>
                        <td className="px-6 py-4">
                            <Badge variant={statusVariant(comment.status)} size="sm" dot>
                                {comment.status_label}
                            </Badge>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-xs text-slate-500 dark:text-slate-400">
                            {formatDate(comment.created_at)}
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-1">
                                {abilities.update && comment.status !== 'approved' && (
                                    <button
                                        type="button"
                                        title={t('blog.comments.actions.approve', 'Approve')}
                                        onClick={() => changeStatus(comment, 'approved')}
                                        className="rounded-lg p-2 text-emerald-500 transition-colors hover:bg-emerald-500/10 hover:text-emerald-600 dark:text-emerald-400"
                                    >
                                        <Check className="h-4 w-4" />
                                    </button>
                                )}

                                {abilities.update && comment.status !== 'rejected' && (
                                    <button
                                        type="button"
                                        title={t('blog.comments.actions.reject', 'Reject')}
                                        onClick={() => changeStatus(comment, 'rejected')}
                                        className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-500/10 hover:text-slate-700 dark:text-slate-400"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}

                                {abilities.update && comment.status !== 'spam' && (
                                    <button
                                        type="button"
                                        title={t('blog.comments.actions.spam', 'Mark as spam')}
                                        onClick={() => changeStatus(comment, 'spam')}
                                        className="rounded-lg p-2 text-amber-500 transition-colors hover:bg-amber-500/10 hover:text-amber-600 dark:text-amber-400"
                                    >
                                        <ShieldAlert className="h-4 w-4" />
                                    </button>
                                )}

                                {abilities.delete && (
                                    <button
                                        type="button"
                                        title={t('blog.comments.actions.delete', 'Delete comment')}
                                        onClick={() => setDeleteTarget(comment)}
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
                title={t('blog.comments.deleteDialog.title', 'Delete comment')}
                description={t(
                    'blog.comments.deleteDialog.description',
                    'Are you sure you want to delete this comment? This cannot be undone.'
                )}
                confirmLabel={t('blog.comments.deleteDialog.confirm', 'Delete')}
                cancelLabel={t('blog.comments.deleteDialog.cancel', 'Cancel')}
                isLoading={deleting}
                variant="danger"
                onConfirm={confirmDelete}
                onClose={() => setDeleteTarget(null)}
            />
        </AdminLayout>
    );
}
