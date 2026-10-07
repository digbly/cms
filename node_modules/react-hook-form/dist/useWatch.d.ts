import type { Control, DeepPartialSkipArrayKey, FieldPath, FieldPathValue, FieldPathValues, FieldValues } from './types';
/** Watches the entire form; re-renders when any value changes. */
export declare function useWatch<TFieldValues extends FieldValues = FieldValues, TTransformedValues = TFieldValues>(props: {
    name?: undefined;
    defaultValue?: DeepPartialSkipArrayKey<TFieldValues>;
    control?: Control<TFieldValues, any, TTransformedValues>;
    disabled?: boolean;
    exact?: boolean;
    compute?: undefined;
}): DeepPartialSkipArrayKey<TFieldValues>;
/** Watches a single field by name. */
export declare function useWatch<TFieldValues extends FieldValues = FieldValues, TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>, TTransformedValues = TFieldValues>(props: {
    name: TFieldName;
    defaultValue?: FieldPathValue<TFieldValues, TFieldName>;
    control?: Control<TFieldValues, any, TTransformedValues>;
    disabled?: boolean;
    exact?: boolean;
    compute?: undefined;
}): FieldPathValue<TFieldValues, TFieldName>;
/** Watches the entire form and derives a value via `compute`. */
export declare function useWatch<TFieldValues extends FieldValues = FieldValues, TTransformedValues = TFieldValues, TComputeValue = unknown>(props: {
    name?: undefined;
    defaultValue?: DeepPartialSkipArrayKey<TFieldValues>;
    control?: Control<TFieldValues, any, TTransformedValues>;
    disabled?: boolean;
    exact?: boolean;
    compute: (formValues: TFieldValues) => TComputeValue;
}): TComputeValue;
/** Watches a single field and derives a value via `compute`. */
export declare function useWatch<TFieldValues extends FieldValues = FieldValues, TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>, TTransformedValues = TFieldValues, TComputeValue = unknown>(props: {
    name: TFieldName;
    defaultValue?: FieldPathValue<TFieldValues, TFieldName>;
    control?: Control<TFieldValues, any, TTransformedValues>;
    disabled?: boolean;
    exact?: boolean;
    compute: (fieldValue: FieldPathValue<TFieldValues, TFieldName>) => TComputeValue;
}): TComputeValue;
/** Watches multiple fields by name array. */
export declare function useWatch<TFieldValues extends FieldValues = FieldValues, TFieldNames extends readonly FieldPath<TFieldValues>[] = readonly FieldPath<TFieldValues>[], TTransformedValues = TFieldValues>(props: {
    name: readonly [...TFieldNames];
    defaultValue?: DeepPartialSkipArrayKey<TFieldValues>;
    control?: Control<TFieldValues, any, TTransformedValues>;
    disabled?: boolean;
    exact?: boolean;
    compute?: undefined;
}): FieldPathValues<TFieldValues, TFieldNames>;
/** Watches multiple fields and derives a value via `compute`. */
export declare function useWatch<TFieldValues extends FieldValues = FieldValues, TFieldNames extends readonly FieldPath<TFieldValues>[] = readonly FieldPath<TFieldValues>[], TTransformedValues = TFieldValues, TComputeValue = unknown>(props: {
    name: readonly [...TFieldNames];
    defaultValue?: DeepPartialSkipArrayKey<TFieldValues>;
    control?: Control<TFieldValues, any, TTransformedValues>;
    disabled?: boolean;
    exact?: boolean;
    compute: (fieldValue: FieldPathValues<TFieldValues, TFieldNames>) => TComputeValue;
}): TComputeValue;
/** Watches the entire form; reads `control` from `FormProvider` context. */
export declare function useWatch<TFieldValues extends FieldValues = FieldValues>(): DeepPartialSkipArrayKey<TFieldValues>;
//# sourceMappingURL=useWatch.d.ts.map