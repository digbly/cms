import { useRef, useState, type DragEvent, type FormEvent } from 'react';
import { router } from '@inertiajs/react';
import { useForm } from 'react-hook-form';
import { Copy, ExternalLink, FileText, FolderOpen, Image as ImageIcon, Search, Trash2, UploadCloud } from 'lucide-react';
import AdminLayout from '@modules/admin/resources/views/layouts/AdminLayout';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import PageHeader from '@/components/ui/PageHeader';
import Pagination from '@/components/ui/Pagination';
import { submitForm } from '@/lib/inertia-form';
import { route } from '@/lib/route';
import { useTranslation } from '@/hooks/useTranslation';

interface MediaRow {
    id: string;
    title: string | null;
    alt: string | null;
    caption: string | null;
    description: string | null;
    name: string | null;
    file_name: string | null;
    mime_type: string | null;
    extension: string | null;
    size: number | null;
    size_formatted: string | null;
    url: string | null;
    thumb_url: string | null;
    width: number | null;
    height: number | null;
    is_image: boolean;
}

interface PaginationMeta {
    current_page: number;
    last_page: number;
    total: number;
}

interface MediaProps {
    title: string;
    items: {
        data: MediaRow[];
        meta: PaginationMeta;
    };
    filters: { search: string | null; type: string | null; month: string | null };
    abilities: { create: boolean; update: boolean; delete: boolean };
}

interface DetailsForm {
    title: string;
    alt: string;
    caption: string;
    description: string;
}

type TypeFilter = 'all' | 'image' | 'document';

export default function Media({ title, items, filters, abilities }: MediaProps) {
    const { t } = useTranslation();

    const [search, setSearch] = useState(filters.search ?? '');
    const [uploading, setUploading] = useState(false);
    const [dragging, setDragging] = useState(false);
    const [detail, setDetail] = useState<MediaRow | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<MediaRow | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const indexUrl = route('admin.media.index');

    const applyFilters = (overrides: Record<string, string | null> = {}) => {
        const merged = { search, type: filters.type, month: filters.month, ...overrides };
        const params: Record<string, string> = {};

        Object.entries(merged).forEach(([key, value]) => {
            if (value && value !== 'all') {
                params[key] = value;
            }
        });

        router.get(indexUrl, params, { preserveState: true, replace: true });
    };

    const onSearch = (event: FormEvent) => {
        event.preventDefault();
        applyFilters({ search });
    };

    const uploadFiles = (fileList: FileList | null) => {
        if (!fileList || fileList.length === 0) {
            return;
        }

        const data = new FormData();
        Array.from(fileList).forEach((file) => data.append('files[]', file));

        setUploading(true);
        router.post(route('admin.media.store'), data, {
            preserveScroll: true,
            onFinish: () => setUploading(false),
        });
    };

    const onDrop = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setDragging(false);
        uploadFiles(event.dataTransfer.files);
    };

    const copyUrl = (item: MediaRow) => {
        if (item.url) {
            navigator.clipboard.writeText(item.url);
        }
    };

    const detailsForm = useForm<DetailsForm>({
        values: detail
            ? {
                  title: detail.title ?? '',
                  alt: detail.alt ?? '',
                  caption: detail.caption ?? '',
                  description: detail.description ?? '',
              }
            : { title: '', alt: '', caption: '', description: '' },
    });

    const submitDetails = detailsForm.handleSubmit((data) => {
        if (!detail) {
            return;
        }

        return submitForm(route('admin.media.update', { media: detail.id }), data, {
            method: 'put',
            setError: detailsForm.setError,
            preserveScroll: true,
            onSuccess: () => setDetail(null),
        });
    });

    const confirmDelete = () => {
        if (!deleteTarget) {
            return;
        }

        router.delete(route('admin.media.destroy', { media: deleteTarget.id }), {
            preserveScroll: true,
            onFinish: () => {
                setDeleteTarget(null);
                setDetail(null);
            },
        });
    };

    const tabs: { key: TypeFilter; label: string; Icon: typeof ImageIcon }[] = [
        { key: 'all', label: t('admin.media.filters.all', 'All media'), Icon: FolderOpen },
        { key: 'image', label: t('admin.media.filters.image', 'Images'), Icon: ImageIcon },
        { key: 'document', label: t('admin.media.filters.document', 'Documents'), Icon: FolderOpen },
    ];

    return (
        <AdminLayout title={title}>
            <PageHeader
                title={title}
                description={t('admin.media.subtitle', 'Upload, organise and reuse images and documents.')}
            />

            {abilities.create && (
                <div
                    role="button"
                    tabIndex={0}
                    onClick={() => !uploading && inputRef.current?.click()}
                    onKeyDown={(event) => {
                        if ((event.key === 'Enter' || event.key === ' ') && !uploading) {
                            inputRef.current?.click();
                        }
                    }}
                    onDragOver={(event) => {
                        event.preventDefault();
                        setDragging(true);
                    }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={onDrop}
                    className={`mb-6 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-8 text-center transition-colors ${
                        dragging
                            ? 'border-indigo-500 bg-indigo-500/5'
                            : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-900/40'
                    } ${uploading ? 'pointer-events-none opacity-70' : ''}`}
                >
                    <input
                        ref={inputRef}
                        type="file"
                        multiple
                        accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx"
                        className="hidden"
                        onChange={(event) => uploadFiles(event.target.files)}
                    />
                    <UploadCloud className="h-6 w-6 text-slate-400" />
                    <p className="text-sm font-medium">
                        {uploading
                            ? t('admin.media.dropzone.uploading', 'Uploading...')
                            : t('admin.media.dropzone.title', 'Click or drag files here to upload')}
                    </p>
                </div>
            )}

            <div className="mb-4 flex flex-wrap items-center gap-3">
                <div className="flex gap-1 rounded-xl border border-slate-200 p-1 dark:border-white/10">
                    {tabs.map(({ key, label, Icon }) => (
                        <button
                            key={key}
                            type="button"
                            onClick={() => applyFilters({ type: key })}
                            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                                (filters.type ?? 'all') === key
                                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                                    : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                            }`}
                        >
                            <Icon className="h-3.5 w-3.5" />
                            {label}
                        </button>
                    ))}
                </div>

                <form onSubmit={onSearch} className="flex flex-1 items-center gap-3">
                    <div className="min-w-[180px] flex-1">
                        <Input
                            placeholder={t('admin.media.filters.searchPlaceholder', 'Search media...')}
                            leftIcon={<Search className="h-4 w-4" />}
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                        />
                    </div>
                    <input
                        type="month"
                        value={filters.month ?? ''}
                        onChange={(event) => applyFilters({ month: event.target.value })}
                        className="rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2.5 text-sm text-slate-900 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-white/[0.08] dark:bg-slate-900/60 dark:text-white"
                    />
                </form>
            </div>

            {items.data.length === 0 ? (
                <Card>
                    <EmptyState
                        icon={FolderOpen}
                        title={t('admin.media.empty', 'No media found.')}
                        description={t('admin.media.emptyHint', 'Upload files or adjust your filters.')}
                    />
                </Card>
            ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                    {items.data.map((item) => (
                        <div
                            key={item.id}
                            className="group overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-900/5 transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-slate-900/60 dark:shadow-black/20"
                        >
                            <button
                                type="button"
                                onClick={() => setDetail(item)}
                                className="flex h-32 w-full items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-800/60"
                            >
                                {item.is_image && item.url ? (
                                    <img
                                        src={item.thumb_url ?? item.url}
                                        alt={item.alt ?? item.title ?? ''}
                                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                    />
                                ) : (
                                    <FileText className="h-8 w-8 text-slate-400" />
                                )}
                            </button>

                            <div className="flex items-center justify-between gap-2 p-2.5">
                                <div className="min-w-0">
                                    <p className="truncate text-xs font-medium text-slate-700 dark:text-slate-200">
                                        {item.title ?? item.file_name}
                                    </p>
                                    <p className="text-[10px] text-slate-400">{item.size_formatted}</p>
                                </div>
                                <div className="flex shrink-0 gap-0.5">
                                    <button
                                        type="button"
                                        title={t('admin.media.details.copyUrl', 'Copy URL')}
                                        onClick={() => copyUrl(item)}
                                        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-800"
                                    >
                                        <Copy className="h-3.5 w-3.5" />
                                    </button>
                                    {abilities.delete && (
                                        <button
                                            type="button"
                                            title={t('admin.media.details.delete', 'Delete')}
                                            onClick={() => setDeleteTarget(item)}
                                            className="rounded-lg p-1.5 text-rose-500 transition hover:bg-rose-50 dark:hover:bg-rose-500/10"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Pagination
                meta={items.meta}
                onPageChange={(page) => applyFilters({ page: String(page) })}
                className="mt-6"
            />

            <Modal
                open={detail !== null}
                title={t('admin.media.details.title', 'Media details')}
                onClose={() => setDetail(null)}
            >
                {detail && (
                    <div className="grid gap-5 sm:grid-cols-2">
                        <div className="space-y-3">
                            <div className="flex min-h-[160px] items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-slate-800/60">
                                {detail.is_image && detail.url ? (
                                    <img src={detail.url} alt={detail.alt ?? ''} className="max-h-60 object-contain" />
                                ) : detail.url ? (
                                    <a
                                        href={detail.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex flex-col items-center gap-2 text-sm text-indigo-600"
                                    >
                                        <ExternalLink className="h-6 w-6" />
                                        {t('admin.media.details.openInNewTab', 'Open in new tab')}
                                    </a>
                                ) : (
                                    <span className="text-sm text-slate-400">
                                        {t('admin.media.details.previewUnavailable', 'Preview unavailable')}
                                    </span>
                                )}
                            </div>
                            <dl className="space-y-1 text-xs">
                                <div className="flex justify-between gap-3">
                                    <dt className="text-slate-500">{t('admin.media.details.meta.file', 'File')}</dt>
                                    <dd className="truncate font-medium">{detail.file_name ?? '—'}</dd>
                                </div>
                                <div className="flex justify-between gap-3">
                                    <dt className="text-slate-500">{t('admin.media.details.meta.type', 'Type')}</dt>
                                    <dd className="font-medium">{detail.mime_type ?? '—'}</dd>
                                </div>
                                <div className="flex justify-between gap-3">
                                    <dt className="text-slate-500">{t('admin.media.details.meta.size', 'Size')}</dt>
                                    <dd className="font-medium">{detail.size_formatted ?? '—'}</dd>
                                </div>
                            </dl>
                        </div>

                        <form onSubmit={submitDetails} className="space-y-3">
                            <Input
                                label={t('admin.media.details.fields.title', 'Title')}
                                error={detailsForm.formState.errors.title?.message}
                                {...detailsForm.register('title')}
                            />
                            <Input
                                label={t('admin.media.details.fields.alt', 'Alt text')}
                                error={detailsForm.formState.errors.alt?.message}
                                {...detailsForm.register('alt')}
                            />
                            <Input
                                label={t('admin.media.details.fields.caption', 'Caption')}
                                error={detailsForm.formState.errors.caption?.message}
                                {...detailsForm.register('caption')}
                            />

                            {abilities.update && (
                                <Button type="submit" isLoading={detailsForm.formState.isSubmitting}>
                                    {t('admin.media.details.save', 'Save')}
                                </Button>
                            )}
                        </form>
                    </div>
                )}
            </Modal>

            <Modal
                open={deleteTarget !== null}
                title={t('admin.media.deleteDialog.title', 'Delete media')}
                onClose={() => setDeleteTarget(null)}
            >
                <p className="mb-5 text-sm text-slate-600 dark:text-slate-300">
                    {t('admin.media.deleteDialog.description', 'Are you sure you want to delete this file? This cannot be undone.')}
                </p>
                <div className="flex justify-end gap-2">
                    <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
                        {t('admin.media.deleteDialog.cancel', 'Cancel')}
                    </Button>
                    <Button variant="danger" onClick={confirmDelete}>
                        {t('admin.media.deleteDialog.confirm', 'Delete')}
                    </Button>
                </div>
            </Modal>
        </AdminLayout>
    );
}
