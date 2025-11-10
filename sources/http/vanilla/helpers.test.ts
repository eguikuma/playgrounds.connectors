import { StatusCodes } from 'http-status-codes'
import { describe, test, expect, vi } from 'vitest'

import { execute } from './helpers'
import type { Request } from '../core/request'

describe('helpers.ts', () => {
  test('GETの場合、エンドポイントとオプションを渡すこと', async () => {
    const data = { id: 1, name: 'Got' }
    const options = { verify: (value: typeof data) => 'id' in value }
    const request = {
      get: vi.fn().mockResolvedValue({ success: true, status: StatusCodes.OK, data }),
    } as unknown as Request<string>

    await execute(request, 'GET', '/users', undefined, options)

    expect(request.get).toHaveBeenCalledWith('/users', options)
  })

  test('POSTの場合、エンドポイントとボディとオプションを渡すこと', async () => {
    const body = { name: 'Posted' }
    const data = { id: 1, ...body }
    const options = { verify: (value: typeof data) => 'id' in value }
    const request = {
      post: vi.fn().mockResolvedValue({
        success: true,
        status: StatusCodes.CREATED,
        data,
      }),
    } as unknown as Request<string>

    await execute(request, 'POST', '/users', body, options)

    expect(request.post).toHaveBeenCalledWith('/users', body, options)
  })

  test('PUTの場合、エンドポイントとボディとオプションを渡すこと', async () => {
    const body = { name: 'Put' }
    const data = { id: 1, ...body }
    const options = { verify: (value: typeof data) => 'id' in value }
    const request = {
      put: vi.fn().mockResolvedValue({ success: true, status: StatusCodes.OK, data }),
    } as unknown as Request<string>

    await execute(request, 'PUT', '/users/1', body, options)

    expect(request.put).toHaveBeenCalledWith('/users/1', body, options)
  })

  test('PATCHの場合、エンドポイントとボディとオプションを渡すこと', async () => {
    const body = { name: 'Patched' }
    const data = { id: 1, ...body }
    const options = { verify: (value: typeof data) => 'id' in value }
    const request = {
      patch: vi.fn().mockResolvedValue({ success: true, status: StatusCodes.OK, data }),
    } as unknown as Request<string>

    await execute(request, 'PATCH', '/users/1', body, options)

    expect(request.patch).toHaveBeenCalledWith('/users/1', body, options)
  })

  test('DELETEの場合、エンドポイントとオプションを渡すこと', async () => {
    const options = { verify: () => true }
    const request = {
      delete: vi.fn().mockResolvedValue({
        success: true,
        status: StatusCodes.NO_CONTENT,
        data: undefined,
      }),
    } as unknown as Request<string>

    await execute(request, 'DELETE', '/users/1', undefined, options)

    expect(request.delete).toHaveBeenCalledWith('/users/1', options)
  })
})
