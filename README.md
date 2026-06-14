# Encurtly 🔗

Encurtador de links inteligente com analytics completo, focado no público brasileiro (LGPD-first).

## ✨ Funcionalidades

### Links
- Encurtamento de URLs com slug personalizado
- QR Code automático para cada link
- Proteção por senha
- Expiração por data ou número de cliques
- Pausar/deletar links

### Analytics
- Dashboard geral com cliques totais, links criados e ranking de top links
- Gráfico de cliques ao longo do tempo (últimos 7/14/30/90 dias)
- Breakdown por país, dispositivo, navegador, sistema operacional e referrer
- Captura automática de UTM parameters

### Plataforma
- Landing page com posicionamento de marca (Zero ads, LGPD/dados no Brasil)
- Dashboard com Server/Client Components (Next.js App Router)
- Autenticação via Clerk

## 🛠️ Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 16 (App Router + Turbopack) |
| Banco de dados | PostgreSQL (Neon — região São Paulo) |
| ORM | Prisma |
| Autenticação | Clerk |
| Estado servidor | TanStack Query |
| UI | Tailwind CSS + shadcn/ui (preset Nova) |
| Testes unitários/integração | Jest |
| Testes E2E | Playwright + @clerk/testing |
| Deploy (planejado) | Vercel |

## 🚀 Como rodar localmente

### 1. Clonar e instalar dependências

\`\`\`bash
git clone <repo>
cd encurtly
npm install
\`\`\`

### 2. Configurar variáveis de ambiente

Cria um arquivo \`.env.local\` na raiz:

\`\`\`env
# Banco de dados (Neon)
DATABASE_URL="postgresql://..."

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
CLERK_WEBHOOK_SECRET="whsec_..."

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Testes E2E (Clerk)
E2E_CLERK_USER_EMAIL="e2e-test@encurtly.com"
E2E_CLERK_USER_PASSWORD="..."
\`\`\`

### 3. Configurar o banco de dados

\`\`\`bash
npx prisma migrate dev
npx prisma generate
\`\`\`

### 4. Rodar o servidor de desenvolvimento

\`\`\`bash
npm run dev
\`\`\`

Acesse [http://localhost:3000](http://localhost:3000)

### 5. Sincronizar webhooks do Clerk (necessário para novos cadastros)

Em outro terminal:

\`\`\`bash
npx cloudflared tunnel --url http://localhost:3000
\`\`\`

Copie a URL gerada e configure em **Clerk Dashboard → Webhooks** apontando para:
\`https://SUA-URL.trycloudflare.com/api/webhooks/clerk\`

## 🧪 Testes

\`\`\`bash
# Testes unitários e integração
npm test

# Testes E2E (Playwright)
npm run test:e2e

# Testes E2E com interface visual
npm run test:e2e:ui
\`\`\`

## 📁 Estrutura do projeto

\`\`\`
encurtly/
├── app/
│   ├── api/
│   │   ├── links/             # CRUD de links + QR Code + verificação de senha + analytics
│   │   ├── analytics/         # Overview geral de analytics
│   │   └── webhooks/clerk/    # Sincronização de usuários
│   ├── dashboard/
│   │   ├── analytics/         # Página de analytics geral
│   │   └── links/[id]/        # Página de analytics por link
│   ├── r/[slug]/               # Redirecionamento público
│   ├── sign-in/ sign-up/      # Autenticação (Clerk)
│   └── page.tsx                # Landing page
├── components/
│   ├── links/                  # Componentes do dashboard de links
│   └── analytics/              # Componentes de gráficos e breakdowns
├── lib/
│   ├── repositories/           # Camada de acesso ao banco (Repository Pattern)
│   ├── utils/
│   │   ├── slug.ts
│   │   └── click-info.ts       # Extração de dados de cliques (device, OS, geo, UTM)
│   └── prisma.ts
├── prisma/
│   └── schema.prisma
├── e2e/                         # Testes Playwright
└── __tests__/                   # Testes Jest               # Testes Jest
\`\`\`

## 📊 Roadmap

Veja [docs/roadmap.md](./docs/roadmap.md) para o planejamento completo das fases.