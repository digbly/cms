import type { ComponentType } from 'react';
import type { Widget } from '@/types';
import Categories from '@/components/widgets/Categories';
import RecentPosts from '@/components/widgets/RecentPosts';
import PopularPosts from '@/components/widgets/PopularPosts';

const registry: Record<string, ComponentType<{ widget: Widget }>> = {
    'Widgets/Categories': Categories,
    'Widgets/RecentPosts': RecentPosts,
    'Widgets/PopularPosts': PopularPosts,
};

export default function WidgetRenderer({ widget }: { widget: Widget }) {
    const Component = widget.component ? registry[widget.component] : undefined;

    if (!Component) {
        return null;
    }

    return <Component widget={widget} />;
}
