import { Link } from '@inertiajs/react';
import type { Category, Widget } from '@/types';

export default function Categories({ widget }: { widget: Widget }) {
    const categories = (widget.data.categories as Category[] | undefined) ?? [];

    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-900">
                {widget.label}
            </h3>

            {categories.length === 0 ? (
                <p className="text-sm text-slate-500">No categories yet.</p>
            ) : (
                <ul className="space-y-1.5">
                    {categories.map((category) => (
                        <li key={category.id}>
                            <Link
                                href={category.url ?? '#'}
                                className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-indigo-600"
                            >
                                <span>{category.name}</span>
                                {typeof category.posts_count === 'number' && (
                                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
                                        {category.posts_count}
                                    </span>
                                )}
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
