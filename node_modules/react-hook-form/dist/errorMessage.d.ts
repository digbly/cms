import React from 'react';
import type { Control, FieldPath, FieldValues, Message, MultipleFieldErrors } from './types';
export type ErrorMessageProps<TFieldValues extends FieldValues = FieldValues> = {
    as?: React.ElementType;
    control?: Control<TFieldValues>;
    name: FieldPath<TFieldValues> | `root.${string}` | 'root';
    render?: (data: {
        message: Message;
        messages?: MultipleFieldErrors;
    }) => React.ReactNode;
};
/**
 * Displays the validation error for a single field.
 * Reads from `control` when provided, otherwise from the nearest `FormProvider`.
 *
 * @see [API](https://react-hook-form.com/docs/useformstate/errormessage)
 *
 * @example
 * ```tsx
 * <ErrorMessage control={control} name="email" as="p" />
 * <ErrorMessage name="email" as="span" />
 * <ErrorMessage control={control} name="email"
 *   render={({ message }) => <Alert>{message}</Alert>} />
 * ```
 */
export declare const ErrorMessage: <TFieldValues extends FieldValues = FieldValues>({ as, control, name, render, }: ErrorMessageProps<TFieldValues>) => React.ReactElement<any, string | React.JSXElementConstructor<any>> | null;
//# sourceMappingURL=errorMessage.d.ts.map