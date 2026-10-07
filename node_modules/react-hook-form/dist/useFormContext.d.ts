import React from 'react';
import type { FieldValues, FormProviderProps, UseFormReturn } from './types';
/**
 * Retrieves all `useForm` methods from the nearest `FormProvider`.
 * Use in deeply nested components to avoid prop-drilling.
 *
 * @see [API](https://react-hook-form.com/docs/useformcontext)
 *
 * @example
 * ```tsx
 * const { register } = useFormContext<FormValues>();
 * ```
 */
export declare const useFormContext: <TFieldValues extends FieldValues, TContext = any, TTransformedValues = TFieldValues>() => UseFormReturn<TFieldValues, TContext, TTransformedValues>;
/**
 * Provides all `useForm` methods to the component tree via React Context.
 * Pair with `useFormContext` to consume them in any descendant.
 *
 * @see [API](https://react-hook-form.com/docs/useformcontext)
 *
 * @example
 * ```tsx
 * <FormProvider {...methods}>
 *   <form onSubmit={methods.handleSubmit(onSubmit)}>{children}</form>
 * </FormProvider>
 * ```
 */
export declare const FormProvider: <TFieldValues extends FieldValues, TContext = any, TTransformedValues = TFieldValues>({ children, watch, getValues, getErrors, getFieldState, setError, clearErrors, setValue, setValues, trigger, formState, resetField, reset, resetDefaultValues, handleSubmit, unregister, control, register, setFocus, subscribe, }: FormProviderProps<TFieldValues, TContext, TTransformedValues>) => React.JSX.Element;
//# sourceMappingURL=useFormContext.d.ts.map