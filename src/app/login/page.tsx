'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';
import { LogIn, Mail, Lock, AlertCircle, TrendingUp, Shield, Zap, Eye, EyeOff, KeyRound, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Loading } from '@/components/ui/loading';

export default function LoginPage() {
  const { user, signIn, signUp, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      if (!email || !password) {
        setError('Por favor, preencha todos os campos');
        setIsSubmitting(false);
        return;
      }

      if (!email.includes('@')) {
        setError('Por favor, insira um email válido');
        setIsSubmitting(false);
        return;
      }

      if (password.length < 6) {
        setError('A senha deve ter pelo menos 6 caracteres');
        setIsSubmitting(false);
        return;
      }

      if (isSignUp) {
        await signUp(email, password, name);
      } else {
        await signIn(email, password);
      }
    } catch (error: any) {
      console.error('Erro:', error);
      
      if (error?.message?.includes('Invalid login credentials')) {
        setError('Email ou senha incorretos');
      } else if (error?.message?.includes('Email not confirmed')) {
        setError('Por favor, confirme seu email antes de fazer login');
      } else if (error?.message?.includes('User already registered')) {
        setError('Este email já está cadastrado. Faça login.');
      } else {
        setError(isSignUp ? 'Erro ao criar conta. Tente novamente.' : 'Erro ao fazer login. Tente novamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div data-theme="dark" className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <Loading size="lg" />
      </div>
    );
  }

  if (user) {
    return (
      <div data-theme="dark" className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <div data-theme="dark" className="min-h-screen bg-[#0a0a0a]">
      <div className="grid min-h-screen lg:grid-cols-2">
        <div className="relative hidden lg:flex items-center justify-center bg-[#121212] p-12 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            {/* <div className="absolute top-0 right-0 h-[500px] w-[500px] rounded-full bg-[#ff6b2d]/10 blur-[120px]" /> */}
            {/* <div className="absolute bottom-0 left-0 h-[500px] w-[500px] rounded-full bg-[#ff6b2d]/10 blur-[120px]" /> */}
          </div>

          <div className="relative z-10 max-w-xl space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm backdrop-blur-sm">
              <Zap className="h-4 w-4 text-[#ff6b2d]" />
              <span className="text-gray-300">Mais foco, menos planilhas</span>
            </div>

            <div className="space-y-4">
              <h2 className="text-5xl font-bold leading-tight text-white">
                Investir é para agora.{' '}
                <span className="bg-linear-to-r from-[#ff6b2d] to-[#b91c1c] bg-clip-text text-transparent">
                  Crescer é para sempre.
                </span>
                
              </h2>
              <p className="text-lg text-gray-400 leading-relaxed">
                Uma experiência de finanças pessoais feita para quem quer clareza, consistência e decisões melhores.
              </p>
            </div>

            <div className="space-y-4">
              <div className="group flex items-start gap-4 rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition-all hover:bg-white/10">
                <div className="rounded-lg bg-linear-to-br from-[#ff6b2d] to-[#b91c1c] p-2.5">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-1">Evolução em primeiro lugar</h3>
                  <p className="text-sm text-gray-400">
                    Monitore sua carteira com um painel visual que simplifica dados e destaca seus resultados.
                  </p>
                </div>
              </div>

              <div className="group flex items-start gap-4 rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition-all hover:bg-white/10">
                <div className="rounded-lg bg-linear-to-br from-[#ff6b2d] to-[#b91c1c] p-2.5">
                  <LogIn className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-1">Interface inteligente</h3>
                  <p className="text-sm text-gray-400">
                    Interface simples, elegante e inteligente para você tomar decisões com mais confiança.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-8 border-t border-white/10">
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-10 rounded-lg bg-linear-to-br from-[#ff6b2d] to-[#b91c1c] p-0.5">
                  <div className="h-full w-full rounded-lg bg-[#0a0a0a] flex items-center justify-center">
                    <Image
                      src="/logo-financas-pro.svg"
                      alt="Finanças Pro"
                      width={24}
                      height={24}
                      className="object-contain"
                    />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Finanças Pro</p>
                </div>
              </div>
              <p className="text-xs text-gray-600">© {new Date().getFullYear()}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center p-6 sm:p-8 lg:p-12">
          <div className="w-full max-w-md space-y-8">
            <div className="space-y-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="relative h-12 w-12 rounded-lg bg-linear-to-br from-[#ff6b2d] to-[#b91c1c] p-0.5">
                  <div className="h-full w-full rounded-lg bg-[#0a0a0a] flex items-center justify-center">
                    <Image
                      src="/logo-financas-pro.svg"
                      alt="Finanças Pro"
                      width={28}
                      height={28}
                      className="object-contain"
                      priority
                    />
                  </div>
                </div>
                <span className="text-2xl font-bold text-white">Finanças Pro</span>
              </div>
              <h1 className="text-3xl font-bold text-white">
                {isSignUp ? 'Criar conta' : 'Bem-vindo'}
              </h1>
              <p className="text-sm text-gray-400">
                {isSignUp 
                  ? 'Preencha os dados abaixo para começar' 
                  : 'Acesse sua conta e acompanhe tudo em tempo real'}
              </p>
            </div>

            {error && (
              <Alert variant="destructive" className="border-red-500/20 bg-red-500/10 text-red-200">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">{error}</span>
                </div>
              </Alert>
            )}

            {success && (
              <Alert variant="success" className="border-green-500/20 bg-green-500/10 text-green-200">
                <div className="flex items-center gap-2">
                  <KeyRound className="h-4 w-4" />
                  <span className="text-sm">{success}</span>
                </div>
              </Alert>
            )}

            {/* Formulário */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-gray-200">
                    Nome
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Seu nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isSubmitting}
                    autoComplete="name"
                    className="h-11 border-gray-700 bg-gray-900/50 text-white placeholder:text-gray-500 focus:border-[#ff6b2d] focus:ring-[#ff6b2d]"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-200">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 border-gray-700 bg-gray-900/50 pl-11 text-white placeholder:text-gray-500 focus:border-[#ff6b2d] focus:ring-[#ff6b2d]"
                    disabled={isSubmitting}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-200">
                  Senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 border-gray-700 bg-gray-900/50 pl-11 pr-11 text-white placeholder:text-gray-500 focus:border-[#ff6b2d] focus:ring-[#ff6b2d]"
                    disabled={isSubmitting}
                    autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    disabled={isSubmitting}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full h-12 gap-2 bg-linear-to-r from-[#ff6b2d] to-[#b91c1c] text-white font-semibold shadow-lg shadow-[#ff6b2d]/25 hover:shadow-[#ff6b2d]/40 hover:opacity-95 transition-all"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loading size="sm" />
                    {isSignUp ? 'Criando conta...' : 'Entrando...'}
                  </>
                ) : (
                  <>
                    {isSignUp ? 'Criar Conta' : 'Entrar'}
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </Button>
            </form>

            {/* Toggle SignUp/Login */}
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-800"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-[#0a0a0a] px-2 text-gray-500">ou</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                  setSuccess('');
                  setPassword('');
                }}
                className="w-full rounded-lg border border-gray-800 bg-transparent py-3 text-sm font-medium text-gray-300 hover:bg-gray-900/30 transition-colors"
                disabled={isSubmitting}
              >
                {isSignUp ? 'Já tenho conta — Fazer login' : 'Ainda não tenho conta — Criar agora'}
              </button>

              <p className="text-center text-xs text-gray-500">
                Ao continuar, você concorda com nossa política de privacidade e termos.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}