import { useState } from 'react';
import { ImagePlus, X } from 'lucide-react';
import Button from '@/components/ui/Button';
import MediaPickerModal, { type MediaItemSummary } from './MediaPickerModal';

export interface MediaPreview {
    url: string | null;
    thumb_url: string | null;
}

interface MediaFieldProps {
    label: string;
    value: string | null;
    preview: MediaPreview | null;
    onChange: (id: string | null) => void;
}

export default function MediaField({ label, value, preview, onChange }: MediaFieldProps) {
    const [open, setOpen] = useState(false);
    const [selection, setSelection] = useState<MediaPreview | null>();

    const current = selection === undefined ? preview : selection;

    const choose = (item: MediaItemSummary) => {
        setSelection(item);
        onChange(item.id);
        setOpen(false);
    };

    const remove = () => {
        setSelection(null);
        onChange(null);
    };

    return (
        <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                {label}
            </p>

            <div className="flex items-center gap-3">
                <span className="flex h-16 w-24 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/60">
                    {current?.url ? (
                        <img
                            src={current.thumb_url ?? current.url}
                            alt={label}
                            className="h-full w-full object-contain"
                        />
                    ) : (
                        <ImagePlus className="h-5 w-5 text-slate-400" />
                    )}
                </span>

                <div className="flex flex-col items-start gap-1">
                    <Button type="button" variant="secondary" size="sm" onClick={() => setOpen(true)}>
                        {value ? 'Replace' : 'Choose'}
                    </Button>
                    {value && (
                        <button
                            type="button"
                            onClick={remove}
                            className="inline-flex items-center gap-1 text-xs text-rose-500 hover:underline"
                        >
                            <X className="h-3 w-3" />
                            Remove
                        </button>
                    )}
                </div>
            </div>

            <MediaPickerModal open={open} onClose={() => setOpen(false)} onSelect={choose} />
        </div>
    );
}
