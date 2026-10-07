import React from 'react';
import type { FieldValues, FormProps } from './types';
/**
 * Form component that handles submission, including optional `action` fetch and server error wiring.
 *
 * @see [API](https://react-hook-form.com/docs/useform/form)
 *
 * @example
 * ```tsx
 * <Form action="/api" control={control}>
 *   <input {...register("name")} />
 *   <p>{errors?.root?.server && 'Server error'}</p>
 *   <button>Submit</button>
 * </Form>
 * ```
 */
export declare function Form<TFieldValues extends FieldValues, TTransformedValues = TFieldValues>(props: FormProps<TFieldValues, TTransformedValues>): React.ReactNode;
//# sourceMappingURL=form.d.ts.map