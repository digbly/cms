import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    open: boolean;
    title?: string;
    onClose: () => void;
    children: ReactNode;
}

export default function Modal({ open, title, onClose, children }: ModalProps) {
    useEffect(() => {
        if (!open) {
            return;
        }

        const onKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', onKey);

        return () => document.removeEventListener('keydown', onKey);
    }, [open, onClose]);

    if (!open) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" onClick={onClose} />

            <div
                role="dialog"
                aria-modal="true"
                aria-label={title}
                className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xl shadow-slate-900/20 dark:border-white/10 dark:bg-slate-900 dark:shadow-black/50"
            >
                <div className="mb-4 flex items-center justify-between">
                    {title && <h2 className="text-lg font-semibold tracking-tight">{title}</h2>}
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {children}
            </div>
        </div>
    );
}
