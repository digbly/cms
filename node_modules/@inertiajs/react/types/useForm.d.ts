import { ErrorValue, FormDataErrors, FormDataKeys, FormDataType, FormDataValues, Method, OptimisticCallback, Progress, UrlMethodPair, UseFormSubmitArguments, UseFormSubmitOptions, UseFormTransformCallback, UseFormWithPrecognitionArguments } from '@inertiajs/core';
import type { NamedInputEvent, PrecognitionPath, ValidationConfig, Validator } from 'laravel-precognition';
import { SetDataAction, SetDataByKeyValuePair, SetDataByMethod, SetDataByObject } from './useFormState';
export { SetDataAction, SetDataByKeyValuePair, SetDataByMethod, SetDataByObject };
type PrecognitionValidationConfig<TKeys> = ValidationConfig & {
    only?: TKeys[] | Iterable<TKeys> | ArrayLike<TKeys>;
};
export interface InertiaFormProps<TForm extends Record<string, any>> {
    data: TForm;
    isDirty: boolean;
    errors: FormDataErrors<TForm>;
    hasErrors: boolean;
    processing: boolean;
    progress: Progress | null;
    wasSuccessful: boolean;
    recentlySuccessful: boolean;
    setData: SetDataAction<TForm>;
    transform: (callback: UseFormTransformCallback<TForm>) => void;
    setDefaults: {
        (): void;
        <T extends FormDataKeys<TForm>>(field: T, value: FormDataValues<TForm, T>): void;
        (fields: Partial<TForm>): void;
    };
    reset: <K extends FormDataKeys<TForm>>(...fields: K[]) => void;
    clearErrors: <K extends FormDataKeys<TForm>>(...fields: K[]) => void;
    resetAndClearErrors: <K extends FormDataKeys<TForm>>(...fields: K[]) => void;
    setError: {
        <K extends FormDataKeys<TForm>>(field: K, value: ErrorValue): void;
        (errors: FormDataErrors<TForm>): void;
    };
    submit: (...args: UseFormSubmitArguments) => void;
    get: (url: string, options?: UseFormSubmitOptions) => void;
    post: (url: string, options?: UseFormSubmitOptions) => void;
    put: (url: string, options?: UseFormSubmitOptions) => void;
    patch: (url: string, options?: UseFormSubmitOptions) => void;
    delete: (url: string, options?: UseFormSubmitOptions) => void;
    cancel: () => void;
    dontRemember: <K extends FormDataKeys<TForm>>(...fields: K[]) => InertiaFormProps<TForm>;
    optimistic: <TProps>(callback: OptimisticCallback<TProps>) => InertiaFormProps<TForm>;
    withPrecognition: (...args: UseFormWithPrecognitionArguments) => InertiaPrecognitiveFormProps<TForm>;
}
export interface InertiaFormValidationProps<TForm extends Record<string, any>> {
    invalid: <K extends FormDataKeys<TForm>>(field: K) => boolean;
    setValidationTimeout: (duration: number) => InertiaPrecognitiveFormProps<TForm>;
    touch: <K extends FormDataKeys<TForm>>(field: K | NamedInputEvent | Array<K>, ...fields: K[]) => InertiaPrecognitiveFormProps<TForm>;
    touched: <K extends FormDataKeys<TForm>>(field?: K) => boolean;
    valid: <K extends FormDataKeys<TForm>>(field: K) => boolean;
    validate: <K extends FormDataKeys<TForm> | PrecognitionPath<TForm>>(field?: K | NamedInputEvent | PrecognitionValidationConfig<K>, config?: PrecognitionValidationConfig<K>) => InertiaPrecognitiveFormProps<TForm>;
    validateFiles: () => InertiaPrecognitiveFormProps<TForm>;
    validating: boolean;
    validator: () => Validator;
    withAllErrors: () => InertiaPrecognitiveFormProps<TForm>;
    withoutFileValidation: () => InertiaPrecognitiveFormProps<TForm>;
    setErrors: (errors: FormDataErrors<TForm>) => InertiaPrecognitiveFormProps<TForm>;
    forgetError: <K extends FormDataKeys<TForm> | NamedInputEvent>(field: K) => InertiaPrecognitiveFormProps<TForm>;
}
export type InertiaForm<TForm extends Record<string, any>> = InertiaFormProps<TForm>;
export type InertiaPrecognitiveFormProps<TForm extends Record<string, any>> = InertiaFormProps<TForm> & InertiaFormValidationProps<TForm>;
export default function useForm<TForm extends FormDataType<TForm>>(method: Method | (() => Method), url: string | (() => string), data: TForm | (() => TForm)): InertiaPrecognitiveFormProps<TForm>;
export default function useForm<TForm extends FormDataType<TForm>>(urlMethodPair: UrlMethodPair | (() => UrlMethodPair), data: TForm | (() => TForm)): InertiaPrecognitiveFormProps<TForm>;
export default function useForm<TForm extends FormDataType<TForm>>(rememberKey: string, data: TForm | (() => TForm)): InertiaFormProps<TForm>;
export default function useForm<TForm extends FormDataType<TForm>>(data: TForm | (() => TForm)): InertiaFormProps<TForm>;
export default function useForm<TForm extends FormDataType<TForm>>(): InertiaFormProps<TForm>;
