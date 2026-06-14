# Arquitetura — Encurtly

## Decisões técnicas principais

### 1. Repository Pattern

Toda lógica de acesso ao banco (Prisma) fica isolada em \`lib/repositories/\`:
- \`UserRepository\` — usuários
- \`LinkRepository\` — links encurtados
- \`ClickRepository\` — registros de cliques/analytics

**Por quê:** facilita testes (mock simples), manutenção e possíveis trocas de ORM no futuro.

### 2. Server vs Client Components (Next.js App Router)

Regra geral:
- **Server Components** (padrão): buscam dados, renderizam HTML estático
- **Client Components** (\`'use client'\`): apenas onde há interatividade (formulários, botões com estado, hooks)

Hierarquia no dashboard:
\`\`\`
DashboardPage (Server) → busca links no servidor
  └── LinksDashboard (Client) → controla estado do formulário
        ├── CreateLinkForm (Client) → formulário
        └── LinkList (Server) → renderiza lista
              └── LinkCard (Server) → cada item
                    ├── CopyButton (Client)
                    ├── QRCodeButton (Client)
                    └── LinkActions (Client)
\`\`\`

### 3. Autenticação via Clerk + Webhook

- Clerk gerencia login/cadastro/sessões
- Webhook (\`/api/webhooks/clerk\`) sincroniza usuários no banco local na criação/exclusão
- Em desenvolvimento, o webhook precisa de um tunnel (Cloudflare Tunnel) para receber eventos do Clerk

### 4. Slugs

- \`nanoid(6)\` para slugs automáticos (curtos e únicos)
- Slugs personalizados validados via regex: \`/^[a-zA-Z0-9-_]{3,50}$/\`
- Verificação de unicidade no banco antes de criar

### 5. Captura de Analytics

\`extractClickInfo()\` centraliza a extração de:
- User-Agent → device/OS/browser (\`ua-parser-js\`)
- Geolocalização → headers injetados pela Vercel em produção
- UTM params → query string da URL

### 6. Testes

| Tipo | Ferramenta | O que cobre |
|---|---|---|
| Unitário | Jest | Funções puras (ex: validação de slug) |
| Integração | Jest + mocks | APIs com Prisma/Clerk mockados |
| E2E | Playwright + @clerk/testing | Fluxos completos no browser |

## Variáveis de ambiente

Ver \`.env.local\` (não commitado). Lista completa no README.