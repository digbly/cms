import type { Widget } from '@/types';
import WidgetRenderer from '@/components/WidgetRenderer';

export default function Sidebar({ widgets }: { widgets: Widget[] }) {
    if (widgets.length === 0) {
        return <aside className="hidden lg:block" />;
    }

    return (
        <aside className="space-y-6">
            {widgets.map((widget, index) => (
                <WidgetRenderer key={`${widget.key}-${index}`} widget={widget} />
            ))}
        </aside>
    );
}
