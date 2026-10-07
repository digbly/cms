import { ErrorValue, FormDataErrors, FormDataKeys, FormDataType, FormDataValues, Method, Progress, UrlMethodPair, UseFormTransformCallback, UseFormWithPrecognitionArguments, UseHttpSubmitArguments, UseHttpSubmitOptions } from '@inertiajs/core';
import { NamedInputEvent, ValidationConfig, Validator } from 'laravel-precognition';
import { SetDataAction } from './useFormState';
type PrecognitionValidationConfig<TKeys> = ValidationConfig & {
    only?: TKeys[] | Iterable<TKeys> | ArrayLike<TKeys>;
};
export interface UseHttpProps<TForm extends object, TResponse = unknown> {
    data: TForm;
    isDirty: boolean;
    errors: FormDataErrors<TForm>;
    hasErrors: boolean;
    processing: boolean;
    progress: Progress | null;
    wasSuccessful: boolean;
    recentlySuccessful: boolean;
    response: TResponse | null;
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
    submit: (...args: UseHttpSubmitArguments<TResponse, TForm>) => Promise<TResponse>;
    get: (url: string, options?: UseHttpSubmitOptions<TResponse, TForm>) => Promise<TResponse>;
    post: (url: string, options?: UseHttpSubmitOptions<TResponse, TForm>) => Promise<TResponse>;
    put: (url: string, options?: UseHttpSubmitOptions<TResponse, TForm>) => Promise<TResponse>;
    patch: (url: string, options?: UseHttpSubmitOptions<TResponse, TForm>) => Promise<TResponse>;
    delete: (url: string, options?: UseHttpSubmitOptions<TResponse, TForm>) => Promise<TResponse>;
    cancel: () => void;
    dontRemember: <K extends FormDataKeys<TForm>>(...fields: K[]) => UseHttpProps<TForm, TResponse>;
    optimistic: (callback: (currentData: TForm) => Partial<TForm>) => UseHttpProps<TForm, TResponse>;
    withAllErrors: () => UseHttpProps<TForm, TResponse>;
    withPrecognition: (...args: UseFormWithPrecognitionArguments) => UseHttpPrecognitiveProps<TForm, TResponse>;
}
export interface UseHttpValidationProps<TForm extends object, TResponse = unknown> {
    invalid: <K extends FormDataKeys<TForm>>(field: K) => boolean;
    setValidationTimeout: (duration: number) => UseHttpPrecognitiveProps<TForm, TResponse>;
    touch: <K extends FormDataKeys<TForm>>(field: K | NamedInputEvent | Array<K>, ...fields: K[]) => UseHttpPrecognitiveProps<TForm, TResponse>;
    touched: <K extends FormDataKeys<TForm>>(field?: K) => boolean;
    valid: <K extends FormDataKeys<TForm>>(field: K) => boolean;
    validate: <K extends FormDataKeys<TForm>>(field?: K | NamedInputEvent | PrecognitionValidationConfig<K>, config?: PrecognitionValidationConfig<K>) => UseHttpPrecognitiveProps<TForm, TResponse>;
    validateFiles: () => UseHttpPrecognitiveProps<TForm, TResponse>;
    validating: boolean;
    validator: () => Validator;
    withAllErrors: () => UseHttpPrecognitiveProps<TForm, TResponse>;
    withoutFileValidation: () => UseHttpPrecognitiveProps<TForm, TResponse>;
    setErrors: (errors: FormDataErrors<TForm>) => UseHttpPrecognitiveProps<TForm, TResponse>;
    forgetError: <K extends FormDataKeys<TForm> | NamedInputEvent>(field: K) => UseHttpPrecognitiveProps<TForm, TResponse>;
}
export type UseHttp<TForm extends object, TResponse = unknown> = UseHttpProps<TForm, TResponse>;
export type UseHttpPrecognitiveProps<TForm extends object, TResponse = unknown> = UseHttpProps<TForm, TResponse> & UseHttpValidationProps<TForm, TResponse>;
export default function useHttp<TForm extends FormDataType<TForm>, TResponse = unknown>(method: Method | (() => Method), url: string | (() => string), data: TForm | (() => TForm)): UseHttpPrecognitiveProps<TForm, TResponse>;
export default function useHttp<TForm extends FormDataType<TForm>, TResponse = unknown>(urlMethodPair: UrlMethodPair | (() => UrlMethodPair), data: TForm | (() => TForm)): UseHttpPrecognitiveProps<TForm, TResponse>;
export default function useHttp<TForm extends FormDataType<TForm>, TResponse = unknown>(rememberKey: string, data: TForm | (() => TForm)): UseHttp<TForm, TResponse>;
export default function useHttp<TForm extends FormDataType<TForm>, TResponse = unknown>(data: TForm | (() => TForm)): UseHttp<TForm, TResponse>;
export default function useHttp<TForm extends FormDataType<TForm>, TResponse = unknown>(): UseHttp<TForm, TResponse>;
export {};
