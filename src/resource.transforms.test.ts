import { AxiosError, AxiosResponse } from 'axios'
import * as moxios from 'moxios'
import { ResourceBuilder } from './resource'

describe('ResourceBuilder Transforms', () => {
  beforeEach(() => {
    moxios.install()
  })

  afterEach(() => {
    moxios.uninstall()
  })

  describe('withParams', () => {
    test('transforms parameters into request config', async () => {
      const builder = new ResourceBuilder({ baseURL: 'http://api.example.com' })

      const resource = builder.build('/users', {
        signIn: {
          method: 'post',
          withParams: (email: string, password: string) => ({
            data: { email, password },
            headers: { 'X-Custom': 'test' },
          }),
        },
      })

      moxios.stubRequest(/.*/, {
        status: 200,
        response: { success: true },
      })

      resource.signIn('test@example.com', 'password123')

      // Wait for request to be registered
      await new Promise<void>((resolve) => moxios.wait(() => resolve()))

      const request = moxios.requests.mostRecent()

      expect(JSON.parse(request.config.data)).toEqual({
        email: 'test@example.com',
        password: 'password123',
      })
      expect(request.config.headers?.['X-Custom']).toBe('test')

      await request.respondWith({
        status: 200,
        response: { success: true },
      })
    })

    test('handles optional parameters correctly', async () => {
      const builder = new ResourceBuilder({ baseURL: 'http://api.example.com' })

      const resource = builder.build('/users', {
        signIn: {
          method: 'post',
          withParams: (email: string, password?: string) => ({
            data: {
              email,
              ...(password && { password }),
            },
          }),
        },
      })

      moxios.stubRequest(/.*/, {
        status: 200,
        response: {},
      })

      // Test with only required parameter
      const promise1 = resource.signIn('test@example.com')
      // Wait for request to be registered
      await new Promise<void>((resolve) => moxios.wait(() => resolve()))

      const request1 = await moxios.requests.mostRecent()

      expect(JSON.parse(request1.config.data)).toEqual({
        email: 'test@example.com',
      })

      await request1.respondWith({
        status: 200,
        response: {},
      })

      await promise1

      // Test with optional parameter
      const promise2 = resource.signIn('test@example.com', 'password123')
      // Wait for request to be registered
      await new Promise<void>((resolve) => moxios.wait(() => resolve()))
      const request2 = await moxios.requests.mostRecent()

      expect(JSON.parse(request2.config.data)).toEqual({
        email: 'test@example.com',
        password: 'password123',
      })

      await request2.respondWith({
        status: 200,
        response: {},
      })

      await promise2
    })
  })

  describe('withResult', () => {
    test('transforms response data', async () => {
      const builder = new ResourceBuilder({ baseURL: 'http://api.example.com' })

      interface User {
        id: number
        email: string
      }

      const resource = builder.build('/users', {
        getProfile: {
          method: 'get',
          withResult: (response: AxiosResponse): User => ({
            id: response.data.id,
            email: response.data.email,
          }),
        },
      })

      moxios.stubRequest(/.*/, {
        status: 200,
        response: {
          id: 123,
          email: 'test@example.com',
          createdAt: '2023-01-01',
          updatedAt: '2023-01-02',
        },
      })

      const response = await resource.getProfile()
      expect(response).toEqual({
        id: 123,
        email: 'test@example.com',
      })
      expect(response).not.toHaveProperty('createdAt')
      expect(response).not.toHaveProperty('updatedAt')
    })

    test('handles error responses', async () => {
      const builder = new ResourceBuilder({ baseURL: 'http://api.example.com' })

      const resource = builder.build('/users', {
        getProfile: {
          method: 'get',
        },
      })

      moxios.stubRequest(/.*/, {
        status: 404,
        response: { error: 'Not found' },
      })

      try {
        await resource.getProfile()
        fail('Should have thrown an error')
      } catch (error) {
        const axiosError = error as AxiosError
        expect(axiosError.response?.status).toBe(404)
        expect(axiosError.response?.data).toEqual({ error: 'Not found' })
      }
    })
  })

  describe('both transforms', () => {
    test('applies both request and response transforms', async () => {
      const builder = new ResourceBuilder({ baseURL: 'http://api.example.com' })

      interface SignInResponse {
        token: string
        user: {
          id: number
          email: string
        }
      }

      const resource = builder.build('/auth', {
        signIn: {
          method: 'post',
          withParams: (email: string, password: string) => ({
            data: { email, password },
          }),
          withResult: (response: AxiosResponse): SignInResponse => ({
            token: response.data.auth_token,
            user: {
              id: response.data.user.id,
              email: response.data.user.email,
            },
          }),
        },
      })

      moxios.stubRequest(/.*/, {
        status: 200,
        response: {
          auth_token: 'jwt.token.here',
          user: {
            id: 123,
            email: 'test@example.com',
            created_at: '2023-01-01',
          },
        },
      })

      const promise = resource.signIn('test@example.com', 'password123')

      // Wait for request to be registered
      await new Promise<void>((resolve) => moxios.wait(() => resolve()))

      const request = await moxios.requests.mostRecent()

      // Verify request transform
      expect(JSON.parse(request.config.data)).toEqual({
        email: 'test@example.com',
        password: 'password123',
      })

      await request.respondWith({
        status: 200,
        response: {
          auth_token: 'jwt.token.here',
          user: {
            id: 123,
            email: 'test@example.com',
            created_at: '2023-01-01',
          },
        },
      })

      // Verify response transform
      const result = await promise
      expect(result).toEqual({
        token: 'jwt.token.here',
        user: {
          id: 123,
          email: 'test@example.com',
        },
      })
      expect(result.user).not.toHaveProperty('created_at')
    })

    test('handles errors with both transforms', async () => {
      const builder = new ResourceBuilder({ baseURL: 'http://api.example.com' })

      const resource = builder.build('/auth', {
        signIn: {
          method: 'post',
          withParams: (email: string, password: string) => ({
            data: { email, password },
          }),
        },
      })

      moxios.stubRequest(/.*/, {
        status: 401,
        response: { error: 'Invalid credentials' },
      })

      try {
        await resource.signIn('test@example.com', 'wrong-password')
        fail('Should have thrown an error')
      } catch (error) {
        const axiosError = error as AxiosError
        expect(axiosError.response?.status).toBe(401)
        expect(axiosError.response?.data).toEqual({ error: 'Invalid credentials' })
      }
    })

    test('type safety - TypeScript compilation check', () => {
      const builder = new ResourceBuilder({ baseURL: 'http://api.example.com' })

      interface User {
        id: number
        email: string
      }

      interface SignInResponse {
        token: string
        user: User
      }

      // This code should compile without type errors
      const resource = builder.build('/auth', {
        // Both transforms
        signIn: {
          method: 'post',
          withParams: (email: string, password: string) => ({
            data: { email, password },
          }),
          withResult: (response: AxiosResponse): SignInResponse => ({
            token: response.data.token,
            user: response.data.user,
          }),
        },
        // Only request transform
        register: {
          method: 'post',
          withParams: (email: string, password: string) => ({
            data: { email, password },
          }),
        },
        // Only response transform
        getProfile: {
          method: 'get',
          withResult: (response: AxiosResponse): User => response.data.user,
        },
        // No transforms
        logout: {
          method: 'post',
        },
      })

      // TypeScript should infer these types correctly
      resource.signIn('email', 'password').then((result) => {
        const token: string = result.token
        const userId: number = result.user.id
        return { token, userId }
      })

      resource.register('email', 'password').then((response) => {
        const data: any = response.data
        return data
      })

      resource.getProfile().then((user) => {
        const id: number = user.id
        const email: string = user.email
        return { id, email }
      })

      resource.logout().then((response) => {
        const data: any = response.data
        return data
      })
    })
  })
})
