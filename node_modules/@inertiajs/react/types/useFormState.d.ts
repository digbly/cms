import { ErrorValue, FormDataErrors, FormDataKeys, FormDataValues, Progress, UrlMethodPair, UseFormTransformCallback, UseFormWithPrecognitionArguments } from '@inertiajs/core';
import { NamedInputEvent, ValidationConfig, Validator } from 'laravel-precognition';
export type SetDataByObject<TForm> = (data: Partial<TForm>) => void;
export type SetDataByMethod<TForm> = (data: (previousData: TForm) => TForm) => void;
export type SetDataByKeyValuePair<TForm> = <K extends FormDataKeys<TForm>>(key: K, value: FormDataValues<TForm, K>) => void;
export type SetDataAction<TForm extends Record<any, any>> = SetDataByObject<TForm> & SetDataByMethod<TForm> & SetDataByKeyValuePair<TForm>;
type PrecognitionValidationConfig<TKeys> = ValidationConfig & {
    only?: TKeys[] | Iterable<TKeys> | ArrayLike<TKeys>;
};
export interface FormStateProps<TForm extends object> {
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
    withPrecognition: (...args: UseFormWithPrecognitionArguments) => FormStateWithPrecognition<TForm>;
}
export interface FormStateValidationProps<TForm extends object> {
    invalid: <K extends FormDataKeys<TForm>>(field: K) => boolean;
    setValidationTimeout: (duration: number) => FormStateWithPrecognition<TForm>;
    touch: <K extends FormDataKeys<TForm>>(field: K | NamedInputEvent | Array<K>, ...fields: K[]) => FormStateWithPrecognition<TForm>;
    touched: <K extends FormDataKeys<TForm>>(field?: K) => boolean;
    valid: <K extends FormDataKeys<TForm>>(field: K) => boolean;
    validate: <K extends FormDataKeys<TForm>>(field?: K | NamedInputEvent | PrecognitionValidationConfig<K>, config?: PrecognitionValidationConfig<K>) => FormStateWithPrecognition<TForm>;
    validateFiles: () => FormStateWithPrecognition<TForm>;
    validating: boolean;
    validator: () => Validator;
    withAllErrors: () => FormStateWithPrecognition<TForm>;
    withoutFileValidation: () => FormStateWithPrecognition<TForm>;
    setErrors: (errors: FormDataErrors<TForm>) => FormStateWithPrecognition<TForm>;
    forgetError: <K extends FormDataKeys<TForm> | NamedInputEvent>(field: K) => FormStateWithPrecognition<TForm>;
}
export type FormState<TForm extends object> = FormStateProps<TForm>;
export type FormStateWithPrecognition<TForm extends object> = FormStateProps<TForm> & FormStateValidationProps<TForm>;
export interface UseFormStateOptions<TForm extends object> {
    data: TForm | (() => TForm);
    precognitionEndpoint?: (() => UrlMethodPair) | null;
    useDataState?: () => [TForm, React.Dispatch<React.SetStateAction<TForm>>];
    useErrorsState?: () => [FormDataErrors<TForm>, React.Dispatch<React.SetStateAction<FormDataErrors<TForm>>>];
}
export interface UseFormStateReturn<TForm extends object> {
    form: FormState<TForm>;
    setDefaultsState: React.Dispatch<React.SetStateAction<TForm>>;
    transformRef: React.MutableRefObject<UseFormTransformCallback<TForm>>;
    precognitionEndpointRef: React.MutableRefObject<(() => UrlMethodPair) | null>;
    dataRef: React.MutableRefObject<TForm>;
    isMounted: React.MutableRefObject<boolean>;
    setProcessing: React.Dispatch<React.SetStateAction<boolean>>;
    setProgress: React.Dispatch<React.SetStateAction<Progress | null>>;
    markAsSuccessful: () => void;
    clearErrors: (...fields: string[]) => void;
    setError: (fieldOrFields: FormDataKeys<TForm> | FormDataErrors<TForm>, maybeValue?: ErrorValue) => void;
    defaultsCalledInOnSuccessRef: React.MutableRefObject<boolean>;
    resetBeforeSubmit: () => void;
    finishProcessing: () => void;
    withAllErrors: {
        enabled: () => boolean;
        enable: () => void;
    };
}
export default function useFormState<TForm extends object>(options: UseFormStateOptions<TForm>): UseFormStateReturn<TForm>;
export {};
