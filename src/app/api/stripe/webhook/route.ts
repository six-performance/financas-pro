import { NextRequest, NextResponse } from 'next/server';
import { stripe, STRIPE_WEBHOOK_SECRET } from '@/services/stripe/config';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

// Função para criar cliente Supabase admin (evita erro de build)
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Assinatura ausente' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error('Erro ao verificar webhook:', error);
    return NextResponse.json(
      { error: 'Webhook inválido' },
      { status: 400 }
    );
  }

  try {
    const supabaseAdmin = getSupabaseAdmin();
    
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.supabaseUID;
        
        if (userId && session.subscription) {
          const { error } = await supabaseAdmin
            .from('users')
            .update({
              subscription_status: 'paid',
              subscription_id: session.subscription as string,
              customer_id: session.customer as string,
              updated_at: new Date().toISOString(),
            })
            .eq('id', userId);

          if (error) {
            console.error('Erro ao atualizar usuário:', error);
          } else {
            console.log('Usuário atualizado para PRO:', userId);
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customer = await stripe.customers.retrieve(
          subscription.customer as string
        );
        
        if ('metadata' in customer && customer.metadata?.supabaseUID) {
          const userId = customer.metadata.supabaseUID;
          const status = subscription.status === 'active' ? 'paid' : 'free';
          
          const { error } = await supabaseAdmin
            .from('users')
            .update({
              subscription_status: status,
              updated_at: new Date().toISOString(),
            })
            .eq('id', userId);

          if (error) {
            console.error('Erro ao atualizar assinatura:', error);
          } else {
            console.log('Assinatura atualizada:', userId, status);
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customer = await stripe.customers.retrieve(
          subscription.customer as string
        );
        
        if ('metadata' in customer && customer.metadata?.supabaseUID) {
          const userId = customer.metadata.supabaseUID;
          
          const { error } = await supabaseAdmin
            .from('users')
            .update({
              subscription_status: 'free',
              subscription_id: null,
              updated_at: new Date().toISOString(),
            })
            .eq('id', userId);

          if (error) {
            console.error('Erro ao cancelar assinatura:', error);
          } else {
            console.log('Assinatura cancelada:', userId);
          }
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    return NextResponse.json(
      { error: 'Erro ao processar webhook' },
      { status: 500 }
    );
  }
}

