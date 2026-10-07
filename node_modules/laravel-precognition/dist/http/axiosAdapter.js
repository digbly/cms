import { isAxiosError, isCancel, default as Axios } from 'axios';
import { HttpResponseError, HttpCancelledError, HttpNetworkError } from './errors.js';
/**
 * Create an HTTP client adapter that wraps an Axios instance.
 *
 * If no instance is provided, the default axios instance will be used.
 */
export function axiosAdapter(axios = Axios) {
    return {
        getAxiosInstance: () => axios,
        async request(config) {
            try {
                const response = await axios.request({
                    method: config.method,
                    url: config.url,
                    baseURL: config.baseURL,
                    data: config.data,
                    params: config.params,
                    headers: config.headers,
                    signal: config.signal,
                    timeout: config.timeout ?? axios.defaults.timeout ?? 30000,
                    withCredentials: config.credentials === 'include',
                });
                return {
                    status: response.status,
                    data: response.data,
                    headers: normalizeHeaders(response.headers),
                };
            }
            catch (error) {
                if (isCancel(error)) {
                    throw new HttpCancelledError();
                }
                if (isAxiosError(error) && error.response) {
                    throw new HttpResponseError({
                        status: error.response.status,
                        data: error.response.data,
                        headers: normalizeHeaders(error.response.headers),
                    });
                }
                if (error instanceof Error && error.message === 'Network Error') {
                    throw new HttpNetworkError(error.message);
                }
                throw error;
            }
        },
    };
}
/**
 * Normalize Axios headers to a plain object with lowercase keys.
 */
function normalizeHeaders(headers) {
    const result = {};
    if (!headers || typeof headers !== 'object') {
        return result;
    }
    Object.entries(headers).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            result[key.toLowerCase()] = String(value);
        }
    });
    return result;
}
