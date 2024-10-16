import { AxiosInstance, AxiosPromise, AxiosRequestConfig } from 'axios'
export declare type IAPIMethod = (requestConfig?: Partial<AxiosRequestConfig>) => AxiosPromise
export declare type IResource<Methods extends string> = {
  [Method in Methods]: IAPIMethod
}
declare type RequestMethod = 'get' | 'delete' | 'head' | 'options' | 'post' | 'put' | 'patch'
export interface IAPIMethodSchema {
  method: RequestMethod
  url?: string
}
export declare type IResourceSchema<T extends string> = {
  [Key in T]: IAPIMethodSchema
}
export declare type IResourceMethodsDefault = 'create' | 'read' | 'readOne' | 'remove' | 'update'
export declare const resourceSchemaDefault: IResourceSchema<IResourceMethodsDefault>
interface IAxiosConfig extends AxiosRequestConfig {
  baseURL: string
}
export declare class ResourceBuilder {
  readonly axiosInstance: AxiosInstance
  protected readonly _schemaDefault: IResourceSchema<IResourceMethodsDefault>
  constructor(axiosConfig: IAxiosConfig)
  build(resourceUrl: string): IResource<IResourceMethodsDefault>
  build<Methods extends string>(resourceUrl: string, schema: IResourceSchema<Methods>): IResource<Methods>
  protected _build<Methods extends string>(resourceUrl: string, schema: IResourceSchema<Methods>): IResource<Methods>
}
export {}
