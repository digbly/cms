import type { FieldValues, UseFormStateProps, UseFormStateReturn } from './types';
/**
 * Subscribes to form state with re-renders isolated to this hook.
 * Optionally scope to specific field names to minimize re-render surface.
 *
 * @see [API](https://react-hook-form.com/docs/useformstate)
 *
 * @example
 * ```tsx
 * const { errors, isDirty } = useFormState({ control, name: "email" });
 * ```
 */
export declare function useFormState<TFieldValues extends FieldValues = FieldValues, TTransformedValues = TFieldValues>(props?: UseFormStateProps<TFieldValues, TTransformedValues>): UseFormStateReturn<TFieldValues>;
//# sourceMappingURL=useFormState.d.ts.map