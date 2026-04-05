// ASOS product pages use Next.js SSR, so __NEXT_DATA__ is in the HTML
export function extractAsosJson(html: string): object | undefined {
  const match = html.match(
    /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/
  )
  if (!match) return undefined

  try {
    const data = JSON.parse(match[1])
    const product =
      data?.props?.pageProps?.product ||
      data?.props?.pageProps?.pdpData?.product
    return product ?? undefined
  } catch {
    return undefined
  }
}
