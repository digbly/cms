import { useState, type FormEvent } from 'react';
import Button from '@/components/ui/Button';
import ErrorAlert from '@/components/ui/ErrorAlert';
import Input from '@/components/ui/Input';
import { useTranslation } from '@/hooks/useTranslation';
import type { AdminCategory, CategoryPayload, CategoryTranslation } from '../types';
import { LOCALES, slugify } from '../lib';

interface TranslationDraft {
    name: string;
    slug: string;
    description: string;
}

const emptyTranslation = (): TranslationDraft => ({ name: '', slug: '', description: '' });

const buildTranslations = (category: AdminCategory | null): Record<string, TranslationDraft> => {
    const drafts: Record<string, TranslationDraft> = {};

    LOCALES.forEach((locale) => {
        const existing = category?.translations.find((translation) => translation.locale === locale);
        drafts[locale] = existing
            ? {
                  name: existing.name ?? '',
                  slug: existing.slug ?? '',
                  description: existing.description ?? '',
              }
            : emptyTranslation();
    });

    return drafts;
};

interface CategoryFormProps {
    category: AdminCategory | null;
    categories: AdminCategory[];
    isSubmitting: boolean;
    error: string | null;
    onSubmit: (payload: CategoryPayload) => void;
    onCancel: () => void;
}

export default function CategoryForm({
    category,
    categories,
    isSubmitting,
    error,
    onSubmit,
    onCancel,
}: CategoryFormProps) {
    const { t } = useTranslation();

    const [parentId, setParentId] = useState<string>(category?.parent_id ?? '');
    const [isHome, setIsHome] = useState(category?.is_home ?? false);
    const [translations, setTranslations] = useState<Record<string, TranslationDraft>>(() =>
        buildTranslations(category)
    );
    const [activeLocale, setActiveLocale] = useState<string>(LOCALES[0]);
    const [localError, setLocalError] = useState<string | null>(null);

    const updateTranslation = (locale: string, field: keyof TranslationDraft, value: string) => {
        setTranslations((current) => ({
            ...current,
            [locale]: { ...current[locale], [field]: value },
        }));
    };

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();
        setLocalError(null);

        const payload: CategoryTranslation[] = LOCALES.map((locale) => {
            const draft = translations[locale];
            const slug = draft.slug.trim() || slugify(draft.name);

            return {
                locale,
                name: draft.name.trim(),
                slug,
                description: draft.description.trim() || null,
            };
        }).filter((translation) => translation.name !== '');

        if (payload.length === 0) {
            setLocalError(
                t('blog.categories.form.nameRequired', 'A name is required for {{locale}}.').replace(
                    '{{locale}}',
                    LOCALES[0].toUpperCase()
                )
            );

            return;
        }

        onSubmit({
            parent_id: parentId || null,
            is_home: isHome,
            translations: payload,
        });
    };

    const active = translations[activeLocale] ?? emptyTranslation();

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {(error || localError) && <ErrorAlert message={error ?? localError ?? ''} />}

            <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    {t('blog.categories.form.parent', 'Parent category')}
                </label>
                <select
                    value={parentId}
                    onChange={(event) => setParentId(event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-white/[0.08] dark:bg-slate-900/60 dark:text-white"
                >
                    <option value="">{t('blog.categories.form.noParent', 'No parent')}</option>
                    {categories
                        .filter((option) => option.id !== category?.id)
                        .map((option) => (
                            <option key={option.id} value={option.id}>
                                {option.name}
                            </option>
                        ))}
                </select>
            </div>

            <label className="inline-flex cursor-pointer items-center gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                <input
                    type="checkbox"
                    checked={isHome}
                    onChange={(event) => setIsHome(event.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                {t('blog.categories.form.isHome', 'Show on homepage')}
            </label>

            <div>
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    {t('blog.categories.form.locale', 'Language')}
                </span>
                <div className="flex w-fit gap-1 rounded-xl border border-slate-200/70 bg-slate-100/80 p-1 dark:border-white/[0.06] dark:bg-white/[0.04]">
                    {LOCALES.map((locale) => (
                        <button
                            key={locale}
                            type="button"
                            onClick={() => setActiveLocale(locale)}
                            className={`rounded-lg px-3.5 py-1.5 text-xs font-medium uppercase transition-colors ${
                                activeLocale === locale
                                    ? 'bg-white text-indigo-600 shadow-sm dark:bg-[#0F1626] dark:text-indigo-400'
                                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                            }`}
                        >
                            {locale}
                        </button>
                    ))}
                </div>
            </div>

            <Input
                label={t('blog.categories.form.name', 'Name')}
                value={active.name}
                placeholder={t('blog.categories.form.namePlaceholder', 'Category name')}
                onChange={(event) => updateTranslation(activeLocale, 'name', event.target.value)}
            />

            <Input
                label={t('blog.categories.form.slug', 'Slug')}
                value={active.slug}
                placeholder={t('blog.categories.form.slugPlaceholder', 'category-slug')}
                onChange={(event) => updateTranslation(activeLocale, 'slug', event.target.value)}
            />

            <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    {t('blog.categories.form.description', 'Description')}
                </label>
                <textarea
                    value={active.description}
                    rows={3}
                    onChange={(event) => updateTranslation(activeLocale, 'description', event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-white/[0.08] dark:bg-slate-900/60 dark:text-white"
                />
            </div>

            <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                    {t('blog.categories.form.cancel', 'Cancel')}
                </Button>
                <Button type="submit" isLoading={isSubmitting}>
                    {category
                        ? t('blog.categories.form.save', 'Save changes')
                        : t('blog.categories.form.create', 'Create category')}
                </Button>
            </div>
        </form>
    );
}
