import type { ComponentType } from 'react';
import type { Block } from '@/types';
import Hero from '@/components/blocks/Hero';
import Posts from '@/components/blocks/Posts';

const registry: Record<string, ComponentType<{ block: Block }>> = {
    'Blocks/Hero': Hero,
    'Blocks/Posts': Posts,
};

export default function BlockRenderer({ block }: { block: Block }) {
    const Component = block.component ? registry[block.component] : undefined;

    if (!Component) {
        return null;
    }

    return <Component block={block} />;
}
