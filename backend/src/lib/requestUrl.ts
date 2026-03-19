import type { Request } from 'express'

export function getRequestBaseUrl(req: Request): string {
  const forwardedProto = req.get('x-forwarded-proto')?.split(',')[0]?.trim()
  const forwardedHost = req.get('x-forwarded-host')
  const protocol = forwardedProto || req.protocol || 'http'
  const host = forwardedHost || req.get('host')

  return `${protocol}://${host}`
}
