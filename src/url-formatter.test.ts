import { interceptorUrlFormatter } from './url-formatter'

describe('interceptorUrlFormatter', () => {
  test('replaces {tokens} in url and removes used params', () => {
    const config = {
      params: {
        id: '$$12345',
        unusedParam: 'test',
      },
      url: 'http://localhost:3000/{id}',
    }
    const configUpd = interceptorUrlFormatter(config)
    expect(configUpd.url).toBe('http://localhost:3000/$$12345')
    expect(typeof configUpd.params).toBe('object')
    expect(Object.keys(configUpd.params).length).toBe(1)
    expect(configUpd.params).toHaveProperty('unusedParam', config.params.unusedParam)
    expect(configUpd.params).not.toHaveProperty('id')
  })
  test('returns original config if no params found', () => {
    const config = {
      url: 'http://localhost:3000/',
    }
    const configUpd = interceptorUrlFormatter(config)
    expect(configUpd).toEqual(config)
  })
})
