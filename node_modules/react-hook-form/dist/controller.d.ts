import type { ControllerProps, FieldPath, FieldValues } from './types';
/**
 * Component wrapper around `useController` for controlled inputs.
 *
 * @see [API](https://react-hook-form.com/docs/usecontroller/controller)
 *
 * @example
 * ```tsx
 * <Controller
 *   control={control}
 *   name="test"
 *   render={({ field, fieldState, formState }) => <input {...field} />}
 * />
 * ```
 */
export declare const Controller: <TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>, TTransformedValues = TFieldValues>(props: ControllerProps<TFieldValues, TName, TTransformedValues>) => import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
//# sourceMappingURL=controller.d.ts.map