import AdminLayout from '@modules/admin/resources/views/layouts/AdminLayout';
import PageHeader from '@/components/ui/PageHeader';
import { useTranslation } from '@/hooks/useTranslation';
import WidgetsEditor from './components/WidgetsEditor';
import type { SidebarDefinition, SidebarWidgetItem, WidgetDefinition } from './types';

interface WidgetsProps {
    title: string;
    widgets: WidgetDefinition[];
    sidebars: SidebarDefinition[];
    sidebar_widgets: Record<string, SidebarWidgetItem[]>;
    locale: string;
    theme: string | null;
    abilities: { update: boolean };
}

export default function Widgets({
    title,
    widgets,
    sidebars,
    sidebar_widgets,
    locale,
    theme,
    abilities,
}: WidgetsProps) {
    const { t } = useTranslation();

    return (
        <AdminLayout title={title}>
            <PageHeader
                title={title}
                description={t('admin.widgets.subtitle', 'Manage the widgets displayed in your theme sidebars.')}
            />

            <WidgetsEditor
                key={JSON.stringify(sidebar_widgets)}
                widgets={widgets}
                sidebars={sidebars}
                sidebarWidgets={sidebar_widgets}
                theme={theme}
                locale={locale}
                canUpdate={abilities.update}
            />
        </AdminLayout>
    );
}
