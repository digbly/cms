import { router } from '@inertiajs/react';
import { ArrowRight, MailCheck, RefreshCw } from 'lucide-react';
import AuthLayout from '../layouts/AuthLayout';
import Button from '@/components/ui/Button';
import { useTranslation } from '@/hooks/useTranslation';

interface VerifyEmailProps {
    title: string;
    email: string;
}

export default function VerifyEmail({ title, email }: VerifyEmailProps) {
    const { t } = useTranslation();

    return (
        <AuthLayout title={title}>
            <div className="space-y-6 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    <MailCheck className="h-8 w-8" />
                </div>

                <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    {t(
                        'auth.verifyEmail.message',
                        'We sent a verification link to your email address. Please check your inbox and spam folder.'
                    ).replace('{{emailSuffix}}', ` (${email})`)}
                </p>

                <div className="space-y-3 pt-2">
                    <Button
                        className="w-full"
                        onClick={() => router.visit('/admin')}
                        rightIcon={<ArrowRight className="h-4 w-4" />}
                    >
                        {t('auth.verifyEmail.continue', 'Continue')}
                    </Button>

                    <Button
                        variant="secondary"
                        className="w-full"
                        onClick={() => router.post('/email/verification-notification')}
                        leftIcon={<RefreshCw className="h-4 w-4" />}
                    >
                        {t('auth.verifyEmail.resend', 'Resend verification email')}
                    </Button>
                </div>
            </div>
        </AuthLayout>
    );
}
