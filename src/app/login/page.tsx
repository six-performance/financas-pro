'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react';
import { Loading } from '@/components/ui/loading';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const { user, signIn, signUp, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // Validação básica
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
      // Se chegou aqui, foi bem-sucedido
      // O redirecionamento será feito pelo useEffect
    } catch (error: any) {
      console.error('Erro:', error);
      
      // Mensagens de erro mais amigáveis
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loading size="lg" />
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-orange-50 p-4">
      <Card className="w-full max-w-md shadow-2xl border-[#ff6b2d]/10">
        <CardHeader className="space-y-3 text-center pb-6">
          <div className="flex justify-center mb-2">
           <Image src="/logo-financas-pro.png" alt="logo" width={50} height={50} />
          </div>
          <CardTitle className="text-3xl font-bold !bg-gradient-to-r !from-[#ff6b2d] !to-[#b91c1c] bg-clip-text text-transparent">
            Finanças Pro
          </CardTitle>
          <CardDescription className="text-base">
            {isSignUp ? 'Crie sua conta grátis' : 'Entre com suas credenciais'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pb-8">
          {error && (
            <Alert variant="destructive" className="text-red-500 bg-red-50">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">  
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Nome (opcional)
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isSubmitting}
                  autoComplete="name"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  disabled={isSubmitting}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Senha
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  disabled={isSubmitting}
                  autoComplete="current-password"
                />
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full gap-2 !bg-gradient-to-r !from-[#ff6b2d] !to-[#b91c1c] hover:opacity-90 text-white font-semibold shadow-lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loading size="sm" />
                  {isSignUp ? 'Criando conta...' : 'Entrando...'}
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  {isSignUp ? 'Criar Conta' : 'Entrar'}
                </>
              )}
            </Button>
          </form>

          <div className="text-center space-y-3">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
              }}
              className="text-sm text-slate-600 hover:text-[#ff6b2d] font-medium transition-colors"
              disabled={isSubmitting}
            >
              {isSignUp ? 'Já tem conta? Fazer login' : 'Não tem conta? Criar agora'}
            </button>
            
            <p className="text-xs text-slate-500">
              🔒 Seus dados estão seguros e protegidos
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
