export function buildProxyUrlAtWidth(proxyUrl: string, width: number): string {
  try {
    const url = new URL(proxyUrl)
    url.searchParams.set('w', String(width))
    return url.toString()
  } catch {
    return proxyUrl
  }
}

export function buildCardSrcSet(proxyUrl: string): string {
  return `${buildProxyUrlAtWidth(proxyUrl, 320)} 320w, ${buildProxyUrlAtWidth(proxyUrl, 480)} 480w, ${proxyUrl} 640w`
}
