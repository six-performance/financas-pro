'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PlansPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [downgradeLoading, setDowngradeLoading] = useState(false);

  // O layout do grupo `(app)` já garante autenticação, mas mantemos o guard
  // para satisfazer o TypeScript e evitar edge cases de renderização.
  if (!user) {
    return null;
  }

  const handleSubscribe = async () => {
    if (!user) return;

    try {
      setCheckoutLoading(true);
      
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          email: user.email,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Erro ao criar sessão de pagamento');
      }
    } catch (error) {
      console.error('Erro ao iniciar checkout:', error);
      alert('Erro ao processar pagamento');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleDowngrade = async () => {
    if (!user) return;

    const confirmDowngrade = confirm(
      'Tem certeza que deseja fazer downgrade para o plano gratuito?\n\n' +
      'Você perderá acesso a:\n' +
      '• Investimentos ilimitados\n' +
      '• Contato com gestora financeira\n' +
      '• Agendamento de reuniões\n' +
      '• Suporte prioritário'
    );

    if (!confirmDowngrade) return;

    try {
      setDowngradeLoading(true);

      const response = await fetch('/api/stripe/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Downgrade realizado com sucesso! Redirecionando...');
        window.location.reload(); // Recarregar para atualizar o contexto
      } else {
        alert(data.error || 'Erro ao fazer downgrade');
      }
    } catch (error) {
      console.error('Erro ao fazer downgrade:', error);
      alert('Erro ao processar downgrade');
    } finally {
      setDowngradeLoading(false);
    }
  };

  const freePlanFeatures = [
    { text: 'Dashboard com visão geral', included: true },
    { text: 'Explorar investimentos', included: true },
    { text: 'Conteúdo educacional completo', included: true },
    { text: 'Simulador de investimentos', included: true },
    { text: 'Quiz de perfil do investidor', included: true },
    { text: 'Investimentos limitados (até 5)', included: true },
    { text: 'Contato com gestora financeira', included: false },
    { text: 'Suporte prioritário', included: false },
  ];

  const proPlanFeatures = [
    { text: 'Dashboard com visão geral', included: true },
    { text: 'Explorar investimentos', included: true },
    { text: 'Conteúdo educacional completo', included: true },
    { text: 'Simulador de investimentos', included: true },
    { text: 'Quiz de perfil do investidor', included: true },
    { text: 'Investimentos ilimitados', included: true },
    { text: 'Contato direto com gestora financeira', included: true },
    { text: 'Agendamento de reuniões', included: true },
    { text: 'Suporte prioritário', included: true },
    { text: 'Relatórios personalizados', included: true },
  ];

  const isPaidUser = user.subscriptionStatus === 'paid';

  return (
    <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-[var(--foreground)]">
            {isPaidUser ? 'Sua Assinatura 💎' : 'Escolha seu Plano 💎'}
          </h1>
          <p className="text-xl text-[var(--muted-foreground)]">
            {isPaidUser 
              ? 'Você tem acesso total a todos os recursos premium' 
              : 'Invista no seu futuro financeiro com as ferramentas certas'
            }
          </p>
        </div>

        {/* Mensagem de assinatura ativa */}
        {isPaidUser && (
          <Card className="max-w-3xl mx-auto border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
            <CardContent className="p-8 text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
              </div>
              
              <div>
                <h2 className="text-2xl font-bold text-[var(--foreground)] mb-2 flex items-center justify-center gap-2">
                  <Sparkles className="w-6 h-6 text-brand-orange" />
                  Você é PRO!
                  <Sparkles className="w-6 h-6 text-brand-orange" />
                </h2>
                <p className="text-lg text-slate-700 mb-4">
                  Sua assinatura está <strong className="text-green-600">ativa</strong> e você tem acesso a todos os recursos premium.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="text-center">
                    <div className="text-3xl mb-1">✅</div>
                    <div className="text-sm font-medium text-slate-700">Investimentos Ilimitados</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl mb-1">📞</div>
                    <div className="text-sm font-medium text-slate-700">Contato com Gestora</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl mb-1">📅</div>
                    <div className="text-sm font-medium text-slate-700">Agendamento de Reuniões</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl mb-1">🎯</div>
                    <div className="text-sm font-medium text-slate-700">Suporte Prioritário</div>
                  </div>
                </div>
              </div>

              <Button
                size="lg"
                onClick={() => router.push('/dashboard')}
                className="w-full max-w-md mx-auto bg-gradient-to-r from-brand-orange to-brand-red hover:from-brand-orange/90 hover:to-brand-red/90"
              >
                Ir para Dashboard
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Planos */}
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {/* Plano Gratuito */}
          <Card className="flex flex-col">
            <CardHeader className="pb-8">
              <CardTitle className="text-2xl">Gratuito</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold">R$ 0</span>
                <span className="text-xl text-[var(--muted-foreground)]">/mês</span>
              </div>
              <CardDescription className="text-base mt-2">
                Perfeito para começar sua jornada de investimentos
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-6">
              <ul className="space-y-3">
                {freePlanFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    {feature.included ? (
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    )}
                    <span className={cn(
                      "text-sm",
                      feature.included ? "text-slate-700" : "text-slate-400"
                    )}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                variant="outline"
                size="lg"
                className="w-full"
                disabled={!isPaidUser || downgradeLoading}
                onClick={isPaidUser ? handleDowngrade : undefined}
              >
                {downgradeLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Processando...
                  </>
                ) : !isPaidUser ? (
                  'Plano Atual'
                ) : (
                  'Fazer Downgrade'
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Plano PRO */}
          <Card className="flex flex-col border-2 border-brand-orange relative bg-gradient-to-br from-orange-50/50 to-red-50/30">
            <div className="absolute -top-3 right-6">
              <Badge className="bg-brand-orange hover:bg-brand-red">
                RECOMENDADO
              </Badge>
            </div>
            <CardHeader className="pb-8">
              <div className="flex items-center gap-2">
                <CardTitle className="text-2xl">PRO</CardTitle>
                <Sparkles className="w-6 h-6 text-brand-orange" />
              </div>
              <div className="mt-4">
                <span className="text-4xl font-bold">R$ 29,90</span>
                <span className="text-xl text-[var(--muted-foreground)]">/mês</span>
              </div>
              <CardDescription className="text-base mt-2">
                Para investidores que querem ir além e ter suporte especializado
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-6">
              <ul className="space-y-3">
                {proPlanFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-700">
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-brand-orange to-brand-red hover:from-brand-orange/90 hover:to-brand-red/90"
                disabled={isPaidUser || checkoutLoading}
                onClick={handleSubscribe}
              >
                {checkoutLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Processando...
                  </>
                ) : isPaidUser ? (
                  'Plano Atual'
                ) : (
                  'Assinar Agora'
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Benefícios */}
        <Card className="max-w-5xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Por que escolher o Plano PRO?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h3 className="text-lg font-bold">🎯 Suporte Especializado</h3>
                <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                  Tenha acesso direto a gestores financeiros experientes para tirar dúvidas
                  e receber orientações personalizadas.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold">📊 Investimentos Ilimitados</h3>
                <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                  Construa um portfólio diversificado sem limitações, explorando todas as
                  oportunidades do mercado.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold">📅 Agendamento Flexível</h3>
                <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                  Agende reuniões com gestoras nos horários que funcionam para você e
                  receba consultoria personalizada.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
    </div>
  );
}
