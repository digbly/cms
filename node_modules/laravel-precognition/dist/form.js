/**
 * Determine if the value is a file.
 */
export const isFile = (value) => (typeof File !== 'undefined' && value instanceof File)
    || value instanceof Blob
    || (typeof FileList !== 'undefined' && value instanceof FileList && value.length > 0);
/**
 * Determine if the payload has any files.
 *
 * @see https://github.com/inertiajs/inertia/blob/master/packages/core/src/files.ts
 */
export const hasFiles = (data) => {
    if (data instanceof FormData) {
        return true;
    }
    return isFile(data)
        || (typeof data === 'object' && data !== null && Object.values(data).some((value) => hasFiles(value)));
};
