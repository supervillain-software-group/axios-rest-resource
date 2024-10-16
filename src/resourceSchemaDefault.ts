import { IRailsResourceSchema, IResourceMethodsDefault, IResourceSchema } from './types'

export const resourceSchemaDefault: IResourceSchema<IResourceMethodsDefault> = {
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

// Map axios-rest-resource default method names to rails controller action names
export const railsResourceSchema: IRailsResourceSchema = {
  create: resourceSchemaDefault.create,
  destroy: resourceSchemaDefault.remove,
  index: resourceSchemaDefault.read,
  show: resourceSchemaDefault.readOne,
  update: resourceSchemaDefault.update,
}

export default resourceSchemaDefault
