import { InternalAxiosRequestConfig } from 'axios'

/**
 * @description
 * Axios interceptor. Finds tokens inside of {} in config.url, matches them by keys of config.params,
 * replaces them with matched values, removes matched keys from config.params.
 * Applied by default to an axios instance created by createAxiosResourceFactory
 *
 * @example
 * ```js
 * const axiosInstance = axios.create()
 * axiosInstance.interceptors.request.use(interceptorUrlFormatter)
 * axiosInstance.request({
 *   url: '/{id}',
 *   baseURL: 'http://localhost:3000/resource',
 *   method: 'POST',
 *   data: {
 *     field: 'value'
 *   },
 *   params: {
 *     id: '123'
 *   }
 * })
 * // interceptorUrlFormatter processes config before making an ajax request. Processed config:
 * // {
 * //   url: '/123',
 * //   baseURL: 'http://localhost:3000/resource',
 * //   method: 'POST',
 * //   data: {
 * //     field: 'value'
 * //   },
 * //   params: {}
 * // }
 * ```
 */
export const interceptorUrlFormatter = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
  if (!config.params) {
    return config
  }
  for (const paramName of Object.keys(config.params)) {
    const param = config.params[paramName]
    if (config.url && config.url.indexOf(`{${paramName}}`) > -1) {
      config.url = config.url.replace(`{${paramName}}`, () => param)
      delete config.params[paramName]
    }
  }
  return config
}
