import { AxiosHeaders, InternalAxiosRequestConfig } from 'axios'

import { interceptorUrlFormatter } from './url-formatter'

describe('interceptorUrlFormatter', () => {
  test('replaces {tokens} in url and removes used params', () => {
    const config: InternalAxiosRequestConfig = {
      headers: new AxiosHeaders(),
      params: {
        id: '$$12345',
        unusedParam: 'test',
      },
      url: 'http://localhost:3000/{id}',
      method: 'get',
      data: undefined,
      baseURL: '',
      transformRequest: [],
      transformResponse: [],
      timeout: 0,
      xsrfCookieName: '',
      xsrfHeaderName: '',
      maxContentLength: -1,
      maxBodyLength: -1,
      env: {
        FormData: null as any,
      },
    }
    const configUpd = interceptorUrlFormatter(config)
    expect(configUpd.url).toBe('http://localhost:3000/$$12345')
    expect(typeof configUpd.params).toBe('object')
    expect(Object.keys(configUpd.params).length).toBe(1)
    expect(configUpd.params).toHaveProperty('unusedParam', config.params.unusedParam)
    expect(configUpd.params).not.toHaveProperty('id')
  })
  test('returns original config if no params found', () => {
    const config: InternalAxiosRequestConfig = {
      headers: new AxiosHeaders(),
      url: 'http://localhost:3000/',
      method: 'get',
      data: undefined,
      baseURL: '',
      transformRequest: [],
      transformResponse: [],
      timeout: 0,
      xsrfCookieName: '',
      xsrfHeaderName: '',
      maxContentLength: -1,
      maxBodyLength: -1,
      env: {
        FormData: null as any,
      },
    }
    const configUpd = interceptorUrlFormatter(config)
    expect(configUpd).toEqual(config)
  })
})
