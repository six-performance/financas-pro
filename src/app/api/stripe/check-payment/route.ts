import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/services/stripe/config';
import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function POST(req: NextRequest) {
  try {
    const { sessionId, userId } = await req.json();

    if (!sessionId || !userId) {
      return NextResponse.json(
        { error: 'Dados incompletos' },
        { status: 400 }
      );
    }

    // Buscar a sessão no Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Verificar se o pagamento foi concluído
    if (session.payment_status === 'paid' && session.subscription) {
      
      // Buscar email da sessão do Stripe
      const customerEmail = session.customer_details?.email || session.customer_email;

      if (!customerEmail) {
        return NextResponse.json(
          { error: 'Email não encontrado' },
          { status: 400 }
        );
      }
      
      // Usar UPSERT para criar/atualizar automaticamente
      const supabaseAdmin = getSupabaseAdmin();
      const { data, error } = await supabaseAdmin
        .from('users')
        .upsert({
          id: userId,
          email: customerEmail,
          display_name: customerEmail.split('@')[0],
          subscription_status: 'paid',
          subscription_id: session.subscription as string,
          customer_id: session.customer as string,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'id',
          ignoreDuplicates: false
        })
        .select();


      if (error) {
        return NextResponse.json(
          { error: 'Erro ao atualizar status', details: error },
          { status: 500 }
        );
      }

      if (!data || data.length === 0) {
        return NextResponse.json(
          { error: 'UPSERT não afetou nenhuma linha. Verifique RLS policies.', userId },
          { status: 500 }
        );
      }

      return NextResponse.json({ 
        success: true, 
        subscription_status: 'paid',
        message: 'Status atualizado com sucesso!',
        data 
      });
    }

    return NextResponse.json({ 
      success: false, 
      message: 'Pagamento ainda não foi confirmado',
      payment_status: session.payment_status 
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao verificar pagamento', details: error },
      { status: 500 }
    );
  }
}

