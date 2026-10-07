import { useState } from 'react';
import { Link } from '@inertiajs/react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, KeyRound, Lock } from 'lucide-react';
import AuthLayout from '../layouts/AuthLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { submitForm } from '@/lib/inertia-form';
import { EMAIL_PATTERN, MIN_PASSWORD_LENGTH } from '@/lib/validation';
import { useTranslation } from '@/hooks/useTranslation';

interface ResetPasswordProps {
    title: string;
    token: string;
    email: string | null;
}

interface ResetPasswordForm {
    email: string;
    password: string;
    password_confirmation: string;
}

export default function ResetPassword({ title, token, email }: ResetPasswordProps) {
    const { t } = useTranslation();
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        setError,
        getValues,
        formState: { errors, isSubmitting },
    } = useForm<ResetPasswordForm>({
        defaultValues: { email: email ?? '', password: '', password_confirmation: '' },
    });

    const onSubmit = handleSubmit((data) => submitForm('/reset-password', { ...data, token }, { setError }));

    if (!token) {
        return (
            <AuthLayout title={t('auth.resetPassword.invalidLink', 'Invalid reset link')}>
                <p className="text-center text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    {t(
                        'auth.resetPassword.invalidLinkDesc',
                        'This password reset link is invalid or has expired. Please request a new one.'
                    )}
                </p>
                <div className="pt-4 text-center">
                    <Link
                        href="/forgot-password"
                        className="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                    >
                        {t('auth.resetPassword.requestNew', 'Request a new reset link')}
                    </Link>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout title={title}>
            <form onSubmit={onSubmit} className="space-y-4" noValidate>
                <Input
                    label={t('auth.resetPassword.emailLabel', 'Email address')}
                    type="email"
                    autoComplete="email"
                    error={errors.email?.message}
                    {...register('email', {
                        required: t('auth.resetPassword.errors.emailRequired', 'Email address is required'),
                        pattern: {
                            value: EMAIL_PATTERN,
                            message: t('auth.resetPassword.errors.emailInvalid', 'Please enter a valid email address'),
                        },
                    })}
                />

                <Input
                    label={t('auth.resetPassword.newPasswordLabel', 'New password')}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    leftIcon={<Lock className="h-4 w-4" />}
                    error={errors.password?.message}
                    rightIcon={
                        <button
                            type="button"
                            tabIndex={-1}
                            onClick={() => setShowPassword((value) => !value)}
                            className="cursor-pointer transition-colors hover:text-slate-600 dark:hover:text-slate-200"
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    }
                    {...register('password', {
                        required: t('auth.resetPassword.errors.passwordRequired', 'Password is required'),
                        minLength: {
                            value: MIN_PASSWORD_LENGTH,
                            message: t('auth.resetPassword.errors.passwordMinLength', `Password must be at least ${MIN_PASSWORD_LENGTH} characters`),
                        },
                    })}
                />

                <Input
                    label={t('auth.resetPassword.confirmPasswordLabel', 'Confirm new password')}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    leftIcon={<Lock className="h-4 w-4" />}
                    error={errors.password_confirmation?.message}
                    {...register('password_confirmation', {
                        required: t('auth.resetPassword.errors.confirmRequired', 'Please confirm your password'),
                        validate: (value) =>
                            value === getValues('password') ||
                            t('auth.resetPassword.errors.passwordMismatch', 'Passwords do not match'),
                    })}
                />

                <Button
                    type="submit"
                    className="mt-2 w-full"
                    isLoading={isSubmitting}
                    leftIcon={<KeyRound className="h-4 w-4" />}
                >
                    {t('auth.resetPassword.submit', 'Reset password')}
                </Button>
            </form>

            <div className="pt-4 text-center">
                <Link
                    href="/login"
                    className="text-xs font-semibold text-slate-600 hover:text-slate-900 hover:underline dark:text-slate-400 dark:hover:text-white"
                >
                    {t('auth.resetPassword.cancelAndReturn', 'Cancel and return to sign in')}
                </Link>
            </div>
        </AuthLayout>
    );
}
