const VERCEL_TOKEN = process.env.VERCEL_TOKEN!
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID!
const BASE = 'https://api.vercel.com'

function headers() {
  return {
    Authorization: `Bearer ${VERCEL_TOKEN}`,
    'Content-Type': 'application/json',
  }
}

export async function addDomainToVercel(domain: string) {
  const res = await fetch(`${BASE}/v9/projects/${VERCEL_PROJECT_ID}/domains`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ name: domain }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error?.message ?? 'Erro ao adicionar domínio na Vercel.')
  return data
}

export async function removeDomainFromVercel(domain: string) {
  const res = await fetch(`${BASE}/v9/projects/${VERCEL_PROJECT_ID}/domains/${domain}`, {
    method: 'DELETE',
    headers: headers(),
  })
  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.error?.message ?? 'Erro ao remover domínio da Vercel.')
  }
  return true
}

export async function getDomainStatus(domain: string) {
  const res = await fetch(
    `${BASE}/v9/projects/${VERCEL_PROJECT_ID}/domains/${domain}`,
    { headers: headers() }
  )
  const data = await res.json()
  if (!res.ok) throw new Error(data.error?.message ?? 'Erro ao verificar domínio.')
  return {
    verified: data.verified ?? false,
    cname: data.apexName ?? domain,
    verification: data.verification ?? [],
  }
}