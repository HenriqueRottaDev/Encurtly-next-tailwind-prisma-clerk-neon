import { UAParser } from 'ua-parser-js'
import { headers } from 'next/headers'

export interface ClickInfo {
  referrer: string | null
  country: string | null
  city: string | null
  device: string | null
  os: string | null
  browser: string | null
  utmSource: string | null
  utmMedium: string | null
  utmCampaign: string | null
}

export async function extractClickInfo(url: string): Promise<ClickInfo> {
  const headersList = await headers()
  const userAgent = headersList.get('user-agent') ?? ''

  const parser = new UAParser(userAgent)
  const result = parser.getResult()

  // Geolocalização via headers da Vercel (disponível em produção)
  const country = headersList.get('x-vercel-ip-country') ?? null
  const city = headersList.get('x-vercel-ip-city')
    ? decodeURIComponent(headersList.get('x-vercel-ip-city')!)
    : null

  // UTM params da URL
  const { searchParams } = new URL(url)

  return {
    referrer: headersList.get('referer') ?? null,
    country,
    city,
    device: result.device.type ?? 'desktop', // mobile, tablet, ou desktop
    os: result.os.name ?? null,
    browser: result.browser.name ?? null,
    utmSource: searchParams.get('utm_source'),
    utmMedium: searchParams.get('utm_medium'),
    utmCampaign: searchParams.get('utm_campaign'),
  }
}