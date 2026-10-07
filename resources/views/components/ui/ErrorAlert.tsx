import { AlertCircle } from 'lucide-react';

interface ErrorAlertProps {
    message: string;
}

export default function ErrorAlert({ message }: ErrorAlertProps) {
    return (
        <div className="flex items-center gap-2.5 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-600 dark:text-rose-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{message}</span>
        </div>
    );
}
