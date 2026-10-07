import { FormComponentProps, FormComponentRef, FormComponentSlotProps } from '@inertiajs/core';
import React, { ReactNode } from 'react';
type FormProps<TForm extends object = Record<string, any>> = FormComponentProps<TForm> & Omit<React.FormHTMLAttributes<HTMLFormElement>, keyof FormComponentProps | 'children'> & Omit<React.AllHTMLAttributes<HTMLFormElement>, keyof FormComponentProps | 'children'> & {
    children: ReactNode | ((props: FormComponentSlotProps<TForm>) => ReactNode);
};
export declare function useFormContext<TForm extends object = Record<string, any>>(): FormComponentRef<TForm> | undefined;
declare const _default: {
    <TForm extends object = Record<string, any>>(props: FormProps<TForm> & React.RefAttributes<FormComponentRef<TForm>>): React.ReactElement;
    displayName: string;
};
export default _default;
