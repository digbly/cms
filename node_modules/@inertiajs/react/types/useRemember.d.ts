import { Dispatch, MutableRefObject, SetStateAction } from 'react';
export default function useRemember<State>(initialState: State, key?: string, excludeKeysRef?: MutableRefObject<string[]>): [State, Dispatch<SetStateAction<State>>];
