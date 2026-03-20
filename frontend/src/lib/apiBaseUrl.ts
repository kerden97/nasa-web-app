export function getApiBaseUrl(): string {
  const configuredUrl = import.meta.env.VITE_API_URL?.trim()
  if (configuredUrl) {
    return configuredUrl
  }

  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin
  }

  return 'http://localhost:4000'
}
