import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { BadgeCheck, KeyRound, Save, ShieldAlert } from 'lucide-react';
import AdminLayout from '@modules/admin/resources/views/layouts/AdminLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { submitForm } from '@/lib/inertia-form';
import { MIN_PASSWORD_LENGTH } from '@/lib/validation';
import { useTranslation } from '@/hooks/useTranslation';

interface ProfileProps {
    title: string;
    profile: {
        name: string;
        email: string;
        avatar: string | null;
        email_verified: boolean;
    };
}

interface InfoForm {
    name: string;
    avatar?: FileList;
}

interface PasswordForm {
    current_password: string;
    password: string;
    password_confirmation: string;
}

export default function Profile({ title, profile }: ProfileProps) {
    const { t } = useTranslation();
    const [preview, setPreview] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        setError,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<InfoForm>({ defaultValues: { name: profile.name } });

    const avatarFile = watch('avatar')?.[0];

    useEffect(() => {
        if (!avatarFile) {
            setPreview(null);

            return;
        }

        const objectUrl = URL.createObjectURL(avatarFile);
        setPreview(objectUrl);

        return () => URL.revokeObjectURL(objectUrl);
    }, [avatarFile]);

    const {
        register: registerPassword,
        handleSubmit: handlePasswordSubmit,
        setError: setPasswordError,
        getValues: getPasswordValues,
        reset: resetPassword,
        formState: { errors: passwordErrors, isSubmitting: isSubmittingPassword },
    } = useForm<PasswordForm>({
        defaultValues: { current_password: '', password: '', password_confirmation: '' },
    });

    const onSubmitInfo = handleSubmit((data) =>
        submitForm(
            '/profile',
            { name: data.name, avatar: data.avatar?.[0] ?? null },
            { setError, forceFormData: true, preserveScroll: true }
        )
    );

    const onSubmitPassword = handlePasswordSubmit((data) =>
        submitForm('/profile/password', data, {
            method: 'put',
            setError: setPasswordError,
            preserveScroll: true,
            onSuccess: () => resetPassword(),
        })
    );

    const avatar = preview ?? profile.avatar;

    return (
        <AdminLayout title={title}>
            <h1 className="mb-6 text-2xl font-bold">{title}</h1>

            <div className="grid gap-6 lg:grid-cols-2">
                <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
                        {t('auth.profile.personal.title', 'Personal information')}
                    </h2>

                    <form onSubmit={onSubmitInfo} className="space-y-4">
                        <div className="flex items-center gap-4">
                            <span className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-lg font-bold text-slate-500 dark:bg-slate-800">
                                {avatar ? (
                                    <img src={avatar} alt={profile.name} className="h-full w-full object-cover" />
                                ) : (
                                    profile.name.charAt(0).toUpperCase()
                                )}
                            </span>
                            <label className="text-xs text-slate-500 dark:text-slate-400">
                                <span className="mb-1 block font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                                    {t('auth.profile.personal.avatarLabel', 'Profile photo')}
                                </span>
                                <input type="file" accept="image/*" {...register('avatar')} />
                            </label>
                        </div>

                        <Input
                            label={t('auth.profile.personal.nameLabel', 'Full name')}
                            error={errors.name?.message}
                            {...register('name', {
                                required: t('auth.profile.personal.nameRequired', 'Name is required'),
                                minLength: {
                                    value: 2,
                                    message: t('auth.profile.personal.nameMinLength', 'Name must be at least 2 characters'),
                                },
                            })}
                        />

                        <div>
                            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                                {t('auth.profile.personal.emailLabel', 'Email address')}
                            </label>
                            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-800/60">
                                <span>{profile.email}</span>
                                {profile.email_verified ? (
                                    <BadgeCheck className="h-4 w-4 text-emerald-500" />
                                ) : (
                                    <ShieldAlert className="h-4 w-4 text-amber-500" />
                                )}
                            </div>
                        </div>

                        <Button type="submit" isLoading={isSubmitting} leftIcon={<Save className="h-4 w-4" />}>
                            {t('auth.profile.personal.submit', 'Save changes')}
                        </Button>
                    </form>
                </section>

                <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
                        {t('auth.profile.password.title', 'Change password')}
                    </h2>

                    <form onSubmit={onSubmitPassword} className="space-y-4" noValidate>
                        <Input
                            label={t('auth.profile.password.currentLabel', 'Current password')}
                            type="password"
                            autoComplete="current-password"
                            error={passwordErrors.current_password?.message}
                            {...registerPassword('current_password', {
                                required: t('auth.profile.password.currentRequired', 'Current password is required'),
                            })}
                        />

                        <Input
                            label={t('auth.profile.password.newLabel', 'New password')}
                            type="password"
                            autoComplete="new-password"
                            error={passwordErrors.password?.message}
                            {...registerPassword('password', {
                                required: t('auth.profile.password.passwordRequired', 'New password is required'),
                                minLength: {
                                    value: MIN_PASSWORD_LENGTH,
                                    message: t('auth.profile.password.passwordMinLength', `Password must be at least ${MIN_PASSWORD_LENGTH} characters`),
                                },
                            })}
                        />

                        <Input
                            label={t('auth.profile.password.confirmLabel', 'Confirm new password')}
                            type="password"
                            autoComplete="new-password"
                            error={passwordErrors.password_confirmation?.message}
                            {...registerPassword('password_confirmation', {
                                required: t('auth.profile.password.confirmRequired', 'Please confirm your password'),
                                validate: (value) =>
                                    value === getPasswordValues('password') ||
                                    t('auth.profile.password.passwordMismatch', 'Passwords do not match'),
                            })}
                        />

                        <Button
                            type="submit"
                            isLoading={isSubmittingPassword}
                            leftIcon={<KeyRound className="h-4 w-4" />}
                        >
                            {t('auth.profile.password.submit', 'Update password')}
                        </Button>
                    </form>
                </section>
            </div>
        </AdminLayout>
    );
}
