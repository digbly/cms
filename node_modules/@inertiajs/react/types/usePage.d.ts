import { Page, PageProps, SharedPageProps } from '@inertiajs/core';
export default function usePage<TPageProps extends PageProps = PageProps>(): Page<TPageProps & SharedPageProps>;
