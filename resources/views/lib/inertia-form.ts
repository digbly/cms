import { router } from '@inertiajs/react';
import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';

interface SubmitFormOptions<T extends FieldValues> {
    method?: 'post' | 'put' | 'patch';
    setError?: UseFormSetError<any>;
    forceFormData?: boolean;
    preserveScroll?: boolean;
    onSuccess?: () => void;
}

/**
 * Submit a react-hook-form payload through Inertia.
 *
 * Returns a promise that resolves when the visit finishes so that
 * react-hook-form can toggle its `isSubmitting` state. Validation errors
 * returned by the server are mapped back onto the form fields.
 */
export function submitForm<T extends FieldValues>(
    url: string,
    data: T,
    options: SubmitFormOptions<T> = {}
): Promise<void> {
    const { method = 'post', setError, forceFormData, preserveScroll, onSuccess } = options;

    return new Promise((resolve) => {
        const visitOptions = {
            forceFormData,
            preserveScroll,
            onError: (errors: Record<string, string>) => {
                if (!setError) {
                    return;
                }

                Object.entries(errors).forEach(([field, message]) => {
                    setError(field as Path<T>, { type: 'server', message });
                });
            },
            onSuccess: () => onSuccess?.(),
            onFinish: () => resolve(),
        };

        if (method === 'put') {
            router.put(url, data, visitOptions);
        } else if (method === 'patch') {
            router.patch(url, data, visitOptions);
        } else {
            router.post(url, data, visitOptions);
        }
    });
}
