import { useEffect, useState } from 'react';
import axios from 'axios';
import { ImageOff, Loader2, Search } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import { route } from '@/lib/route';

export interface MediaItemSummary {
    id: string;
    title: string | null;
    file_name: string | null;
    url: string | null;
    thumb_url: string | null;
    is_image: boolean;
}

interface MediaPickerModalProps {
    open: boolean;
    onClose: () => void;
    onSelect: (item: MediaItemSummary) => void;
}

interface MediaListResponse {
    data: MediaItemSummary[];
    meta: { current_page: number; last_page: number; total: number };
}

export default function MediaPickerModal({ open, onClose, onSelect }: MediaPickerModalProps) {

    const [items, setItems] = useState<MediaItemSummary[]>([]);
    const [meta, setMeta] = useState<MediaListResponse['meta'] | null>(null);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!open) {
            return;
        }

        let active = true;
        setLoading(true);

        axios
            .get<MediaListResponse>(route('admin.media.list'), {
                params: { search: search || undefined, type: 'image', page, per_page: 24 },
            })
            .then((response) => {
                if (!active) {
                    return;
                }

                setItems(response.data.data);
                setMeta(response.data.meta);
            })
            .finally(() => active && setLoading(false));

        return () => {
            active = false;
        };
    }, [open, search, page]);

    return (
        <Modal open={open} title="Insert media" onClose={onClose}>
            <div className="space-y-4">
                <Input
                    placeholder="Search media..."
                    leftIcon={<Search className="h-4 w-4" />}
                    value={search}
                    onChange={(event) => {
                        setSearch(event.target.value);
                        setPage(1);
                    }}
                />

                <div className="max-h-80 overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center py-12 text-slate-400">
                            <Loader2 className="h-5 w-5 animate-spin" />
                        </div>
                    ) : items.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 py-12 text-slate-400">
                            <ImageOff className="h-6 w-6" />
                            <p className="text-sm">No media available.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                            {items.map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => onSelect(item)}
                                    className="overflow-hidden rounded-lg border border-slate-200 transition hover:border-indigo-500 dark:border-slate-700"
                                >
                                    <span className="flex h-20 items-center justify-center bg-slate-50 dark:bg-slate-800/60">
                                        {item.is_image && item.url ? (
                                            <img
                                                src={item.thumb_url ?? item.url}
                                                alt={item.title ?? item.file_name ?? ''}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <ImageOff className="h-5 w-5 text-slate-400" />
                                        )}
                                    </span>
                                    <span className="block truncate px-2 py-1 text-left text-[10px] text-slate-500">
                                        {item.title ?? item.file_name}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {meta && meta.last_page > 1 && (
                    <div className="flex items-center justify-between text-xs text-slate-500">
                        <button
                            type="button"
                            disabled={page <= 1}
                            onClick={() => setPage((value) => value - 1)}
                            className="rounded px-2 py-1 hover:bg-slate-100 disabled:opacity-40 dark:hover:bg-slate-800"
                        >
                            Previous
                        </button>
                        <span>
                            {meta.current_page} / {meta.last_page}
                        </span>
                        <button
                            type="button"
                            disabled={page >= meta.last_page}
                            onClick={() => setPage((value) => value + 1)}
                            className="rounded px-2 py-1 hover:bg-slate-100 disabled:opacity-40 dark:hover:bg-slate-800"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </Modal>
    );
}
