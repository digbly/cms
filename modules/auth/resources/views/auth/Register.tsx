import { useState } from 'react';
import { Link } from '@inertiajs/react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Lock, Mail, User, UserPlus } from 'lucide-react';
import AuthLayout from '../layouts/AuthLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { submitForm } from '@/lib/inertia-form';
import { EMAIL_PATTERN, MIN_PASSWORD_LENGTH } from '@/lib/validation';
import { useTranslation } from '@/hooks/useTranslation';

interface RegisterProps {
    title: string;
}

interface RegisterForm {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
}

export default function Register({ title }: RegisterProps) {
    const { t } = useTranslation();
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        setError,
        getValues,
        formState: { errors, isSubmitting },
    } = useForm<RegisterForm>({
        defaultValues: { name: '', email: '', password: '', password_confirmation: '' },
    });

    const onSubmit = handleSubmit((data) => submitForm('/register', data, { setError }));

    return (
        <AuthLayout title={title}>
            <form onSubmit={onSubmit} className="space-y-4" noValidate>
                <Input
                    label={t('auth.register.nameLabel', 'Full name')}
                    type="text"
                    autoComplete="name"
                    leftIcon={<User className="h-4 w-4" />}
                    error={errors.name?.message}
                    {...register('name', {
                        required: t('auth.register.errors.nameRequired', 'Full name is required'),
                        minLength: {
                            value: 2,
                            message: t('auth.register.errors.nameMinLength', 'Name must be at least 2 characters'),
                        },
                    })}
                />

                <Input
                    label={t('auth.register.emailLabel', 'Email address')}
                    type="email"
                    autoComplete="email"
                    leftIcon={<Mail className="h-4 w-4" />}
                    error={errors.email?.message}
                    {...register('email', {
                        required: t('auth.register.errors.emailRequired', 'Email address is required'),
                        pattern: {
                            value: EMAIL_PATTERN,
                            message: t('auth.register.errors.emailInvalid', 'Please enter a valid email address'),
                        },
                    })}
                />

                <Input
                    label={t('auth.register.passwordLabel', 'Password')}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    leftIcon={<Lock className="h-4 w-4" />}
                    error={errors.password?.message}
                    hint={t('auth.register.passwordPlaceholder', `Min. ${MIN_PASSWORD_LENGTH} characters`)}
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
                        required: t('auth.register.errors.passwordRequired', 'Password is required'),
                        minLength: {
                            value: MIN_PASSWORD_LENGTH,
                            message: t('auth.register.errors.passwordMinLength', `Password must be at least ${MIN_PASSWORD_LENGTH} characters`),
                        },
                    })}
                />

                <Input
                    label={t('auth.register.confirmPasswordLabel', 'Confirm password')}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    leftIcon={<Lock className="h-4 w-4" />}
                    error={errors.password_confirmation?.message}
                    {...register('password_confirmation', {
                        required: t('auth.register.errors.confirmRequired', 'Please confirm your password'),
                        validate: (value) =>
                            value === getValues('password') ||
                            t('auth.register.errors.passwordMismatch', 'Passwords do not match'),
                    })}
                />

                <Button
                    type="submit"
                    className="mt-2 w-full"
                    isLoading={isSubmitting}
                    leftIcon={<UserPlus className="h-4 w-4" />}
                >
                    {t('auth.register.submit', 'Create account')}
                </Button>
            </form>

            <p className="pt-4 text-center text-xs text-slate-500 dark:text-slate-400">
                {t('auth.register.hasAccount', 'Already have an account?')}{' '}
                <Link href="/login" className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400">
                    {t('auth.register.signIn', 'Sign in')}
                </Link>
            </p>
        </AuthLayout>
    );
}
