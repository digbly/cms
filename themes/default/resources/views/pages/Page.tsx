import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import BlockRenderer from '@/components/BlockRenderer';
import type { Block, NavItem, PageTemplate, Widget } from '@/types';

interface PageProps {
    siteName: string;
    siteLogo: string | null;
    messages: Record<string, string>;
    navMenu: NavItem[];
    sidebarWidgets: Widget[];
    heading: string | null;
    content: string | null;
    template: PageTemplate | null;
    blocks: Record<string, Block[]>;
}

export default function Page({
    siteName,
    siteLogo,
    messages,
    navMenu,
    sidebarWidgets,
    heading,
    content,
    template,
    blocks,
}: PageProps) {
    const hasBlocks = template !== null && Object.keys(blocks).length > 0;

    return (
        <AppLayout
            siteName={siteName}
            siteLogo={siteLogo}
            navMenu={navMenu}
            sidebarWidgets={sidebarWidgets}
        >
            <Head title={heading ?? ''} />

            {hasBlocks ? (
                <div className="space-y-10">
                    {Object.entries(template.blocks).map(([container]) => (
                        <div key={container} className="space-y-6">
                            {(blocks[container] ?? []).map((block) => (
                                <BlockRenderer key={block.id} block={block} />
                            ))}
                        </div>
                    ))}
                </div>
            ) : (
                <article>
                    {heading && (
                        <h1 className="mb-6 text-3xl font-bold tracking-tight text-slate-900">
                            {heading}
                        </h1>
                    )}

                    {content ? (
                        <div
                            className="article-content"
                            dangerouslySetInnerHTML={{ __html: content }}
                        />
                    ) : (
                        <p className="text-sm text-slate-500">{messages.no_content}</p>
                    )}
                </article>
            )}
        </AppLayout>
    );
}
