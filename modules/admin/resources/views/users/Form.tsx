import { Link, router } from '@inertiajs/react';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Save } from 'lucide-react';
import AdminLayout from '@modules/admin/resources/views/layouts/AdminLayout';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Checkbox from '@/components/ui/Checkbox';
import Input from '@/components/ui/Input';
import { submitForm } from '@/lib/inertia-form';
import { route } from '@/lib/route';
import { EMAIL_PATTERN, MIN_PASSWORD_LENGTH } from '@/lib/validation';
import { useTranslation } from '@/hooks/useTranslation';

interface UserFormProps {
    title: string;
    user: {
        id: string;
        name: string;
        email: string;
        roles: string[];
        is_super_admin: boolean;
    } | null;
    roles: string[];
    canManageSuperAdmin: boolean;
}

interface FormValues {
    name: string;
    email: string;
    roles: string[];
    is_super_admin: boolean;
    password: string;
    password_confirmation: string;
}

export default function UserForm({ title, user, roles, canManageSuperAdmin }: UserFormProps) {
    const { t } = useTranslation();
    const isEdit = user !== null;

    const {
        register,
        handleSubmit,
        setError,
        getValues,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({
        defaultValues: {
            name: user?.name ?? '',
            email: user?.email ?? '',
            roles: user?.roles ?? [],
            is_super_admin: user?.is_super_admin ?? false,
            password: '',
            password_confirmation: '',
        },
    });

    const onSubmit = handleSubmit((data) => {
        const payload = {
            name: data.name,
            email: data.email,
            roles: data.roles,
            is_super_admin: data.is_super_admin,
            ...(isEdit ? {} : { password: data.password, password_confirmation: data.password_confirmation }),
        };

        const url = isEdit
            ? route('admin.users.update', { user: user.id })
            : route('admin.users.store');

        return submitForm(url, payload, { method: isEdit ? 'put' : 'post', setError });
    });

    return (
        <AdminLayout title={title}>
            <div className="mb-6 flex items-center gap-3">
                <Link
                    href={route('admin.users.index')}
                    className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 dark:border-white/10 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{title}</h1>
            </div>

            <Card className="max-w-2xl p-6">
                <form onSubmit={onSubmit} className="space-y-4" noValidate>
                    <Input
                        label={t('admin.users.form.name', 'Name')}
                        error={errors.name?.message}
                        {...register('name', {
                            required: 'Name is required',
                            minLength: { value: 2, message: 'Name must be at least 2 characters' },
                        })}
                    />

                    <Input
                        label={t('admin.users.form.email', 'Email')}
                        type="email"
                        error={errors.email?.message}
                        {...register('email', {
                            required: 'Email is required',
                            pattern: { value: EMAIL_PATTERN, message: 'Please enter a valid email address' },
                        })}
                    />

                    {!isEdit && (
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Input
                                label={t('admin.users.form.password', 'Password')}
                                type="password"
                                autoComplete="new-password"
                                error={errors.password?.message}
                                {...register('password', {
                                    required: 'Password is required',
                                    minLength: {
                                        value: MIN_PASSWORD_LENGTH,
                                        message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
                                    },
                                })}
                            />
                            <Input
                                label={t('admin.users.form.confirmPassword', 'Confirm password')}
                                type="password"
                                autoComplete="new-password"
                                error={errors.password_confirmation?.message}
                                {...register('password_confirmation', {
                                    validate: (value) =>
                                        value === getValues('password') || 'Passwords do not match',
                                })}
                            />
                        </div>
                    )}

                    <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                            {t('admin.users.form.roles', 'Roles')}
                        </p>
                        <div className="space-y-2">
                            {roles.length === 0 && (
                                <p className="text-xs text-slate-500">{t('admin.users.form.noRoles', 'No roles available.')}</p>
                            )}
                            {roles.map((role) => (
                                <Checkbox key={role} value={role} label={role} {...register('roles')} />
                            ))}
                        </div>
                    </div>

                    <Checkbox
                        label={t('admin.users.form.superAdmin', 'Super admin')}
                        disabled={!canManageSuperAdmin}
                        {...register('is_super_admin')}
                    />

                    <div className="flex gap-3 pt-2">
                        <Button type="submit" isLoading={isSubmitting} leftIcon={<Save className="h-4 w-4" />}>
                            {t('admin.users.form.save', 'Save')}
                        </Button>
                        <Button variant="secondary" onClick={() => router.visit(route('admin.users.index'))}>
                            {t('admin.users.form.cancel', 'Cancel')}
                        </Button>
                    </div>
                </form>
            </Card>
        </AdminLayout>
    );
}
