import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import resourceSchemaDefault from './resourceSchemaDefault'
import { IResource, IResourceMethodsDefault, IResourceSchema } from './types'
import { interceptorUrlFormatter } from './url-formatter'

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

  public build(resourceUrl: string): IResource<IResourceMethodsDefault>
  public build<Methods extends string>(resourceUrl: string, schema: IResourceSchema<Methods>): IResource<Methods>
  public build<Methods extends string>(
    resourceUrl: string,
    schema?: IResourceSchema<Methods>,
  ): IResource<Methods> | IResource<IResourceMethodsDefault> {
    if (!schema) {
      return this._build<IResourceMethodsDefault>(resourceUrl, this._schemaDefault)
    }
    return this._build<Methods>(resourceUrl, schema)
  }

  protected _build<Methods extends string>(resourceUrl: string, schema: IResourceSchema<Methods>): IResource<Methods> {
    const resource = {} as IResource<Methods>
    for (const methodName of Object.keys(schema) as Methods[]) {
      const methodSchema = schema[methodName]
      let url = methodSchema.url || ''
      url = `${resourceUrl}${url}`
      resource[methodName] = (requestConfig = {}) =>
        this.axiosInstance.request({
          ...requestConfig,
          ...methodSchema,
          url,
        })
    }
    return resource
  }
}
