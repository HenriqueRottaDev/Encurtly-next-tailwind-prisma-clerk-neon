import Link from 'next/link'

export default function TermsPage() {
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
        <h1 className="text-2xl font-semibold mb-2">Termos de Uso</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Última atualização: {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
        </p>

        <section className="space-y-4 text-sm leading-relaxed">
          <h2 className="text-lg font-semibold mt-6">1. Aceitação dos termos</h2>
          <p>
            Ao criar uma conta e utilizar o Encurtly, você concorda com estes Termos de Uso e com nossa
            <Link href="/privacy" className="text-primary"> Política de Privacidade</Link>.
          </p>

          <h2 className="text-lg font-semibold mt-6">2. Descrição do serviço</h2>
          <p>
            O Encurtly é uma plataforma de encurtamento de links com recursos de analytics, QR Code,
            proteção por senha e expiração de links.
          </p>

          <h2 className="text-lg font-semibold mt-6">3. Planos e pagamento</h2>
          <p>
            Oferecemos um plano gratuito com limites de uso e planos pagos (Pro e Agência) com cobrança
            recorrente mensal via Stripe. Você pode cancelar sua assinatura a qualquer momento através do
            portal de gerenciamento — o acesso ao plano pago permanece ativo até o fim do período já pago.
          </p>

          <h2 className="text-lg font-semibold mt-6">4. Uso aceitável</h2>
          <p>Você concorda em não utilizar o Encurtly para:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Distribuir malware, phishing ou conteúdo fraudulento</li>
            <li>Violar direitos autorais ou de propriedade intelectual de terceiros</li>
            <li>Praticar spam ou envio não solicitado de mensagens em massa</li>
            <li>Atividades ilegais sob a legislação brasileira</li>
            <li>Conteúdo que promova discurso de ódio, violência ou discriminação</li>
          </ul>
          <p>
            Reservamo-nos o direito de suspender ou encerrar contas que violem estes termos, sem aviso prévio.
          </p>

          <h2 className="text-lg font-semibold mt-6">5. Limitação de responsabilidade</h2>
          <p>
            O Encurtly não se responsabiliza pelo conteúdo dos sites de destino dos links criados pelos
            usuários. O serviço é fornecido &quot;como está&quot;, sem garantias de disponibilidade ininterrupta.
          </p>

          <h2 className="text-lg font-semibold mt-6">6. Propriedade dos dados</h2>
          <p>
            Você mantém a propriedade de todo o conteúdo e dados que insere na plataforma. Concedemos a você
            uma licença para usar o Encurtly conforme estes termos.
          </p>

          <h2 className="text-lg font-semibold mt-6">7. Cancelamento de conta</h2>
          <p>
            Você pode cancelar sua conta a qualquer momento. Após o cancelamento, seus dados serão removidos
            conforme descrito em nossa Política de Privacidade.
          </p>

          <h2 className="text-lg font-semibold mt-6">8. Alterações nos termos</h2>
          <p>
            Podemos atualizar estes termos periodicamente. O uso continuado do serviço após alterações
            constitui aceitação dos novos termos.
          </p>

          <h2 className="text-lg font-semibold mt-6">9. Lei aplicável</h2>
          <p>
            Estes termos são regidos pelas leis da República Federativa do Brasil.
          </p>

          <h2 className="text-lg font-semibold mt-6">10. Contato</h2>
          <p>
            Dúvidas sobre estes termos podem ser enviadas para{' '}
            <a href="mailto:contato@encurtly.com.br" className="text-primary">contato@encurtly.com.br</a>.
          </p>
        </section>
      </main>
    </div>
  )
}