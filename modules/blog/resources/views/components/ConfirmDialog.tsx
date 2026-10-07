import type { ReactNode } from 'react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    description: ReactNode;
    confirmLabel: string;
    cancelLabel: string;
    isLoading?: boolean;
    variant?: 'primary' | 'danger';
    onConfirm: () => void;
    onClose: () => void;
}

export default function ConfirmDialog({
    isOpen,
    title,
    description,
    confirmLabel,
    cancelLabel,
    isLoading = false,
    variant = 'primary',
    onConfirm,
    onClose,
}: ConfirmDialogProps) {
    return (
        <Modal open={isOpen} title={title} onClose={onClose}>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{description}</p>
            <div className="mt-6 flex justify-end gap-3">
                <Button variant="outline" onClick={onClose} disabled={isLoading}>
                    {cancelLabel}
                </Button>
                <Button variant={variant} onClick={onConfirm} isLoading={isLoading}>
                    {confirmLabel}
                </Button>
            </div>
        </Modal>
    );
}
