import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center">
          <Link href="/" className="font-semibold text-lg tracking-tight text-primary">
            Encurtly
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12 prose prose-invert prose-sm">
        <h1 className="text-2xl font-semibold mb-2">Política de Privacidade</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Última atualização: {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
        </p>

        <section className="space-y-4 text-sm leading-relaxed">
          <h2 className="text-lg font-semibold mt-6">1. Quem somos</h2>
          <p>
            O Encurtly é um serviço de encurtamento de links com analytics, operado a partir do Brasil.
            Esta política descreve como coletamos, usamos e protegemos seus dados pessoais, em conformidade
            com a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018).
          </p>

          <h2 className="text-lg font-semibold mt-6">2. Dados que coletamos</h2>
          <p><strong>Dados da conta:</strong> nome, e-mail, e dados de autenticação (gerenciados via Clerk).</p>
          <p><strong>Dados de pagamento:</strong> processados exclusivamente pelo Stripe. Não armazenamos dados
            de cartão de crédito em nossos servidores.</p>
          <p><strong>Dados de uso dos links:</strong> quando alguém clica em um link encurtado, registramos
            o endereço IP (usado apenas para geolocalização aproximada, não armazenado em texto puro),
            tipo de dispositivo, navegador, sistema operacional, página de origem (referrer) e parâmetros UTM.</p>

          <h2 className="text-lg font-semibold mt-6">3. Finalidade do tratamento</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Permitir o funcionamento do serviço de encurtamento e redirecionamento de links</li>
            <li>Gerar relatórios de analytics para o criador do link</li>
            <li>Processar pagamentos de assinaturas</li>
            <li>Comunicação sobre a conta e o serviço</li>
            <li>Prevenção de fraude e abuso da plataforma</li>
          </ul>

          <h2 className="text-lg font-semibold mt-6">4. Compartilhamento de dados</h2>
          <p>
            Utilizamos os seguintes prestadores de serviço, todos em conformidade com padrões internacionais
            de segurança:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Clerk</strong> — autenticação e gerenciamento de usuários</li>
            <li><strong>Stripe</strong> — processamento de pagamentos (PCI DSS Level 1)</li>
            <li><strong>Neon (PostgreSQL)</strong> — banco de dados, hospedado na região São Paulo (sa-east-1)</li>
            <li><strong>Vercel</strong> — hospedagem da aplicação</li>
          </ul>
          <p>Não vendemos nem compartilhamos seus dados com terceiros para fins publicitários.</p>

          <h2 className="text-lg font-semibold mt-6">5. Seus direitos (LGPD)</h2>
          <p>Você tem direito a:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Confirmar a existência de tratamento dos seus dados</li>
            <li>Acessar seus dados</li>
            <li>Corrigir dados incompletos, inexatos ou desatualizados</li>
            <li>Solicitar anonimização, bloqueio ou eliminação de dados desnecessários</li>
            <li>Solicitar a portabilidade dos dados</li>
            <li>Eliminar dados tratados com consentimento</li>
            <li>Revogar o consentimento a qualquer momento</li>
          </ul>
          <p>
            Para exercer qualquer um desses direitos, entre em contato pelo e-mail{' '}
            <a href="mailto:privacidade@encurtly.com.br" className="text-primary">privacidade@encurtly.com.br</a>.
          </p>

          <h2 className="text-lg font-semibold mt-6">5.1 Como solicitar a exclusão da sua conta</h2>
          <p>
            Para solicitar a exclusão da sua conta e de todos os dados pessoais associados (links,
            estatísticas de cliques e informações de cadastro), envie um e-mail para{' '}
            <a href="mailto:privacidade@encurtly.com.br" className="text-primary">privacidade@encurtly.com.br</a>{' '}
            com o assunto <strong>&quot;Exclusão de conta&quot;</strong>, a partir do mesmo endereço de
            e-mail cadastrado na sua conta.
          </p>
          <p>
            Processaremos sua solicitação em até 15 dias úteis. Caso você possua uma assinatura ativa,
            ela será cancelada antes da exclusão dos dados. Você receberá um e-mail de confirmação
            quando o processo for concluído.
          </p>

          <h2 className="text-lg font-semibold mt-6">6. Retenção de dados</h2>
          <p>
            Mantemos seus dados enquanto sua conta estiver ativa. Ao excluir sua conta, seus dados pessoais
            são removidos em até 30 dias, exceto quando a retenção for exigida por obrigação legal
            (ex: dados fiscais de pagamentos).
          </p>

          <h2 className="text-lg font-semibold mt-6">7. Segurança</h2>
          <p>
            Adotamos medidas técnicas e organizacionais para proteger seus dados, incluindo criptografia em
            trânsito (HTTPS/TLS), autenticação segura e acesso restrito aos dados armazenados.
          </p>

          <h2 className="text-lg font-semibold mt-6">8. Cookies</h2>
          <p>
            Utilizamos cookies essenciais para autenticação e funcionamento da plataforma. Não utilizamos
            cookies de rastreamento publicitário de terceiros.
          </p>

          <h2 className="text-lg font-semibold mt-6">9. Alterações nesta política</h2>
          <p>
            Podemos atualizar esta política periodicamente. Notificaremos sobre mudanças significativas
            através do e-mail cadastrado ou aviso na plataforma.
          </p>

          <h2 className="text-lg font-semibold mt-6">10. Contato</h2>
          <p>
            Dúvidas sobre esta política podem ser enviadas para{' '}
            <a href="mailto:privacidade@encurtly.com.br" className="text-primary">privacidade@encurtly.com.br</a>.
          </p>
        </section>
      </main>
    </div>
  )
}