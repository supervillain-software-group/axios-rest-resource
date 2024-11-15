import resourceSchemaDefault, { railsResourceSchema } from './schemas'

describe('Schemas', () => {
  test('railsResourceSchema maps correctly to default schema methods', () => {
    expect(railsResourceSchema.create).toBe(resourceSchemaDefault.create)
    expect(railsResourceSchema.update).toBe(resourceSchemaDefault.update)
    expect(railsResourceSchema.index).toBe(resourceSchemaDefault.read)
    expect(railsResourceSchema.show).toBe(resourceSchemaDefault.readOne)
    expect(railsResourceSchema.destroy).toBe(resourceSchemaDefault.remove)
  })
})
