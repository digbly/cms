import type { FC } from 'react';
import Input from '@/components/ui/Input';
import { useTranslation } from '@/hooks/useTranslation';
import type { WidgetFormProps } from './types';

interface BlogWidgetFormProps extends WidgetFormProps {
    withLimit?: boolean;
}

const toNumber = (value: unknown, fallback: number): number => {
    const parsed = Number(value);

    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

/**
 * Shared form used by the bundled blog widgets. Widgets that expose a limit
 * render an extra numeric field; the rest only edit the heading.
 */
export const BlogWidgetForm: FC<BlogWidgetFormProps> = ({
    label,
    data,
    onChange,
    withLimit = false,
}) => {
    const { t } = useTranslation();

    return (
        <div className="space-y-4">
            <Input
                label={t('admin.widgets.form.title', 'Title')}
                value={label}
                onChange={(event) => onChange({ label: event.target.value })}
            />

            {withLimit && (
                <Input
                    type="number"
                    min={1}
                    label={t('admin.widgets.form.limit', 'Number of items')}
                    value={String(toNumber(data.limit, 5))}
                    onChange={(event) =>
                        onChange({ data: { ...data, limit: toNumber(event.target.value, 5) } })
                    }
                />
            )}
        </div>
    );
};

export const CategoriesForm: FC<WidgetFormProps> = (props) => <BlogWidgetForm {...props} />;

export const RecentPostsForm: FC<WidgetFormProps> = (props) => (
    <BlogWidgetForm {...props} withLimit />
);

export const PopularPostsForm: FC<WidgetFormProps> = (props) => (
    <BlogWidgetForm {...props} withLimit />
);

export const GenericWidgetForm: FC<WidgetFormProps> = (props) => <BlogWidgetForm {...props} />;
