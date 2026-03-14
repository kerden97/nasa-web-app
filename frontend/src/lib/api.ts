const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export async function fetchApi<T>(
  path: string,
  params?: Record<string, string>,
  signal?: AbortSignal,
): Promise<T> {
  const url = new URL(path, API_URL)
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value) url.searchParams.set(key, value)
    })
  }

  const response = await fetch(url.toString(), { signal })

  if (!response.ok) {
    const body = await response.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(body.error || `API error: ${response.status}`)
  }

  return response.json()
}
