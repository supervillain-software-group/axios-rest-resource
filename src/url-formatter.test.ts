import { AxiosHeaders, InternalAxiosRequestConfig } from 'axios'

import { interceptorUrlFormatter } from './url-formatter'

describe('interceptorUrlFormatter', () => {
  test('replaces {tokens} in url and removes used params', () => {
    const config: InternalAxiosRequestConfig = {
      baseURL: '',
      data: undefined,
      env: {
        FormData: null as any,
      },
      headers: new AxiosHeaders(),
      maxBodyLength: -1,
      maxContentLength: -1,
      method: 'get',
      params: {
        id: '$$12345',
        unusedParam: 'test',
      },
      timeout: 0,
      transformRequest: [],
      transformResponse: [],
      url: 'http://localhost:3000/{id}',
      xsrfCookieName: '',
      xsrfHeaderName: '',
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
      baseURL: '',
      data: undefined,
      env: {
        FormData: null as any,
      },
      headers: new AxiosHeaders(),
      maxBodyLength: -1,
      maxContentLength: -1,
      method: 'get',
      timeout: 0,
      transformRequest: [],
      transformResponse: [],
      url: 'http://localhost:3000/',
      xsrfCookieName: '',
      xsrfHeaderName: '',
    }
    const configUpd = interceptorUrlFormatter(config)
    expect(configUpd).toEqual(config)
  })
})
