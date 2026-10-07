import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import AdminLayout from '@modules/admin/resources/views/layouts/AdminLayout';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { route } from '@/lib/route';
import { useTranslation } from '@/hooks/useTranslation';
import PostForm from '../components/PostForm';
import { firstError } from '../lib';
import type { AdminCategory, AdminPost, PostPayload } from '../types';

interface PostFormPageProps {
    title: string;
    post: AdminPost | null;
    categories: AdminCategory[];
}

export default function PostFormPage({ title, post, categories }: PostFormPageProps) {
    const { t } = useTranslation();

    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const backUrl = route('admin.blog.posts.index');

    const submit = (payload: PostPayload) => {
        setError(null);

        const url = post
            ? route('admin.blog.posts.update', { post: post.id })
            : route('admin.blog.posts.store');

        const options = {
            preserveScroll: true,
            onStart: () => setProcessing(true),
            onFinish: () => setProcessing(false),
            onError: (errors: Record<string, string>) => setError(firstError(errors)),
        };

        if (post) {
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
                        {t('blog.posts.form.back', 'Back to posts')}
                    </Button>
                </Link>

                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                    <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                        {t('blog.posts.form.subtitle', 'Fill in the post details below.')}
                    </p>
                </div>
            </div>

            <Card className="p-5">
                <PostForm
                    post={post}
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
