import { useRef, useState, type FormEvent } from 'react';
import Button from '@/components/ui/Button';
import ErrorAlert from '@/components/ui/ErrorAlert';
import Input from '@/components/ui/Input';
import RichTextEditor from '@/components/ui/RichTextEditor';
import MediaPickerModal from '@modules/admin/resources/views/components/MediaPickerModal';
import { useTranslation } from '@/hooks/useTranslation';
import type { AdminCategory, AdminPost, PostPayload, PostStatus, PostTranslation } from '../types';
import { LOCALES, slugify } from '../lib';

interface TranslationDraft {
    title: string;
    slug: string;
    description: string;
    content: string;
}

const emptyTranslation = (): TranslationDraft => ({ title: '', slug: '', description: '', content: '' });

const buildTranslations = (post: AdminPost | null): Record<string, TranslationDraft> => {
    const drafts: Record<string, TranslationDraft> = {};

    LOCALES.forEach((locale) => {
        const existing = post?.translations.find((translation) => translation.locale === locale);
        drafts[locale] = existing
            ? {
                  title: existing.title ?? '',
                  slug: existing.slug ?? '',
                  description: existing.description ?? '',
                  content: existing.content ?? '',
              }
            : emptyTranslation();
    });

    return drafts;
};

interface PostFormProps {
    post: AdminPost | null;
    categories: AdminCategory[];
    isSubmitting: boolean;
    error: string | null;
    onSubmit: (payload: PostPayload) => void;
    onCancel: () => void;
}

export default function PostForm({ post, categories, isSubmitting, error, onSubmit, onCancel }: PostFormProps) {
    const { t } = useTranslation();

    const [status, setStatus] = useState<PostStatus>(post?.status ?? 'draft');
    const [categoryIds, setCategoryIds] = useState<string[]>(
        post?.categories.map((category) => category.id) ?? []
    );
    const [translations, setTranslations] = useState<Record<string, TranslationDraft>>(() =>
        buildTranslations(post)
    );
    const [activeLocale, setActiveLocale] = useState<string>(LOCALES[0]);
    const [localError, setLocalError] = useState<string | null>(null);
    const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
    const insertImageRef = useRef<((url: string, alt?: string) => void) | null>(null);

    const updateTranslation = (locale: string, field: keyof TranslationDraft, value: string) => {
        setTranslations((current) => ({
            ...current,
            [locale]: { ...current[locale], [field]: value },
        }));
    };

    const toggleCategory = (id: string) => {
        setCategoryIds((current) =>
            current.includes(id) ? current.filter((value) => value !== id) : [...current, id]
        );
    };

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();
        setLocalError(null);

        const payload: PostTranslation[] = LOCALES.map((locale) => {
            const draft = translations[locale];
            const slug = draft.slug.trim() || slugify(draft.title);

            return {
                locale,
                title: draft.title.trim(),
                slug,
                description: draft.description.trim() || null,
                content: draft.content.trim() || null,
            };
        }).filter((translation) => translation.title !== '');

        if (payload.length === 0) {
            setLocalError(
                t('blog.posts.form.titleRequired', 'A title is required for {{locale}}.').replace(
                    '{{locale}}',
                    LOCALES[0].toUpperCase()
                )
            );

            return;
        }

        onSubmit({ status, categories: categoryIds, translations: payload });
    };

    const active = translations[activeLocale] ?? emptyTranslation();

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {(error || localError) && <ErrorAlert message={error ?? localError ?? ''} />}

            <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    {t('blog.posts.form.status', 'Status')}
                </label>
                <select
                    value={status}
                    onChange={(event) => setStatus(event.target.value as PostStatus)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-white/[0.08] dark:bg-slate-900/60 dark:text-white"
                >
                    <option value="draft">{t('blog.posts.filters.draft', 'Draft')}</option>
                    <option value="published">{t('blog.posts.filters.published', 'Published')}</option>
                </select>
            </div>

            <div>
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    {t('blog.posts.form.locale', 'Language')}
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
                label={t('blog.posts.form.title', 'Title')}
                value={active.title}
                placeholder={t('blog.posts.form.titlePlaceholder', 'Post title')}
                onChange={(event) => updateTranslation(activeLocale, 'title', event.target.value)}
            />

            <Input
                label={t('blog.posts.form.slug', 'Slug')}
                value={active.slug}
                placeholder={t('blog.posts.form.slugPlaceholder', 'post-slug')}
                onChange={(event) => updateTranslation(activeLocale, 'slug', event.target.value)}
            />

            <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    {t('blog.posts.form.description', 'Description')}
                </label>
                <textarea
                    value={active.description}
                    rows={2}
                    onChange={(event) => updateTranslation(activeLocale, 'description', event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-white/[0.08] dark:bg-slate-900/60 dark:text-white"
                />
            </div>

            <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    {t('blog.posts.form.content', 'Content')}
                </label>
                <RichTextEditor
                    key={activeLocale}
                    value={active.content}
                    placeholder={t('blog.posts.form.contentPlaceholder', 'Write your post content...')}
                    mediaLabel={t('admin.media.insertImage', 'Insert image')}
                    onRequestMedia={(insert) => {
                        insertImageRef.current = insert;
                        setIsMediaPickerOpen(true);
                    }}
                    onChange={(content) => updateTranslation(activeLocale, 'content', content)}
                />
            </div>

            <div>
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    {t('blog.posts.form.categories', 'Categories')}
                </span>
                {categories.length === 0 ? (
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                        {t('blog.posts.form.noCategories', 'No categories yet.')}
                    </p>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {categories.map((category) => (
                            <label
                                key={category.id}
                                className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors ${
                                    categoryIds.includes(category.id)
                                        ? 'border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                                        : 'border-slate-200 bg-slate-50/80 text-slate-600 dark:border-white/[0.08] dark:bg-slate-900/60 dark:text-slate-400'
                                }`}
                            >
                                <input
                                    type="checkbox"
                                    className="sr-only"
                                    checked={categoryIds.includes(category.id)}
                                    onChange={() => toggleCategory(category.id)}
                                />
                                {category.name}
                            </label>
                        ))}
                    </div>
                )}
            </div>

            <MediaPickerModal
                open={isMediaPickerOpen}
                onClose={() => setIsMediaPickerOpen(false)}
                onSelect={(item) => {
                    insertImageRef.current?.(item.url ?? '', item.title ?? item.file_name ?? '');
                    setIsMediaPickerOpen(false);
                }}
            />

            <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                    {t('blog.posts.form.cancel', 'Cancel')}
                </Button>
                <Button type="submit" isLoading={isSubmitting}>
                    {post ? t('blog.posts.form.save', 'Save changes') : t('blog.posts.form.create', 'Create post')}
                </Button>
            </div>
        </form>
    );
}
