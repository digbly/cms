import type { ComponentType } from 'react';
import { CategoriesForm, GenericWidgetForm, PopularPostsForm, RecentPostsForm } from './forms';
import type { WidgetFormProps } from './types';

const normalize = (value: string): string => value.toLowerCase().replace(/[^a-z0-9]/g, '');

/**
 * Maps `theme::widget` keys to the React form used to edit them. Widgets with
 * no dedicated form fall back to the generic title-only form.
 */
const forms: Record<string, ComponentType<WidgetFormProps>> = {
    'default::categories': CategoriesForm,
    'default::recentposts': RecentPostsForm,
    'default::popularposts': PopularPostsForm,
};

interface WidgetFormRendererProps extends WidgetFormProps {
    theme: string | null;
    widget: string;
}

/** Resolves and renders the form registered for a given theme widget. */
export default function WidgetFormRenderer({
    theme,
    widget,
    ...props
}: WidgetFormRendererProps) {
    const Form = forms[`${normalize(theme ?? '')}::${normalize(widget)}`] ?? GenericWidgetForm;

    return <Form {...props} />;
}
