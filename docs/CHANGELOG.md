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