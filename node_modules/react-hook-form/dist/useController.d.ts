import type { FieldPath, FieldValues, UseControllerProps, UseControllerReturn } from './types';
/**
 * Hook for controlled inputs. Returns `field`, `fieldState`, and `formState`.
 * Re-renders are isolated to the hook level.
 *
 * @see [API](https://react-hook-form.com/docs/usecontroller)
 *
 * @example
 * ```tsx
 * const { field, fieldState } = useController({ control, name: "email" });
 * return <input {...field} />;
 * ```
 */
export declare function useController<TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>, TTransformedValues = TFieldValues>(props: UseControllerProps<TFieldValues, TName, TTransformedValues>): UseControllerReturn<TFieldValues, TName>;
//# sourceMappingURL=useController.d.ts.map