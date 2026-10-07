import { useForm, usePage } from '@inertiajs/react';
import { route } from '@/lib/route';
import type { SharedProps } from '@/types';

interface CommentFormProps {
    postId: string;
    parentId?: string;
    compact?: boolean;
    submitLabel?: string;
}

export default function CommentForm({
    postId,
    parentId,
    compact = false,
    submitLabel = 'Submit comment',
}: CommentFormProps) {
    const { auth } = usePage<SharedProps>().props;

    const form = useForm({
        name: auth.user?.name ?? '',
        email: auth.user?.email ?? '',
        content: '',
        parent_id: parentId ?? '',
    });

    const submit = (event: React.FormEvent): void => {
        event.preventDefault();

        form.post(route('default.comments.store', { post: postId }), {
            preserveScroll: true,
            onSuccess: () => form.reset('content', 'parent_id'),
        });
    };

    return (
        <form onSubmit={submit} className="space-y-3">
            <div className={compact ? 'grid gap-3' : 'grid gap-3 sm:grid-cols-2'}>
                <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-600">Name</label>
                    <input
                        type="text"
                        value={form.data.name}
                        onChange={(event) => form.setData('name', event.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                    {form.errors.name && (
                        <p className="mt-1 text-xs text-rose-500">{form.errors.name}</p>
                    )}
                </div>

                <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-600">Email</label>
                    <input
                        type="email"
                        value={form.data.email}
                        onChange={(event) => form.setData('email', event.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                    {form.errors.email && (
                        <p className="mt-1 text-xs text-rose-500">{form.errors.email}</p>
                    )}
                </div>
            </div>

            <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Comment</label>
                <textarea
                    value={form.data.content}
                    onChange={(event) => form.setData('content', event.target.value)}
                    rows={compact ? 3 : 4}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                {form.errors.content && (
                    <p className="mt-1 text-xs text-rose-500">{form.errors.content}</p>
                )}
            </div>

            <button
                type="submit"
                disabled={form.processing}
                className="inline-flex items-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-60"
            >
                {submitLabel}
            </button>
        </form>
    );
}
