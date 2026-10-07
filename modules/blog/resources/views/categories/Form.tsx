import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import AdminLayout from '@modules/admin/resources/views/layouts/AdminLayout';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { route } from '@/lib/route';
import { useTranslation } from '@/hooks/useTranslation';
import CategoryForm from '../components/CategoryForm';
import { firstError } from '../lib';
import type { AdminCategory, CategoryPayload } from '../types';

interface CategoryFormPageProps {
    title: string;
    category: AdminCategory | null;
    categories: AdminCategory[];
}

export default function CategoryFormPage({ title, category, categories }: CategoryFormPageProps) {
    const { t } = useTranslation();

    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const backUrl = route('admin.blog.categories.index');

    const submit = (payload: CategoryPayload) => {
        setError(null);

        const url = category
            ? route('admin.blog.categories.update', { category: category.id })
            : route('admin.blog.categories.store');

        const options = {
            preserveScroll: true,
            onStart: () => setProcessing(true),
            onFinish: () => setProcessing(false),
            onError: (errors: Record<string, string>) => setError(firstError(errors)),
        };

        if (category) {
            router.put(url, payload as unknown as Parameters<typeof router.put>[1], options);
        } else {
            router.post(url, payload as unknown as Parameters<typeof router.post>[1], options);
        }
    };

    return (
        <AdminLayout title={title}>
            <div className="mb-6 flex flex-col gap-3">
                <Link href={backUrl} className="w-fit">
                    <Button variant="ghost" size="sm" className="-ml-2" leftIcon={<ArrowLeft className="h-4 w-4" />}>
                        {t('blog.categories.form.back', 'Back to categories')}
                    </Button>
                </Link>

                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                    <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                        {t('blog.categories.form.subtitle', 'Fill in the category details below.')}
                    </p>
                </div>
            </div>

            <Card className="p-5">
                <CategoryForm
                    category={category}
                    categories={categories}
                    isSubmitting={processing}
                    error={error}
                    onSubmit={submit}
                    onCancel={() => router.visit(backUrl)}
                />
            </Card>
        </AdminLayout>
    );
}
