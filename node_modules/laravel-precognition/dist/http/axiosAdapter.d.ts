import { AxiosInstance } from 'axios';
import { HttpClient } from './types.js';
export interface AxiosHttpClient extends HttpClient {
    getAxiosInstance(): AxiosInstance;
}
/**
 * Create an HTTP client adapter that wraps an Axios instance.
 *
 * If no instance is provided, the default axios instance will be used.
 */
export declare function axiosAdapter(axios?: AxiosInstance): AxiosHttpClient;
