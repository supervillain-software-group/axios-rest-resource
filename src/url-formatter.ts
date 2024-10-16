import { AxiosRequestConfig } from 'axios'

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
export const interceptorUrlFormatter = <T extends Partial<AxiosRequestConfig>>(config: T): T => {
  if (!config.params) {
    return config
  }
  const newConfig = { ...config }
  for (const paramName of Object.keys(newConfig.params)) {
    const param = newConfig.params[paramName]
    if (newConfig.url && newConfig.url.indexOf(`{${paramName}}`) > -1) {
      newConfig.url = newConfig.url.replace(`{${paramName}}`, () => param)
      delete newConfig.params[paramName]
    }
  }
  return newConfig
}
