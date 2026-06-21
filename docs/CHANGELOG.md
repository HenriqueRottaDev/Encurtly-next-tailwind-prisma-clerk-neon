# Changelog — Encurtly

## [Fase 1] MVP — Concluído

### Setup
- Projeto Next.js 16 criado (App Router + Turbopack)
- Banco de dados Neon (PostgreSQL, região São Paulo)
- Prisma configurado com schema completo (User, Link, Click, Workspace, Tag)
- Clerk configurado para autenticação
- Webhook do Clerk sincronizando usuários com o banco (user.created, user.deleted)

### Funcionalidades de link
- API REST de links: \`GET/POST /api/links\`, \`PATCH/DELETE /api/links/[id]\`
- Geração de slug único (nanoid) ou personalizado
- Validação de slug (regex, 3-50 caracteres)
- Redirecionamento via \`/r/[slug]\`
- QR Code gerado dinamicamente (\`/api/links/[id]/qrcode\`)
- Proteção por senha com tela dedicada
- Expiração por data (\`expiresAt\`) e por número de cliques (\`maxClicks\`)
- Pausar/ativar e deletar links

### Dashboard
- Arquitetura Server/Client Components otimizada
- Componentes: \`LinksDashboard\`, \`CreateLinkForm\`, \`LinkList\`, \`LinkCard\`, \`CopyButton\`, \`QRCodeButton\`, \`LinkActions\`
- TanStack Query para mutations + \`router.refresh()\` para revalidar Server Components
- Tema customizado (roxo #534AB7) com dark mode

### Arquitetura
- Repository Pattern (\`UserRepository\`, \`LinkRepository\`, \`ClickRepository\`)
- Separação de responsabilidades entre API routes e acesso a dados

### Testes
- Jest configurado (ts-node, mocks de Prisma e Clerk)
- 11 testes unitários (\`isValidSlug\`)
- 7 testes de integração (API de links)
- Playwright configurado com \`@clerk/testing\`
- 6 testes E2E (login, dashboard, criar link, copiar link)

---

## [Fase 2] Analytics — Em andamento

### Captura de dados de cliques
- \`extractClickInfo()\`: parsing de User-Agent (device, OS, browser) via \`ua-parser-js\`
- Captura de geolocalização via headers da Vercel (\`x-vercel-ip-country\`, \`x-vercel-ip-city\`)
- Captura de UTM parameters (\`utm_source\`, \`utm_medium\`, \`utm_campaign\`)
- Aplicado tanto no redirecionamento direto quanto na verificação de senha

---

## [Fase 2] Analytics — Concluído

### Captura de dados de cliques
- `extractClickInfo()`: parsing de User-Agent (device, OS, browser) via `ua-parser-js`
- Captura de geolocalização via headers da Vercel (`x-vercel-ip-country`, `x-vercel-ip-city`)
- Captura de UTM parameters (`utm_source`, `utm_medium`, `utm_campaign`)
- Aplicado tanto no redirecionamento direto quanto na verificação de senha

### Agregações (ClickRepository)
- `getClicksByDay()` — cliques por dia via SQL raw parametrizado
- `getByCountry/Device/Browser/Os/Referrer()` — agrupamento via `groupBy` do Prisma
- `getLinkAnalytics()` — agrega todas as métricas de um link em uma chamada

### APIs
- `GET /api/links/[id]/analytics?days=7|14|30|90` — analytics detalhado por link
- `GET /api/analytics/overview` — visão geral (total de links, cliques, top 5 links, cliques por dia)
- Validação de `days` restrita a valores permitidos (segurança)

### Dashboard de Analytics
- `/dashboard/analytics` — overview geral com cards de resumo, gráfico de linha (recharts) e ranking de links
- `/dashboard/links/[id]` — analytics individual: gráfico de cliques, breakdown por país, dispositivo, navegador, OS e referrer
- Componentes: `ClicksChart`, `BreakdownChart`, `AnalyticsOverview`, `LinkAnalyticsView`
- Link de acesso rápido (ícone de gráfico) em cada `LinkCard`

### Landing Page
- Home redesenhada com posicionamento de marca: "Zero ads", "LGPD/dados no Brasil", analytics completo
- Seções: hero, features, CTA final, footer
- Botões de Entrar/Criar conta direcionando para Clerk

### Testes
- 6 novos testes de integração para APIs de analytics (overview + por link)
- Testes E2E da home atualizados (hero, navegação para sign-up)
- Total: 27 testes Jest + 6 testes E2E passando


---

## [Fase 3] Monetização (Stripe) — Concluído

### Integração com Stripe
- Planos Pro (R$ 29/mês) e Agência (R$ 79/mês) criados no Stripe Dashboard
- Plano Free controlado via banco de dados (sem produto no Stripe)
- Cliente Stripe lazy-initialized via Proxy (evita falha de build na Vercel)
- Schema do banco estendido: `stripeCustomerId`, `stripeSubscriptionId`, `stripeCurrentPeriodEnd`, `stripeCancelAtPeriodEnd`

### APIs
- `POST /api/stripe/checkout` — cria customer (se necessário) e sessão de Checkout
- `POST /api/stripe/portal` — cria sessão do Billing Portal para autogerenciamento
- `POST /api/stripe/webhook` — processa eventos:
  - `checkout.session.completed` — ativa o plano após pagamento
  - `invoice.payment_succeeded` — atualiza período de renovação
  - `customer.subscription.updated` / `customer.subscription.deleted` — rebaixa para FREE em cancelamento/inadimplência, ou marca cancelamento agendado

### Limites por plano
- `lib/utils/check-limits.ts`: `checkLinkLimit()` e `checkClickLimit()`
- Free: 50 links / 1.000 cliques mensais — Pro: ilimitado / 25.000 — Agência: ilimitado / 100.000
- Bloqueio na criação de links ao atingir limite (com mensagem amigável e CTA de upgrade)
- Cliques além do limite mensal não são rastreados (silenciosamente, sem quebrar o redirecionamento)

### Interface
- `/pricing` — página de planos com cards Free/Pro/Agência, integração com checkout/portal
- `PlanUsage` no dashboard — mostra uso atual de links/cliques com barras de progresso
- Aviso de cancelamento agendado ("Sua assinatura está ativa até DD/MM/AAAA")
- Banner de boas-vindas após assinatura bem-sucedida

### LGPD
- Páginas `/privacy` (Política de Privacidade) e `/terms` (Termos de Uso)
- Aviso de aceite de termos na tela de cadastro

### Testes
- 13 testes para limites de plano (`check-limits.test.ts`)
- 6 testes para checkout (`stripe-checkout.test.ts`)
- 5 testes para portal do cliente (`stripe-portal.test.ts`)
- 11 testes para webhook (`stripe-webhook.test.ts`), cobrindo casos reais de incompatibilidade de versão da API Stripe (`current_period_end` aninhado em `items.data[0]`, `cancel_at` vs `cancel_at_period_end`)
- Total: 62 testes Jest + 7 testes E2E passando

### Bugs corrigidos durante o desenvolvimento
- Versão da API Stripe atualizada para `2026-05-27.dahlia`
- `current_period_end` não está mais no nível raiz da `Subscription`, mas dentro de `items.data[0]`
- `Invoice.subscription` renomeado — fallback para `invoice.parent.subscription_details.subscription`
- Cancelamento agendado nessa versão da API reflete via `cancel_at` (timestamp), não apenas `cancel_at_period_end`
- Webhook duplicado (Cloudflare Tunnel antigo) causando falhas de entrega — removido
- `NEXT_PUBLIC_APP_URL` configurada incorretamente na Vercel (causava URLs erradas no QR Code)