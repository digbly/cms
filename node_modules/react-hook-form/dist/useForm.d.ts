import type { FieldValues, UseFormProps, UseFormReturn } from './types';
/**
 * Core hook for managing a form. Returns all methods and state for
 * registration, validation, and submission.
 *
 * @see [API](https://react-hook-form.com/docs/useform)
 *
 * @example
 * ```tsx
 * const { register, handleSubmit, formState: { errors } } = useForm<FormValues>();
 * <form onSubmit={handleSubmit(onSubmit)}>
 *   <input {...register("email", { required: true })} />
 * </form>
 * ```
 */
export declare function useForm<TFieldValues extends FieldValues = FieldValues, TContext = any, TTransformedValues = TFieldValues>(props?: UseFormProps<TFieldValues, TContext, TTransformedValues>): UseFormReturn<TFieldValues, TContext, TTransformedValues>;
//# sourceMappingURL=useForm.d.ts.map