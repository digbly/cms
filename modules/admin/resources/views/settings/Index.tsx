import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Globe, Languages, Save, Share2 } from 'lucide-react';
import AdminLayout from '@modules/admin/resources/views/layouts/AdminLayout';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Checkbox from '@/components/ui/Checkbox';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import PageHeader from '@/components/ui/PageHeader';
import MediaField from '../components/MediaField';
import type { MediaItemSummary } from '../components/MediaPickerModal';
import { submitForm } from '@/lib/inertia-form';
import { route } from '@/lib/route';
import { useTranslation } from '@/hooks/useTranslation';

interface SocialProvider {
    value: string;
    label: string;
}

interface LanguageOption {
    code: string;
    name: string;
}

type SocialFormFields = Record<`social_login_${string}`, string | boolean>;

interface SettingsProps {
    title: string;
    settings: {
        title?: Record<string, string>;
        description?: Record<string, string>;
        sitename?: string | null;
        logo?: string | null;
        favicon?: string | null;
        banner?: string | null;
        user_registration?: boolean | null;
        user_verification?: boolean | null;
        multiple_language?: string | null;
        language?: string | null;
    } & Record<`social_login_${string}`, string | boolean | null | undefined>;
    media: {
        logo: MediaItemSummary | null;
        favicon: MediaItemSummary | null;
        banner: MediaItemSummary | null;
    };
    locales: string[];
    languages: LanguageOption[];
    socialProviders: SocialProvider[];
}

type SettingsForm = SocialFormFields & {
    title: Record<string, string>;
    description: Record<string, string>;
    sitename: string;
    logo: string | null;
    favicon: string | null;
    banner: string | null;
    user_registration: boolean;
    user_verification: boolean;
    multiple_language: string;
    language: string;
};

const socialDefaults = (
    settings: SettingsProps['settings'],
    providers: SocialProvider[]
): SocialFormFields => {
    const defaults = {} as SocialFormFields;

    for (const { value } of providers) {
        defaults[`social_login_${value}_enabled`] = Boolean(settings[`social_login_${value}_enabled`]);
        defaults[`social_login_${value}_client_id`] = String(settings[`social_login_${value}_client_id`] ?? '');
        defaults[`social_login_${value}_client_secret`] = String(
            settings[`social_login_${value}_client_secret`] ?? ''
        );
    }

    return defaults;
};

export default function Settings({ title, settings, media, locales, languages = [], socialProviders = [] }: SettingsProps) {
    const { t } = useTranslation();
    const [activeLocale, setActiveLocale] = useState(locales[0] ?? 'en');

    const {
        register,
        handleSubmit,
        setError,
        setValue,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<SettingsForm>({
        defaultValues: {
            title: Object.fromEntries(locales.map((locale) => [locale, settings.title?.[locale] ?? ''])),
            description: Object.fromEntries(locales.map((locale) => [locale, settings.description?.[locale] ?? ''])),
            sitename: settings.sitename ?? '',
            logo: settings.logo ?? null,
            favicon: settings.favicon ?? null,
            banner: settings.banner ?? null,
            user_registration: Boolean(settings.user_registration),
            user_verification: Boolean(settings.user_verification),
            multiple_language: settings.multiple_language ?? 'none',
            language: settings.language ?? languages[0]?.code ?? 'en',
            ...socialDefaults(settings, socialProviders),
        },
    });

    const errorFor = (path: string): string | undefined =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        path.split('.').reduce<any>((acc, key) => acc?.[key], errors)?.message;

    const onSubmit = handleSubmit((data) =>
        submitForm(route('admin.settings.update'), data, { method: 'put', setError })
    );

    const branding: { key: 'logo' | 'favicon' | 'banner'; label: string }[] = [
        { key: 'logo', label: t('admin.settings.fields.logo', 'Logo') },
        { key: 'favicon', label: t('admin.settings.fields.favicon', 'Favicon') },
        { key: 'banner', label: t('admin.settings.fields.banner', 'Banner') },
    ];

    const languageModes = [
        { value: 'none', label: t('admin.settings.modes.none', 'Single language') },
        { value: 'session', label: t('admin.settings.modes.session', 'Session') },
        { value: 'prefix', label: t('admin.settings.modes.prefix', 'URL prefix') },
        { value: 'subdomain', label: t('admin.settings.modes.subdomain', 'Subdomain') },
    ];

    return (
        <AdminLayout title={title}>
            <PageHeader
                title={title}
                description={t('admin.settings.subtitle', 'Configure your site identity, branding and account options.')}
            />

            <form onSubmit={onSubmit} className="max-w-3xl space-y-6">
                <Card className="p-6">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                            <Globe className="h-4 w-4" />
                            {t('admin.settings.general.title', 'General')}
                        </h2>
                        <div className="flex gap-1 rounded-xl border border-slate-200 p-1 dark:border-white/10">
                            {locales.map((locale) => (
                                <button
                                    key={locale}
                                    type="button"
                                    onClick={() => setActiveLocale(locale)}
                                    className={`rounded-lg px-3 py-1 text-xs font-medium uppercase transition ${
                                        activeLocale === locale
                                            ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                                            : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                                    }`}
                                >
                                    {locale}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Input
                            label={t('admin.settings.fields.title', 'Title')}
                            error={errorFor(`title.${activeLocale}`)}
                            {...register(`title.${activeLocale}` as const, { maxLength: 255 })}
                        />

                        <div>
                            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                                {t('admin.settings.fields.description', 'Description')}
                            </label>
                            <textarea
                                rows={3}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2.5 text-sm text-slate-900 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-white/[0.08] dark:bg-slate-900/60 dark:text-white"
                                {...register(`description.${activeLocale}` as const, { maxLength: 500 })}
                            />
                        </div>

                        <Input
                            label={t('admin.settings.fields.sitename', 'Site name')}
                            error={errors.sitename?.message}
                            {...register('sitename', { maxLength: 120 })}
                        />
                    </div>
                </Card>

                <Card className="p-6">
                    <h2 className="mb-1 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        <Languages className="h-4 w-4" />
                        {t('admin.settings.languages.title', 'Languages')}
                    </h2>
                    <p className="mb-5 text-xs text-slate-500 dark:text-slate-400">
                        {t(
                            'admin.settings.languages.subtitle',
                            'Control how multiple languages are exposed on the front end.'
                        )}
                    </p>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <Select
                            label={t('admin.settings.fields.defaultLanguage', 'Default language')}
                            error={errors.language?.message}
                            {...register('language')}
                        >
                            {languages.map((language) => (
                                <option key={language.code} value={language.code}>
                                    {language.name}
                                </option>
                            ))}
                        </Select>

                        <Select
                            label={t('admin.settings.fields.multipleLanguage', 'Multiple language mode')}
                            error={errors.multiple_language?.message}
                            {...register('multiple_language')}
                        >
                            {languageModes.map((mode) => (
                                <option key={mode.value} value={mode.value}>
                                    {mode.label}
                                </option>
                            ))}
                        </Select>
                    </div>

                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                        {t(
                            'admin.settings.fields.multipleLanguageHint',
                            'URL prefix adds a locale segment, e.g. /vi/posts/hello. The default language stays unprefixed.'
                        )}
                    </p>
                </Card>

                <Card className="p-6">
                    <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        {t('admin.settings.branding.title', 'Branding')}
                    </h2>

                    <div className="grid gap-6 sm:grid-cols-3">
                        {branding.map(({ key, label }) => (
                            <MediaField
                                key={key}
                                label={label}
                                value={watch(key)}
                                preview={media[key]}
                                onChange={(id) => setValue(key, id)}
                            />
                        ))}
                    </div>
                </Card>

                <Card className="p-6">
                    <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        {t('admin.settings.users.title', 'Users')}
                    </h2>

                    <div className="space-y-3">
                        <Checkbox
                            label={t('admin.settings.fields.userRegistration', 'Allow user registration')}
                            {...register('user_registration')}
                        />

                        <Checkbox
                            label={t('admin.settings.fields.userVerification', 'Require email verification')}
                            {...register('user_verification')}
                        />
                    </div>
                </Card>

                <Card className="p-6">
                    <h2 className="mb-1 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        <Share2 className="h-4 w-4" />
                        {t('admin.settings.social.title', 'Social login')}
                    </h2>
                    <p className="mb-5 text-xs text-slate-500 dark:text-slate-400">
                        {t(
                            'admin.settings.social.subtitle',
                            'Allow visitors to sign in with an external provider. Credentials left blank fall back to the environment configuration.'
                        )}
                    </p>

                    <div className="space-y-6">
                        {socialProviders.map((provider) => (
                            <div
                                key={provider.value}
                                className="rounded-xl border border-slate-200 p-4 dark:border-white/[0.08]"
                            >
                                <Checkbox
                                    label={provider.label}
                                    {...register(`social_login_${provider.value}_enabled`)}
                                />

                                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                    <Input
                                        label={t('admin.settings.social.clientId', 'Client ID')}
                                        {...register(`social_login_${provider.value}_client_id`, {
                                            maxLength: 255,
                                        })}
                                    />

                                    <Input
                                        label={t('admin.settings.social.clientSecret', 'Client secret')}
                                        type="password"
                                        autoComplete="off"
                                        {...register(`social_login_${provider.value}_client_secret`, {
                                            maxLength: 255,
                                        })}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                <Button type="submit" isLoading={isSubmitting} leftIcon={<Save className="h-4 w-4" />}>
                    {t('admin.settings.save', 'Save settings')}
                </Button>
            </form>
        </AdminLayout>
    );
}
