import type { AxiosInstance } from 'axios';
import { HttpClient, HttpRequestConfig, HttpResponse } from './types';
export declare class AxiosHttpClient implements HttpClient {
    private axiosInstance;
    constructor(instance?: AxiosInstance);
    private getAxios;
    request(config: HttpRequestConfig): Promise<HttpResponse>;
    protected doRequest(config: HttpRequestConfig): Promise<HttpResponse>;
}
/**
 * Create an Axios HTTP client adapter
 */
export declare function axiosAdapter(instance?: AxiosInstance): HttpClient;
