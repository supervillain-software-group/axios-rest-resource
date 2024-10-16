import { AxiosPromise, AxiosRequestConfig } from 'axios'

export type RequestMethod = 'get' | 'delete' | 'head' | 'options' | 'post' | 'put' | 'patch'

export interface IAPIMethodSchema {
  method: RequestMethod
  url?: string
}

export type IResourceSchema<T extends string> = { [Key in T]: IAPIMethodSchema }

export type IAPIMethod = (requestConfig?: Partial<AxiosRequestConfig>) => AxiosPromise

export type IResource<Methods extends string> = { [Method in Methods]: IAPIMethod }

export type IResourceMethodsDefault = 'create' | 'read' | 'readOne' | 'remove' | 'update'

export type IRailsResourceMethods = 'create' | 'update' | 'index' | 'show' | 'destroy'

export type IRailsResourceSchema = IResourceSchema<IRailsResourceMethods>
