import type { Block } from '@/types';

export default function Hero({ block }: { block: Block }) {
    const title = (block.data.title as string | undefined) ?? block.label;
    const description = (block.data.description as string | undefined) ?? '';

    return (
        <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-600 px-8 py-14 text-white">
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">{title}</h1>
            {description && (
                <p className="mt-3 max-w-2xl text-base leading-7 text-indigo-100">
                    {description}
                </p>
            )}
        </section>
    );
}
