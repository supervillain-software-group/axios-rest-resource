import axios, { AxiosInstance, AxiosPromise, AxiosRequestConfig, AxiosResponse } from 'axios'

import resourceSchemaDefault from './schemas'
import { interceptorUrlFormatter } from './url-formatter'

export type RequestMethod = 'get' | 'delete' | 'head' | 'options' | 'post' | 'put' | 'patch'

// Base method schema without transformations
interface IAPIMethodSchemaBase {
  method: RequestMethod
  url?: string
}

// Schema with optional transformations
export interface IAPIMethodSchema<TParams extends any[] = any[], TResponse = any> extends IAPIMethodSchemaBase {
  withParams?: (...args: TParams) => AxiosRequestConfig
  withResult?: (response: AxiosResponse) => TResponse
}

// Break down the conditional type into smaller parts
type WithBothTransforms<TParams extends any[], TResponse> = (...args: TParams) => Promise<TResponse>
type WithRequestTransform<TParams extends any[]> = (...args: TParams) => AxiosPromise
type WithResponseTransform<TResponse> = (config?: AxiosRequestConfig) => Promise<TResponse>
type WithNoTransforms = (config?: AxiosRequestConfig) => AxiosPromise

export type IAPIMethod<Schema> = Schema extends IAPIMethodSchema<infer TParams, infer TResponse>
  ? Schema['withParams'] extends (...args: any[]) => any
    ? Schema['withResult'] extends (response: AxiosResponse) => any
      ? WithBothTransforms<TParams, TResponse>
      : WithRequestTransform<TParams>
    : Schema['withResult'] extends (response: AxiosResponse) => any
    ? WithResponseTransform<TResponse>
    : WithNoTransforms
  : never

export type IResource<Schema> = {
  [K in keyof Schema]: IAPIMethod<Schema[K]>
}

export type IResourceMethodsDefault = 'create' | 'read' | 'readOne' | 'remove' | 'update'
export type IResourceSchema<T extends string> = Record<T, IAPIMethodSchema>

interface IAxiosConfig extends AxiosRequestConfig {
  baseURL: string
}

export class ResourceBuilder {
  public readonly axiosInstance: AxiosInstance
  protected readonly _schemaDefault: IResourceSchema<IResourceMethodsDefault> = resourceSchemaDefault

  constructor(axiosConfig: IAxiosConfig) {
    if (!axiosConfig.headers) {
      axiosConfig.headers = {}
    }
    if (axiosConfig.headers.Accept === undefined) {
      axiosConfig.headers.Accept = 'application/json'
    }
    this.axiosInstance = axios.create(axiosConfig)
    this.axiosInstance.interceptors.request.use(interceptorUrlFormatter)
  }

  public build(resourceUrl: string): IResource<IResourceSchema<IResourceMethodsDefault>>
  public build<T extends Record<string, IAPIMethodSchema>>(resourceUrl: string, schema: T): IResource<T>
  public build<T extends Record<string, IAPIMethodSchema>>(
    resourceUrl: string,
    schema?: T,
  ): IResource<T> | IResource<IResourceSchema<IResourceMethodsDefault>> {
    if (!schema) {
      return this._build(resourceUrl, this._schemaDefault)
    }
    return this._build(resourceUrl, schema)
  }

  protected _build<T extends Record<string, IAPIMethodSchema>>(resourceUrl: string, schema: T): IResource<T> {
    const resource = {} as IResource<T>

    for (const methodName of Object.keys(schema)) {
      const methodSchema = schema[methodName]
      let url = methodSchema.url || ''
      url = `${resourceUrl}${url}`

      // Create the base request function
      const makeRequest = (config: AxiosRequestConfig = {}) => {
        // Schema method takes precedence
        const requestConfig: AxiosRequestConfig = {
          ...config,
          method: methodSchema.method,
          url,
        }

        return this.axiosInstance.request(requestConfig)
      }

      if (methodSchema.withParams && methodSchema.withResult) {
        const method = (...args: any[]) => {
          const transformedConfig = methodSchema.withParams!(...args)
          return makeRequest(transformedConfig).then(methodSchema.withResult)
        }
        resource[methodName as keyof T] = method as any
      } else if (methodSchema.withParams) {
        const method = (...args: any[]) => {
          const transformedConfig = methodSchema.withParams!(...args)
          return makeRequest(transformedConfig)
        }
        resource[methodName as keyof T] = method as any
      } else if (methodSchema.withResult) {
        const method = (config = {}) => makeRequest(config).then(methodSchema.withResult)
        resource[methodName as keyof T] = method as any
      } else {
        resource[methodName as keyof T] = makeRequest as any
      }
    }

    return resource
  }
}
