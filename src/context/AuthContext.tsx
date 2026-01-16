'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  subscriptionStatus: string;
  riskProfile?: string;
}

interface AuthContextType {
  user: User | null;
  supabaseUser: SupabaseUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Criar instância única do cliente Supabase fora do componente
const supabaseClient = createClient();

export function AuthProvider({ children }: { children: ReactNode }) {
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Garantir que o usuário existe na tabela users
  const ensureUserExists = async (supabaseUser: SupabaseUser): Promise<void> => {
    try {
      // Primeiro, verificar se o usuário já existe
      const { data: existingUser } = await supabaseClient
        .from('users')
        .select('id, subscription_status')
        .eq('id', supabaseUser.id)
        .maybeSingle();

      // Se já existe, não fazer nada (preservar subscription_status)
      if (existingUser) {
        return;
      }

      // Se não existe, criar com status 'free'
      const displayName = supabaseUser.user_metadata?.full_name || 
                         supabaseUser.user_metadata?.name || 
                         supabaseUser.email?.split('@')[0] || 
                         'Usuário';

      await supabaseClient
        .from('users')
        .insert({
          id: supabaseUser.id,
          email: supabaseUser.email,
          display_name: displayName,
          photo_url: supabaseUser.user_metadata?.avatar_url || null,
          subscription_status: 'free',
        });
    } catch (error) {
      console.error('Erro ao criar/atualizar usuário:', error);
    }
  };

  // Buscar dados do usuário da tabela public.users
  const fetchUserData = async (supabaseUser: SupabaseUser): Promise<User> => {
    try {
      // Primeiro garante que o usuário existe
      await ensureUserExists(supabaseUser);

      // Depois busca os dados
      const { data, error } = await supabaseClient
        .from('users')
        .select('*')
        .eq('id', supabaseUser.id)
        .maybeSingle();

      if (error || !data) {
        return convertSupabaseUserToUser(supabaseUser);
      }

      return {
        uid: supabaseUser.id,
        email: data.email || supabaseUser.email || '',
        displayName: data.display_name || supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0] || 'Usuário',
        photoURL: data.photo_url || supabaseUser.user_metadata?.avatar_url || null,
        subscriptionStatus: data.subscription_status || 'free',
        riskProfile: data.risk_profile || undefined,
      };
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
      return convertSupabaseUserToUser(supabaseUser);
    }
  };

  const convertSupabaseUserToUser = (supabaseUser: SupabaseUser): User => {
    return {
      uid: supabaseUser.id,
      email: supabaseUser.email || '',
      displayName: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'Usuário',
      photoURL: supabaseUser.user_metadata?.avatar_url || null,
      subscriptionStatus: 'free',
    };
  };

  useEffect(() => {
    let mounted = true;

    // Verificar sessão atual
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        
        if (mounted && session?.user) {
          setSupabaseUser(session.user);
          const userData = await fetchUserData(session.user);
          setUser(userData);
        }
      } catch (error) {
        console.error('Erro ao verificar sessão:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    checkSession();

    // Escutar mudanças de autenticação
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (session?.user) {
        setSupabaseUser(session.user);
        const userData = await fetchUserData(session.user);
        setUser(userData);
      } else {
        setSupabaseUser(null);
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        setSupabaseUser(data.user);
        const userData = await fetchUserData(data.user);
        setUser(userData);
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name?: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name || email.split('@')[0],
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        setSupabaseUser(data.user);
        const userData = await fetchUserData(data.user);
        setUser(userData);
      }
    } catch (error) {
      console.error('Erro ao criar conta:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabaseClient.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setSupabaseUser(null);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      throw error;
    }
  };

  const refreshUser = async () => {
    if (!supabaseUser) {
      return;
    }
    
    try {
      const userData = await fetchUserData(supabaseUser);
      setUser(userData);
    } catch (error) {
      console.error('Erro ao atualizar dados do usuário:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, supabaseUser, loading, signIn, signUp, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
