import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY!)

interface UsageAlertParams {
  to: string
  name: string | null
  planName: string
  linksUsed: number
  linksLimit: number | null
  clicksUsed: number
  clicksLimit: number
}

export async function sendUsageAlertEmail({
  to,
  name,
  planName,
  linksUsed,
  linksLimit,
  clicksUsed,
  clicksLimit,
}: UsageAlertParams) {
  const greeting = name ? `Olá, ${name}!` : 'Olá!'

  const linksLine = linksLimit
    ? `<li>Links: <strong>${linksUsed} / ${linksLimit}</strong></li>`
    : ''

  await resend.emails.send({
    from: 'Encurtly <onboarding@resend.dev>',
    to,
    subject: '⚠️ Você está perto do limite do seu plano',
    html: `
      <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #7C3AED;">Encurtly</h2>
        <p>${greeting}</p>
        <p>Você está usando mais de <strong>80%</strong> do limite do seu plano <strong>${planName}</strong>:</p>
        <ul style="line-height: 1.8;">
          ${linksLine}
          <li>Cliques este mês: <strong>${clicksUsed} / ${clicksLimit}</strong></li>
        </ul>
        <p>Para continuar sem interrupções, considere fazer upgrade do seu plano.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/pricing" style="display: inline-block; background: #7C3AED; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; margin-top: 12px;">
          Ver planos
        </a>
        <p style="color: #888; font-size: 12px; margin-top: 32px;">
          Encurtly — Links inteligentes para campanhas que convertem.
        </p>
      </div>
    `,
  })
}