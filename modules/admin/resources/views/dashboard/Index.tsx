import { Activity } from 'lucide-react';
import AdminLayout from '../layouts/AdminLayout';
import Card from '@/components/ui/Card';
import PageHeader from '@/components/ui/PageHeader';
import { useTranslation } from '@/hooks/useTranslation';

interface Stat {
    label: string;
    value: string | number;
}

interface DashboardProps {
    title: string;
    stats: Stat[];
}

export default function Dashboard({ title, stats = [] }: DashboardProps) {
    const { t } = useTranslation();

    return (
        <AdminLayout title={title}>
            <PageHeader
                title={title}
                description={t('admin.dashboard.subtitle', 'Overview of your site activity and content.')}
            />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {stats.map((stat) => (
                    <Card key={stat.label} className="group relative overflow-hidden p-6 transition hover:shadow-md hover:shadow-indigo-500/5">
                        <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-indigo-500/5 transition group-hover:bg-indigo-500/10" />

                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                                <Activity className="h-4.5 w-4.5" />
                            </span>
                        </div>

                        <p className="mt-4 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                            {stat.value}
                        </p>
                    </Card>
                ))}
            </div>
        </AdminLayout>
    );
}
