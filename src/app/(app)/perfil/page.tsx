'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loading } from '@/components/ui/loading';
import { User, TrendingUp, Shield, Zap, CheckCircle2, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/ui/page-header';

const supabaseClient = createClient();

interface Question {
  id: number;
  question: string;
  options: {
    text: string;
    score: number;
  }[];
}

const questions: Question[] = [
  {
    id: 1,
    question: 'Qual é o seu principal objetivo com investimentos?',
    options: [
      { text: 'Preservar o capital sem correr riscos', score: 1 },
      { text: 'Crescimento moderado com algum risco', score: 2 },
      { text: 'Maximizar ganhos, aceito riscos elevados', score: 3 },
    ],
  },
  {
    id: 2,
    question: 'Como você reagiria se seu investimento perdesse 20% do valor em um mês?',
    options: [
      { text: 'Venderia tudo imediatamente', score: 1 },
      { text: 'Aguardaria e analisaria a situação', score: 2 },
      { text: 'Aproveitaria para comprar mais', score: 3 },
    ],
  },
  {
    id: 3,
    question: 'Qual é o seu conhecimento sobre investimentos?',
    options: [
      { text: 'Básico, prefiro opções mais seguras', score: 1 },
      { text: 'Intermediário, entendo os riscos', score: 2 },
      { text: 'Avançado, já invisto em ações e derivativos', score: 3 },
    ],
  },
  {
    id: 4,
    question: 'Qual é o prazo dos seus investimentos?',
    options: [
      { text: 'Curto prazo (até 1 ano)', score: 1 },
      { text: 'Médio prazo (1-5 anos)', score: 2 },
      { text: 'Longo prazo (mais de 5 anos)', score: 3 },
    ],
  },
  {
    id: 5,
    question: 'Qual porcentagem do seu patrimônio você investiria em ações?',
    options: [
      { text: 'Até 20%', score: 1 },
      { text: 'Entre 20% e 50%', score: 2 },
      { text: 'Mais de 50%', score: 3 },
    ],
  },
];

const profileInfo = {
  conservador: {
    title: 'Conservador',
    icon: Shield,
    color: 'blue',
    description: 'Você prioriza segurança e prefere investimentos de baixo risco como renda fixa.',
    recommendations: [
      'Títulos do Tesouro Direto',
      'CDBs de bancos grandes',
      'Fundos de Renda Fixa',
      'LCI/LCA',
    ],
  },
  moderado: {
    title: 'Moderado',
    icon: TrendingUp,
    color: 'orange',
    description: 'Você busca equilíbrio entre segurança e rentabilidade, aceitando riscos moderados.',
    recommendations: [
      'Fundos Multimercado',
      'Ações de empresas consolidadas',
      'Fundos Imobiliários',
      'Diversificação entre renda fixa e variável',
    ],
  },
  arrojado: {
    title: 'Arrojado',
    icon: Zap,
    color: 'red',
    description: 'Você busca máxima rentabilidade e aceita riscos elevados em busca de maiores retornos.',
    recommendations: [
      'Ações de crescimento (Growth)',
      'Small Caps',
      'Day Trade e Swing Trade',
      'Criptomoedas',
      'Derivativos (Opções, Futuros)',
    ],
  },
};

export default function PerfilPage() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<'conservador' | 'moderado' | 'arrojado' | null>(null);
  const [saving, setSaving] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    if (user?.riskProfile) {
      setHasProfile(true);
      setResult(user.riskProfile as any);
    }
  }, [user]);

  const handleAnswer = async (score: number) => {
    const newAnswers = [...answers, score];
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Última pergunta - calcula e salva automaticamente
       await calculateAndSaveResult(newAnswers);
    }
  };

   const calculateAndSaveResult = async (finalAnswers: number[]) => {
     const total = finalAnswers.reduce((sum, score) => sum + score, 0);
     const average = total / finalAnswers.length;

     let profile: 'conservador' | 'moderado' | 'arrojado';
     if (average <= 1.5) {
       profile = 'conservador';
     } else if (average <= 2.5) {
       profile = 'moderado';
     } else {
       profile = 'arrojado';
     }

  //    Salvar automaticamente no banco
     if (!user) {
       console.error('Usuário não está logado');
       alert('Você precisa estar logado para salvar o perfil.');
       return;
     }

     setSaving(true);
    
     try {
  //      Verifica se o usuário existe
       const { data: existingUser, error: checkError } = await supabaseClient
         .from('users')
         .select('id, risk_profile')
         .eq('id', user.uid)
         .single();

       if (checkError) {
         console.error('Erro ao verificar usuário:', checkError);
         throw new Error('Usuário não encontrado no banco de dados');
       }

  //      Atualiza o perfil
       const { data: updatedData, error: updateError } = await supabaseClient
         .from('users')
         .update({ 
           risk_profile: profile,
           updated_at: new Date().toISOString()
         })
         .eq('id', user.uid)
         .select();

       if (updateError) {
         console.error('Erro ao atualizar perfil:', updateError);
         throw updateError;
       }

  //      Mostra o resultado imediatamente
       setResult(profile);
       setHasProfile(true);

  //      Atualiza o contexto do usuário em background (não-bloqueante)
       refreshUser().catch((error) => {
         console.error('Erro ao atualizar contexto:', error);
       });

     } catch (error: any) {
       console.error('Erro ao salvar perfil:', error);
      
  //      Mensagens de erro mais específicas
       let errorMessage = 'Erro ao salvar perfil. ';
       if (error.message?.includes('não encontrado')) {
         errorMessage += 'Usuário não encontrado. Faça logout e login novamente.';
       } else {
         errorMessage += error.message || 'Tente novamente em alguns instantes.';
       }
      
       alert(errorMessage);
      
  //      Reset em caso de erro
       setResult(null);
       setHasProfile(false);
     } finally {
  //      SEMPRE desativa o loading, independente de sucesso ou erro
       setSaving(false);
     }
   };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setResult(null);
    setHasProfile(false);
    setSaving(false);
  };

  const ProfileIcon = result ? profileInfo[result].icon : User;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <PageHeader 
        title="Perfil do Investidor"
        description="Descubra seu perfil de risco e receba recomendações personalizadas"
        icon="📊"
      />

        {/* Perfil Atual */}
        {hasProfile && result && (
          <Alert className="bg-gradient-to-r from-green-100 to-emerald-100 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600 !text-green-600" />
            <AlertDescription className="text-green-800">
              Você possui um perfil definido: <strong>{profileInfo[result].title}</strong> 
              Seu perfil foi salvo e suas recomendações estão abaixo.
            </AlertDescription>
          </Alert>
        )}

        {/* Questionário */}
        {!result && !saving && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center mb-2">
                <CardTitle>Questionário de Perfil</CardTitle>
                <Badge variant="secondary">
                  Questão {currentQuestion + 1} de {questions.length}
                </Badge>
              </div>
              {/* Barra de Progresso */}
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-[#ff6b2d] to-[#b91c1c] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">
                  {questions[currentQuestion].question}
                </h3>
                <div className="space-y-3">
                  {questions[currentQuestion].options.map((option, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      onClick={() => handleAnswer(option.score)}
                      className="w-full justify-start text-left h-auto py-4 px-6 hover:border-brand-orange hover:bg-gradient-to-r from-[#ff6b2d] to-[#b91c1c]"
                    >
                      <span className="flex-1">{option.text}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading ao salvar */}
        {saving && !result && (
          <Card>
            <CardContent className="p-12 text-center">
              <Loading size="lg" />
              <p className="mt-4 text-lg font-semibold text-[var(--foreground)]">
                Salvando seu perfil...
              </p>
              <p className="text-sm text-[var(--muted-foreground)] mt-2">
                Aguarde enquanto processamos suas respostas
              </p>
            </CardContent>
          </Card>
        )}

        {/* Resultado */}
        {result && (
          <Card className="border-2">
            <CardHeader>
              <div className="flex items-center gap-4 mb-4">
                <div className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center",
                  result === 'conservador' ? 'bg-blue-200' :
                  result === 'moderado' ? 'bg-orange-400' :
                  'bg-red-400'
                )}>
                  <ProfileIcon className={cn(
                    "w-8 h-8",
                    result === 'conservador' ? 'text-green-600' :
                    result === 'moderado' ? 'text-brand-orange' :
                    'text-brand-red'
                  )} />
                </div>
                <div>
                  <CardTitle className="text-2xl">
                    Seu perfil: {profileInfo[result].title}
                  </CardTitle>
                  <CardDescription className="text-base mt-1">
                    {profileInfo[result].description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Recomendações */}
              <div>
                <h4 className="font-semibold text-[var(--foreground)] mb-3">
                  Investimentos Recomendados:
                </h4>
                <div className="grid gap-2">
                  {profileInfo[result].recommendations.map((rec, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-3 bg-[var(--secondary)] rounded-lg"
                    >
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="text-[var(--foreground)]">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dica */}
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Este é um perfil indicativo. Busque sempre orientação profissional antes de investir.
                </AlertDescription>
              </Alert>

              {/* Botões */}
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <Button
                  onClick={() => router.push('/investimentos')}
                  size="lg"
                  className="min-w-[250px] bg-gradient-to-r from-brand-orange to-brand-red text-[var(--foreground)] border-2 border-[var(--border)] shadow-sm hover:shadow-x1 hover:scale-[1.04] active:scale-[0.98] transition-all duration-200"
                >
                  Ver Investimentos Recomendados
                </Button>
                <Button
                  onClick={resetQuiz}
                  // variant="outline"
                  size="lg"
                  className="min-w-[250px] bg-gradient-to-r from-brand-orange to-brand-red text-[var(--foreground)] border-2 border-[var(--border)] shadow-sm hover:shadow-x1 hover:scale-[1.04] active:scale-[0.98] transition-all duration-200"
                >
                  Refazer Questionário
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info sobre perfis */}
        {!result && (
          <Card className="bg-[var(--secondary)] border-slate-200">
            <CardContent className="p-6">
              <h4 className="font-semibold text-[var(--foreground)] mb-3">
                💡 Sobre os Perfis de Investidor
              </h4>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="w-4 h-4 text-green-600" />
                    <strong className="text-green-600">Conservador</strong>
                  </div>
                  <p className="text-[var(--muted-foreground)]">Prioriza segurança e baixo risco</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-brand-orange" />
                    <strong className="text-brand-orange">Moderado</strong>
                  </div>
                  <p className="text-[var(--muted-foreground)]">Equilíbrio entre risco e retorno</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-4 h-4 text-brand-red" />
                    <strong className="text-brand-red">Arrojado</strong>
                  </div>
                  <p className="text-[var(--muted-foreground)]">Busca altos retornos com mais risco</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
    </div>
  );
}

