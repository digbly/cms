import { useState } from 'react';
import { Link } from '@inertiajs/react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import AuthLayout from '../layouts/AuthLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { submitForm } from '@/lib/inertia-form';
import { EMAIL_PATTERN } from '@/lib/validation';
import { useTranslation } from '@/hooks/useTranslation';

interface Provider {
    value: string;
    label: string;
}

interface LoginProps {
    title: string;
    redirect?: string | null;
    providers: Provider[];
}

interface LoginForm {
    email: string;
    password: string;
    remember: boolean;
}

export default function Login({ title, redirect, providers = [] }: LoginProps) {
    const { t } = useTranslation();
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<LoginForm>({
        defaultValues: { email: '', password: '', remember: true },
    });

    const onSubmit = handleSubmit((data) =>
        submitForm('/login', { ...data, redirect: redirect ?? '' }, { setError })
    );

    const socialRedirectUrl = (provider: string) =>
        `/auth/social/${provider}/redirect${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`;

    return (
        <AuthLayout title={title}>
            <form onSubmit={onSubmit} className="space-y-4" noValidate>
                <Input
                    label={t('auth.login.emailLabel', 'Email address')}
                    type="email"
                    autoComplete="email"
                    leftIcon={<Mail className="h-4 w-4" />}
                    error={errors.email?.message}
                    {...register('email', {
                        required: t('auth.login.errors.emailRequired', 'Email address is required'),
                        pattern: {
                            value: EMAIL_PATTERN,
                            message: t('auth.login.errors.emailInvalid', 'Please enter a valid email address'),
                        },
                    })}
                />

                <Input
                    label={t('auth.login.passwordLabel', 'Password')}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
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
                        required: t('auth.login.errors.passwordRequired', 'Password is required'),
                    })}
                />

                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                        <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800"
                            {...register('remember')}
                        />
                        {t('auth.login.rememberMe', 'Remember me')}
                    </label>

                    <Link
                        href="/forgot-password"
                        className="text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                    >
                        {t('auth.login.forgotPassword', 'Forgot password?')}
                    </Link>
                </div>

                <Button type="submit" className="mt-2 w-full" isLoading={isSubmitting}>
                    {t('auth.login.submit', 'Sign in')}
                </Button>
            </form>

            {providers.length > 0 && (
                <div className="mt-6">
                    <p className="mb-3 text-center text-xs uppercase tracking-wide text-slate-400">
                        {t('auth.login.orContinueWith', 'Or continue with')}
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                        {providers.map((provider) => (
                            <a
                                key={provider.value}
                                href={socialRedirectUrl(provider.value)}
                                className="inline-flex justify-center rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                            >
                                {provider.label}
                            </a>
                        ))}
                    </div>
                </div>
            )}

            <p className="pt-4 text-center text-xs text-slate-500 dark:text-slate-400">
                {t('auth.login.noAccount', "Don't have an account?")}{' '}
                <Link href="/register" className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400">
                    {t('auth.login.createAccount', 'Create an account')}
                </Link>
            </p>
        </AuthLayout>
    );
}
