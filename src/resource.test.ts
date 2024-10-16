import { AxiosRequestConfig, Method } from 'axios'
import * as moxios from 'moxios'

import { IAPIMethodSchema, IResourceSchema, ResourceBuilder, resourceSchemaDefault } from './resource'

describe(`${ResourceBuilder.name}`, () => {
  beforeEach(() => {
    moxios.install()
  })
  afterEach(() => {
    jest.restoreAllMocks()
    moxios.uninstall()
  })

  const ignoreRequestConfigKeys: Array<keyof AxiosRequestConfig> = ['method', 'url']
  const resourceBuilderValidate = async (
    resourceBuilder: ResourceBuilder,
    resourceBuilderBuildParams: [string] | [string, IResourceSchema<any>],
    resourceMethodConfig?: AxiosRequestConfig,
  ) => {
    moxios.stubRequest(/.*/, {
      responseText: 'OK',
      status: 200,
    })
    const resourceUrl = resourceBuilderBuildParams[0]
    const resourceSchema = resourceBuilderBuildParams[1]
    let resource = resourceBuilder.build(resourceUrl)
    if (resourceSchema) {
      resource = resourceBuilder.build(resourceUrl, resourceSchema)
    }
    expect(typeof resource).toBe('object')
    const schema = resourceBuilderBuildParams[1] || resourceSchemaDefault
    for (const schemaKey of Object.keys(schema)) {
      const methodSchema = (schema as any)[schemaKey] as IAPIMethodSchema
      expect(resource).toHaveProperty(schemaKey)
      const resourceMethod = resource[schemaKey as keyof typeof resource]
      expect(typeof resourceMethod).toBe('function')
      const axiosPromise = resourceMethod(resourceMethodConfig)
      expect(axiosPromise instanceof Promise).toBe(true)
      await axiosPromise
      const requestConfigRes = moxios.requests.mostRecent().config
      expect(typeof requestConfigRes).toBe('object')
      expect(requestConfigRes).toHaveProperty('method', methodSchema.method)
      expect(requestConfigRes).toHaveProperty('url')
      expect((requestConfigRes.url as string).indexOf(`${resourceUrl}${methodSchema.url || ''}`)).not.toBe(-1)
      const resourceMethodConfigHeadersAccept =
        resourceMethodConfig && resourceMethodConfig.headers && resourceMethodConfig.headers.Accept
      expect(requestConfigRes.headers).toHaveProperty('Accept', resourceMethodConfigHeadersAccept || 'application/json')
      if (resourceMethodConfig) {
        for (const requestConfigKey of Object.keys(resourceMethodConfig)) {
          if (ignoreRequestConfigKeys.indexOf(requestConfigKey as keyof AxiosRequestConfig) !== -1) {
            continue
          }
          const requestConfigVal = resourceMethodConfig[requestConfigKey as keyof AxiosRequestConfig]
          if (requestConfigKey === 'headers') {
            // requestConfigVal = headers object
            for (const headersKey of Object.keys(requestConfigVal)) {
              const headersVal = requestConfigVal[headersKey]
              expect(requestConfigRes[requestConfigKey]).toHaveProperty(headersKey, headersVal)
            }
            continue
          }
          expect(requestConfigRes).toHaveProperty(requestConfigKey, requestConfigVal)
        }
      }
    }
    return schema
  }
  describe('build', () => {
    test('success: default schema', async () => {
      const baseURL = 'http://localhost:3000'
      const resourceURL = '/resource'
      const requestConfig = {
        data: 'test',
      }
      const resourceBuilder = new ResourceBuilder({ baseURL })
      const schemaRes = await resourceBuilderValidate(resourceBuilder, [resourceURL], requestConfig)
      expect(schemaRes).toBe(resourceSchemaDefault)
    })
    test('success: axiosInstance can be modified', async () => {
      const baseURL = 'http://localhost:3000'
      const resourceURL = '/resource'
      const requestConfig = {
        data: 'test',
      }
      const resourceBuilder = new ResourceBuilder({ baseURL })
      const interceptorDummy = jest.fn().mockImplementation((config) => config)
      resourceBuilder.axiosInstance.interceptors.request.use(interceptorDummy)
      const schemaRes = await resourceBuilderValidate(resourceBuilder, [resourceURL], requestConfig)
      expect(schemaRes).toBe(resourceSchemaDefault)
      expect(interceptorDummy).toHaveBeenCalledTimes(Object.keys(resourceSchemaDefault).length)
    })
    test('success: no request config', async () => {
      const baseURL = 'http://localhost:3000'
      const resourceURL = '/resource'
      const resourceBuilder = new ResourceBuilder({ baseURL })
      const schemaRes = await resourceBuilderValidate(resourceBuilder, [resourceURL])
      expect(schemaRes).toBe(resourceSchemaDefault)
    })
    test('success: custom schema', async () => {
      const baseURL = 'http://localhost:3000'
      const resourceURL = '/resource'
      const requestConfig = {
        data: 'test',
      }
      const schema: { [index: string]: IAPIMethodSchema } = {
        test: {
          method: 'put',
        },
      }
      const resourceBuilder = new ResourceBuilder({ baseURL })
      const schemaRes = await resourceBuilderValidate(resourceBuilder, [resourceURL, schema], requestConfig)
      expect(schemaRes).toBe(schema)
    })
    test('success: custom request params', async () => {
      const baseURL = 'http://localhost:3000'
      const resourceURL = '/resource'
      const schema: { [index: string]: IAPIMethodSchema } = {
        test: {
          method: 'put',
        },
      }
      const requestConfig = {
        headers: {
          test: 'test',
        },
        payload: 'test',
      }
      const resourceBuilder = new ResourceBuilder({ baseURL })
      const schemaRes = await resourceBuilderValidate(resourceBuilder, [resourceURL, schema], requestConfig)
      expect(schemaRes).toBe(schema)
    })
    test('success: custom request params with ignored keys', async () => {
      const baseURL = 'http://localhost:3000'
      const resourceURL = '/resource'
      const schema: { [index: string]: IAPIMethodSchema } = {
        test: {
          method: 'put',
        },
      }
      const requestConfig = {
        data: 'test',
        headers: {
          Accept: 'text/html',
          test: 'test',
        },
        method: 'get' as Method,
        url: 'should not be overridden',
      }
      const resourceBuilder = new ResourceBuilder({ baseURL })
      const schemaRes = await resourceBuilderValidate(resourceBuilder, [resourceURL, schema], requestConfig)
      expect(schemaRes).toBe(schema)
    })
  })
})
