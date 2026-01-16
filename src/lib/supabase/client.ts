import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js'

// Singleton: uma única instância compartilhada do cliente Supabase
let supabaseInstance: SupabaseClient | null = null;

export function createClient() {
  // Se já existe uma instância, retorna ela
  if (supabaseInstance) {
    return supabaseInstance;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Faltam credenciais do Supabase. Verifique NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  // Cria a instância única
  supabaseInstance = createSupabaseClient(supabaseUrl, supabaseKey);
  
  return supabaseInstance;
}

