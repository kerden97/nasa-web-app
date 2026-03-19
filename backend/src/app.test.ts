import request from 'supertest'
import { createApp } from './app'

describe('createApp', () => {
  it('returns JSON 404 responses for unknown routes', async () => {
    const response = await request(createApp()).get('/api/does-not-exist')

    expect(response.status).toBe(404)
    expect(response.headers['content-type']).toContain('application/json')
    expect(response.body).toEqual({
      error: 'Route not found',
      code: 'route_not_found',
      status: 404,
    })
  })
})
