const API_KEY = process.env.GOOGLE_SAFE_BROWSING_API_KEY!
const ENDPOINT = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${API_KEY}`

const THREAT_TYPES = [
  'MALWARE',
  'SOCIAL_ENGINEERING',
  'UNWANTED_SOFTWARE',
  'POTENTIALLY_HARMFUL_APPLICATION',
]

export async function isUrlMalicious(url: string): Promise<boolean> {
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client: { clientId: 'encurtly', clientVersion: '1.0.0' },
        threatInfo: {
          threatTypes: THREAT_TYPES,
          platformTypes: ['ANY_PLATFORM'],
          threatEntryTypes: ['URL'],
          threatEntries: [{ url }],
        },
      }),
    })

    if (!res.ok) return false // em caso de erro na API, não bloqueia

    const data = await res.json()
    return !!(data.matches && data.matches.length > 0)
  } catch {
    return false // falha silenciosa — não bloqueia o usuário
  }
}