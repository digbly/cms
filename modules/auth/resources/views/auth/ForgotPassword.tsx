import { Link, router, usePage } from '@inertiajs/react';
import { useForm } from 'react-hook-form';
import { ArrowLeft, CheckCircle2, Mail, Send } from 'lucide-react';
import AuthLayout from '../layouts/AuthLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { submitForm } from '@/lib/inertia-form';
import { EMAIL_PATTERN } from '@/lib/validation';
import { useTranslation } from '@/hooks/useTranslation';
import type { SharedProps } from '@/types';

interface ForgotPasswordProps {
    title: string;
}

interface ForgotPasswordForm {
    email: string;
}

export default function ForgotPassword({ title }: ForgotPasswordProps) {
    const { t } = useTranslation();
    const { flash } = usePage<SharedProps>().props;

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<ForgotPasswordForm>({ defaultValues: { email: '' } });

    const onSubmit = handleSubmit((data) => submitForm('/forgot-password', data, { setError }));

    if (flash.success) {
        return (
            <AuthLayout title={t('auth.forgotPassword.success.title', 'Check your email')}>
                <div className="space-y-6 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-500">
                        <CheckCircle2 className="h-8 w-8" />
                    </div>

                    <Button variant="secondary" className="w-full" onClick={() => router.get('/forgot-password')}>
                        {t('auth.forgotPassword.success.sendAnother', 'Send another link')}
                    </Button>

                    <Link
                        href="/login"
                        className="inline-flex items-center justify-center gap-2 text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        {t('auth.forgotPassword.backToLogin', 'Back to sign in')}
                    </Link>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout title={title}>
            <p className="mb-5 text-center text-xs text-slate-500 dark:text-slate-400">
                {t(
                    'auth.forgotPassword.subtitle',
                    "Enter the email associated with your account and we'll send you a recovery link."
                )}
            </p>

            <form onSubmit={onSubmit} className="space-y-4" noValidate>
                <Input
                    label={t('auth.forgotPassword.emailLabel', 'Email address')}
                    type="email"
                    autoComplete="email"
                    leftIcon={<Mail className="h-4 w-4" />}
                    error={errors.email?.message}
                    {...register('email', {
                        required: t('auth.forgotPassword.errors.emailRequired', 'Email address is required'),
                        pattern: {
                            value: EMAIL_PATTERN,
                            message: t('auth.forgotPassword.errors.emailInvalid', 'Please enter a valid email address'),
                        },
                    })}
                />

                <Button
                    type="submit"
                    className="mt-2 w-full"
                    isLoading={isSubmitting}
                    leftIcon={<Send className="h-4 w-4" />}
                >
                    {t('auth.forgotPassword.submit', 'Send reset instructions')}
                </Button>
            </form>

            <div className="pt-4 text-center">
                <Link
                    href="/login"
                    className="inline-flex items-center justify-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    {t('auth.forgotPassword.backToLogin', 'Back to sign in')}
                </Link>
            </div>
        </AuthLayout>
    );
}
