import { ResourceBuilder } from './resource'

describe('ResourceBuilder Constructor', () => {
  test('handles undefined headers', () => {
    const builder = new ResourceBuilder({
      baseURL: 'http://api.example.com',
    })

    expect(builder.axiosInstance.defaults.headers.Accept).toBe('application/json')
  })

  test('handles undefined Accept header', () => {
    const builder = new ResourceBuilder({
      baseURL: 'http://api.example.com',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    expect(builder.axiosInstance.defaults.headers.Accept).toBe('application/json')
    expect(builder.axiosInstance.defaults.headers['Content-Type']).toBe('application/json')
  })

  test('preserves existing Accept header', () => {
    const builder = new ResourceBuilder({
      baseURL: 'http://api.example.com',
      headers: {
        Accept: 'application/xml',
        'Content-Type': 'application/json',
      },
    })

    expect(builder.axiosInstance.defaults.headers.Accept).toBe('application/xml')
    expect(builder.axiosInstance.defaults.headers['Content-Type']).toBe('application/json')
  })
})
