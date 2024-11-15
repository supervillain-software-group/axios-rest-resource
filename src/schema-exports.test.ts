import { railsResourceSchema, resourceSchemaDefault } from '../index'

describe('Schema exports', () => {
  test('resourceSchemaDefault is exported correctly', () => {
    expect(resourceSchemaDefault).toBeDefined()
    expect(resourceSchemaDefault.create).toBeDefined()
    expect(resourceSchemaDefault.read).toBeDefined()
    expect(resourceSchemaDefault.readOne).toBeDefined()
    expect(resourceSchemaDefault.update).toBeDefined()
    expect(resourceSchemaDefault.remove).toBeDefined()
  })

  test('railsResourceSchema is exported correctly', () => {
    expect(railsResourceSchema).toBeDefined()
    expect(railsResourceSchema.create).toBeDefined()
    expect(railsResourceSchema.update).toBeDefined()
    expect(railsResourceSchema.index).toBeDefined()
    expect(railsResourceSchema.show).toBeDefined()
    expect(railsResourceSchema.destroy).toBeDefined()
  })
})
