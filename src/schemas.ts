import { IResourceMethodsDefault, IResourceSchema } from './resource'

const resourceSchemaDefault: IResourceSchema<IResourceMethodsDefault> = {
  create: {
    method: 'post',
  },
  read: {
    method: 'get',
  },
  readOne: {
    method: 'get',
    url: '/{id}',
  },
  remove: {
    method: 'delete',
    url: '/{id}',
  },
  update: {
    method: 'put',
    url: '/{id}',
  },
}

type RailsResourceMethods = 'create' | 'destroy' | 'index' | 'show' | 'update'

export const railsResourceSchema: IResourceSchema<RailsResourceMethods> = {
  create: resourceSchemaDefault.create,
  destroy: resourceSchemaDefault.remove,
  index: resourceSchemaDefault.read,
  show: resourceSchemaDefault.readOne,
  update: resourceSchemaDefault.update,
}

export default resourceSchemaDefault
