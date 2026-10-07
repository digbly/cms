import { useState, type FormEvent } from 'react';
import { Link, router } from '@inertiajs/react';
import { useForm } from 'react-hook-form';
import { KeyRound, Pencil, Plus, RotateCcw, Send, Trash2, Users as UsersIcon } from 'lucide-react';
import AdminLayout from '@modules/admin/resources/views/layouts/AdminLayout';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import PageHeader from '@/components/ui/PageHeader';
import Pagination from '@/components/ui/Pagination';
import Select from '@/components/ui/Select';
import TableCard from '@/components/ui/TableCard';
import { submitForm } from '@/lib/inertia-form';
import { route } from '@/lib/route';
import { MIN_PASSWORD_LENGTH } from '@/lib/validation';
import { useTranslation } from '@/hooks/useTranslation';

interface UserRow {
    id: string;
    name: string;
    email: string;
    roles: string[];
    is_super_admin: boolean;
    email_verified_at: string | null;
    deleted_at: string | null;
}

interface PaginationMeta {
    current_page: number;
    last_page: number;
    total: number;
}

interface UsersProps {
    title: string;
    users: {
        data: UserRow[];
        meta: PaginationMeta;
    };
    filters: { search: string | null; role: string | null; trashed: string | null };
    roles: string[];
    selfId: string;
    canManageSuperAdmin: boolean;
}

interface ResetPasswordForm {
    password: string;
    password_confirmation: string;
}

const actionButton =
    'rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800';

export default function Users({ title, users, filters, roles }: UsersProps) {
    const { t } = useTranslation();

    const [search, setSearch] = useState(filters.search ?? '');
    const [deleteTarget, setDeleteTarget] = useState<UserRow | null>(null);
    const [resetTarget, setResetTarget] = useState<UserRow | null>(null);

    const indexUrl = route('admin.users.index');

    const applyFilters = (overrides: Record<string, string | null> = {}) => {
        const params: Record<string, string> = {};
        const merged = { search, role: filters.role, trashed: filters.trashed, ...overrides };

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

    const resetForm = useForm<ResetPasswordForm>({
        defaultValues: { password: '', password_confirmation: '' },
    });

    const submitReset = resetForm.handleSubmit((data) => {
        if (!resetTarget) {
            return;
        }

        return submitForm(route('admin.users.password', { user: resetTarget.id }), data, {
            method: 'put',
            setError: resetForm.setError,
            onSuccess: () => {
                resetForm.reset();
                setResetTarget(null);
            },
        });
    });

    const confirmDelete = () => {
        if (!deleteTarget) {
            return;
        }

        router.delete(route('admin.users.destroy', { user: deleteTarget.id }), {
            preserveScroll: true,
            onFinish: () => setDeleteTarget(null),
        });
    };

    return (
        <AdminLayout title={title}>
            <PageHeader
                title={title}
                description={t('admin.users.subtitle', 'Manage accounts, roles and access.')}
                actions={
                    <Link href={route('admin.users.create')}>
                        <Button leftIcon={<Plus className="h-4 w-4" />}>
                            {t('admin.users.addUser', 'Add user')}
                        </Button>
                    </Link>
                }
            />

            <form onSubmit={onSearch} className="mb-4 flex flex-wrap items-center gap-3">
                <div className="min-w-[200px] flex-1">
                    <Input
                        placeholder={t('admin.users.searchPlaceholder', 'Search users...')}
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                    />
                </div>

                <div className="w-full sm:w-48">
                    <Select value={filters.role ?? ''} onChange={(event) => applyFilters({ role: event.target.value })}>
                        <option value="">{t('admin.users.filters.allRoles', 'All roles')}</option>
                        {roles.map((role) => (
                            <option key={role} value={role}>
                                {role}
                            </option>
                        ))}
                    </Select>
                </div>

                <div className="w-full sm:w-48">
                    <Select
                        value={filters.trashed ?? ''}
                        onChange={(event) => applyFilters({ trashed: event.target.value })}
                    >
                        <option value="">{t('admin.users.filters.active', 'Active')}</option>
                        <option value="with">{t('admin.users.filters.withTrashed', 'With trashed')}</option>
                        <option value="only">{t('admin.users.filters.onlyTrashed', 'Trashed only')}</option>
                    </Select>
                </div>

                <Button type="submit" variant="secondary">
                    {t('admin.users.filters.search', 'Search')}
                </Button>
            </form>

            <TableCard
                head={
                    <tr>
                        <th className="px-4 py-3">{t('admin.users.table.name', 'Name')}</th>
                        <th className="px-4 py-3">{t('admin.users.table.roles', 'Roles')}</th>
                        <th className="px-4 py-3">{t('admin.users.table.status', 'Status')}</th>
                        <th className="px-4 py-3 text-right">{t('admin.users.table.actions', 'Actions')}</th>
                    </tr>
                }
                footer={
                    users.meta.last_page > 1 ? (
                        <Pagination
                            meta={users.meta}
                            onPageChange={(page) => applyFilters({ page: String(page) })}
                        />
                    ) : undefined
                }
            >
                {users.data.length === 0 && (
                    <tr>
                        <td colSpan={4}>
                            <EmptyState
                                icon={UsersIcon}
                                title={t('admin.users.empty', 'No users found.')}
                                description={t('admin.users.emptyHint', 'Try adjusting your search or filters.')}
                            />
                        </td>
                    </tr>
                )}

                {users.data.map((user) => (
                    <tr key={user.id} className="transition hover:bg-slate-50/70 dark:hover:bg-white/[0.03]">
                        <td className="px-4 py-3">
                            <div className="font-medium text-slate-800 dark:text-slate-100">{user.name}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">{user.email}</div>
                        </td>
                        <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1.5">
                                {user.is_super_admin && (
                                    <Badge variant="violet" size="sm">
                                        {t('admin.users.table.superAdmin', 'Super admin')}
                                    </Badge>
                                )}
                                {user.roles.map((role) => (
                                    <Badge key={role} variant="slate" size="sm">
                                        {role}
                                    </Badge>
                                ))}
                            </div>
                        </td>
                        <td className="px-4 py-3">
                            {user.deleted_at ? (
                                <Badge variant="rose" dot size="sm">
                                    {t('admin.users.status.deleted', 'Deleted')}
                                </Badge>
                            ) : user.email_verified_at ? (
                                <Badge variant="emerald" dot size="sm">
                                    {t('admin.users.status.verified', 'Verified')}
                                </Badge>
                            ) : (
                                <Badge variant="amber" dot size="sm">
                                    {t('admin.users.status.unverified', 'Unverified')}
                                </Badge>
                            )}
                        </td>
                        <td className="px-4 py-3">
                            <div className="flex justify-end gap-0.5">
                                {user.deleted_at ? (
                                    <button
                                        type="button"
                                        title={t('admin.users.actions.restore', 'Restore')}
                                        onClick={() =>
                                            router.post(
                                                route('admin.users.restore', { user: user.id }),
                                                {},
                                                { preserveScroll: true }
                                            )
                                        }
                                        className={actionButton}
                                    >
                                        <RotateCcw className="h-4 w-4" />
                                    </button>
                                ) : (
                                    <>
                                        <Link
                                            href={route('admin.users.edit', { user: user.id })}
                                            title={t('admin.users.actions.edit', 'Edit')}
                                            className={actionButton}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Link>
                                        <button
                                            type="button"
                                            title={t('admin.users.actions.resetPassword', 'Reset password')}
                                            onClick={() => setResetTarget(user)}
                                            className={actionButton}
                                        >
                                            <KeyRound className="h-4 w-4" />
                                        </button>
                                        {!user.email_verified_at && (
                                            <button
                                                type="button"
                                                title={t('admin.users.actions.resendVerification', 'Resend verification')}
                                                onClick={() =>
                                                    router.post(
                                                        route('admin.users.resend-verification', { user: user.id }),
                                                        {},
                                                        { preserveScroll: true }
                                                    )
                                                }
                                                className={actionButton}
                                            >
                                                <Send className="h-4 w-4" />
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            title={t('admin.users.actions.delete', 'Delete')}
                                            onClick={() => setDeleteTarget(user)}
                                            className="rounded-lg p-2 text-rose-500 transition hover:bg-rose-50 dark:hover:bg-rose-500/10"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </>
                                )}
                            </div>
                        </td>
                    </tr>
                ))}
            </TableCard>

            <Modal
                open={deleteTarget !== null}
                title={t('admin.users.deleteDialog.title', 'Delete user')}
                onClose={() => setDeleteTarget(null)}
            >
                <p className="mb-5 text-sm text-slate-600 dark:text-slate-300">
                    {t('admin.users.deleteDialog.message', 'Are you sure you want to delete this user?')}
                </p>
                <div className="flex justify-end gap-2">
                    <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
                        {t('admin.users.form.cancel', 'Cancel')}
                    </Button>
                    <Button variant="danger" onClick={confirmDelete}>
                        {t('admin.users.actions.delete', 'Delete')}
                    </Button>
                </div>
            </Modal>

            <Modal
                open={resetTarget !== null}
                title={t('admin.users.resetPassword.title', 'Reset password')}
                onClose={() => setResetTarget(null)}
            >
                <form onSubmit={submitReset} className="space-y-4">
                    <Input
                        label={t('admin.users.form.password', 'Password')}
                        type="password"
                        autoComplete="new-password"
                        error={resetForm.formState.errors.password?.message}
                        {...resetForm.register('password', {
                            required: 'Password is required',
                            minLength: {
                                value: MIN_PASSWORD_LENGTH,
                                message: `Min ${MIN_PASSWORD_LENGTH} characters`,
                            },
                        })}
                    />
                    <Input
                        label={t('admin.users.form.confirmPassword', 'Confirm password')}
                        type="password"
                        autoComplete="new-password"
                        error={resetForm.formState.errors.password_confirmation?.message}
                        {...resetForm.register('password_confirmation', {
                            validate: (value) =>
                                value === resetForm.getValues('password') || 'Passwords do not match',
                        })}
                    />
                    <div className="flex justify-end gap-2">
                        <Button variant="secondary" onClick={() => setResetTarget(null)}>
                            {t('admin.users.form.cancel', 'Cancel')}
                        </Button>
                        <Button type="submit" isLoading={resetForm.formState.isSubmitting}>
                            {t('admin.users.resetPassword.submit', 'Reset password')}
                        </Button>
                    </div>
                </form>
            </Modal>
        </AdminLayout>
    );
}
