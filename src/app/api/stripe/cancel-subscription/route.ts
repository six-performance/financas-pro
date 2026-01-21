import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Função para criar cliente Supabase admin (evita erro de build)
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'userId é obrigatório' },
        { status: 400 }
      );
    }

    // Atualizar o status do usuário para 'free'
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from('users')
      .update({
        subscription_status: 'free',
        subscription_id: null,
        customer_id: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select();


    if (error) {
      return NextResponse.json(
        { error: 'Erro ao fazer downgrade', details: error },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Usuário não encontrado', userId },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Downgrade realizado com sucesso!',
      data: data[0]
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao fazer downgrade' },
      { status: 500 }
    );
  }
}

