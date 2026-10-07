import type { FieldArrayPath, FieldValues, UseFieldArrayProps, UseFieldArrayReturn } from './types';
/**
 * Hook for dynamic field arrays. Provides `fields` and mutation methods:
 * `append`, `prepend`, `remove`, `insert`, `swap`, `move`, `update`, `replace`.
 *
 * @see [API](https://react-hook-form.com/docs/usefieldarray)
 *
 * @example
 * ```tsx
 * const { fields, append } = useFieldArray({ control, name: "items" });
 * return fields.map((f, i) => <input key={f.id} {...register(`items.${i}.name`)} />);
 * ```
 */
export declare function useFieldArray<TFieldValues extends FieldValues = FieldValues, TFieldArrayName extends FieldArrayPath<TFieldValues> = FieldArrayPath<TFieldValues>, TKeyName extends string = 'id', TTransformedValues = TFieldValues>(props: UseFieldArrayProps<TFieldValues, TFieldArrayName, TKeyName, TTransformedValues>): UseFieldArrayReturn<TFieldValues, TFieldArrayName, TKeyName>;
//# sourceMappingURL=useFieldArray.d.ts.map