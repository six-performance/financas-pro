'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Sparkles } from 'lucide-react';
import { Loading } from '@/components/ui/loading';

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasVerified = useRef(false); 

  useEffect(() => {
    const verifyPayment = async () => {
      const sessionId = searchParams.get('session_id');

      if (!sessionId || !user) {
        router.push('/planos');
        return;
      }

      if (hasVerified.current) {
        console.log('⏭️ Verificação já foi feita, pulando...');
        return;
      }

      hasVerified.current = true;
      console.log('🔍 Iniciando verificação única:', { sessionId, userId: user.uid });

      try {
        const response = await fetch('/api/stripe/check-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId,
            userId: user.uid,
          }),
        });

        const data = await response.json();
        console.log('📊 Resposta recebida:', data);

        if (data.success) {
          console.log('✅ Pagamento confirmado!');
          setVerifying(false);
        } else {
          console.log('⚠️ Pagamento não confirmado:', data);
          setError(data.error || 'Não foi possível confirmar o pagamento');
          hasVerified.current = false; 
        }
      } catch (error) {
        console.error('❌ Erro ao verificar pagamento:', error);
        setError('Erro ao verificar pagamento');
        hasVerified.current = false; 
      }
    };

    if (user) {
      verifyPayment();
    }
  }, [searchParams, router, user]);

  if (verifying) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full">
          <CardContent className="p-12 text-center">
            <Loading size="lg" />
            <p className="mt-4 text-lg font-semibold text-[var(--foreground)]">
              {error ? error : 'Verificando pagamento...'}
            </p>
            <p className="text-sm text-[var(--muted-foreground)] mt-2">
              {error ? 'Redirecionando...' : 'Aguarde enquanto confirmamos sua assinatura'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-2xl w-full border-2 border-green-200 bg-gradient-to-br from-green-100 to-emerald-100">
        <CardContent className="p-12 text-center space-y-6">
          {/* Ícone de Sucesso */}
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
          </div>

            {/* Título */}
            <div>
              <h1 className="text-3xl font-bold text-black mb-2 flex items-center justify-center gap-2">
                Pagamento Confirmado!
                <Sparkles className="w-8 h-8 text-orange-500" />
              </h1>
              <p className="text-lg text-slate-700">
                Bem-vindo ao <strong>Plano PRO</strong>! 🎉
              </p>
            </div>

            {/* Descrição */}
            <div className="space-y-3 text-left bg-white p-6 rounded-lg">
              <p className="text-slate-900">
                <strong>Parabéns!</strong> Agora você tem acesso a todos os recursos premium:
              </p>
              <ul className="space-y-2 text-sm text-[var(--muted-foreground)]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Investimentos ilimitados
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Contato direto com gestora financeira
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Agendamento de reuniões
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Suporte prioritário
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Relatórios personalizados
                </li>
              </ul>
            </div>

            {/* Botão */}
            <Button
              size="lg"
              onClick={() => {
                // Forçar refresh do contexto de autenticação
                window.location.href = '/dashboard';
              }}
              className="w-full text-black bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600">
              Ir para Dashboard
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// Componente principal com Suspense
export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full">
          <CardContent className="p-12 text-center">
            <Loading size="lg" />
            <p className="mt-4 text-lg font-semibold text-[var(--foreground)]">
              Carregando...
            </p>
          </CardContent>
        </Card>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}

