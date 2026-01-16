# 💰 Finanças Pro - Plataforma de Investimentos

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.0-61dafb?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-38bdf8?style=for-the-badge&logo=tailwind-css)
![Supabase](https://img.shields.io/badge/Supabase-2.81-3ecf8e?style=for-the-badge&logo=supabase)
![shadcn/ui](https://img.shields.io/badge/shadcn/ui-latest-000000?style=for-the-badge)

Uma plataforma moderna de investimentos construída com Next.js 16, Supabase e shadcn/ui para simulação e acompanhamento de investimentos.

[Demo](#) | [Documentação](./docs) | [Contribuir](#-contribuindo)

</div>

---

## 🚀 Funcionalidades

### Core Features
- ✅ **Autenticação Segura** - Sistema completo com Supabase Auth
- ✅ **Dashboard Interativo** - Visão consolidada do portfólio com gráficos e métricas
- ✅ **Explorar Investimentos** - Ações (B3), FIIs, Criptomoedas e Renda Fixa
- ✅ **Dividendos Integrados** - Projeções e histórico de proventos no dashboard
- ✅ **Notícias do Mercado** - Feed RSS atualizado com notícias financeiras
- ✅ **Perfil de Investidor** - Questionário para determinar perfil de risco
- ✅ **Sistema de Planos** - Monetização com Stripe (Free e PRO)
- ✅ **Agendamento** - Contato com gestora (exclusivo PRO)

### UX/UI Moderna
- 🎨 **Design System Consistente** - Baseado em shadcn/ui e Tailwind CSS
- 🔔 **Notificações Toast** - Feedback instantâneo para ações do usuário
- ⚡ **Skeleton Loaders** - Indicadores de carregamento informativos
- 📱 **Totalmente Responsivo** - Otimizado para mobile, tablet e desktop
- ♿ **Acessível** - Componentes com suporte a keyboard navigation e screen readers
- 🌙 **Interface Moderna** - Gradientes, animações e micro-interações

---

## 🛠️ Stack Tecnológica

### Frontend
- **Framework:** Next.js 16 (App Router) + React 19
- **Linguagem:** TypeScript 5.7
- **Estilização:** Tailwind CSS 4.1
- **Componentes:** shadcn/ui (Radix UI)
- **Ícones:** Lucide React
- **Gráficos:** Recharts
- **Animações:** tailwindcss-animate

### Backend & Infraestrutura
- **Autenticação:** Supabase Auth
- **Banco de Dados:** Supabase (PostgreSQL)
- **Pagamentos:** Stripe
- **APIs Externas:** 
  - brapi.dev (Ações B3 e FIIs)
  - Binance API (Criptomoedas)
  - Tesouro Direto (Renda Fixa)
  - RSS Parser (Notícias)

### Componentes shadcn/ui Implementados
- **Básicos:** Alert, Avatar, Badge, Button, Card, Input, Label
- **Navegação:** Sheet (sidebar mobile), Tabs, Pagination
- **Feedback:** Dialog, Loading, Toast (customizado), Skeleton
- **Formulários:** Select (dropdown com pesquisa)
- **Dados:** Table
- **Layout:** Page Header (reutilizável), Separator

---

## 📦 Instalação e Setup

### Pré-requisitos
- Node.js 18+ ou 20+
- npm, yarn ou pnpm
- Conta Supabase (gratuita)
- Conta Stripe (modo teste gratuito)

### 1. Clone o Repositório
```bash
git clone https://github.com/carloossantoosdev/CondoAI.git
cd financas-pro
```

### 2. Instale as Dependências
```bash
# Com npm
npm install

# Ou com yarn
yarn install

# Ou com pnpm
pnpm install
```

### 3. Configure as Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima

# APIs Externas
BRAPI_API_KEY=sua_chave_brapi_dev

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=sua_chave_publicavel_stripe
STRIPE_SECRET_KEY=sua_chave_secreta_stripe
STRIPE_WEBHOOK_SECRET=seu_webhook_secret
```

> 💡 **Dica:** Consulte [STRIPE_CONFIG.md](./STRIPE_CONFIG.md) para instruções detalhadas do Stripe

### 4. Configure o Supabase

Execute os seguintes comandos SQL no Supabase SQL Editor:

```sql
-- Tabela de Usuários
CREATE TABLE users (
  uid TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  display_name TEXT,
  photo_url TEXT,
  subscription_status TEXT DEFAULT 'free',
  risk_profile TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Investimentos
CREATE TABLE investments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT REFERENCES users(uid),
  ticker TEXT NOT NULL,
  type TEXT NOT NULL,
  quantidade NUMERIC NOT NULL,
  preco_medio NUMERIC NOT NULL,
  data_compra TIMESTAMP NOT NULL,
  valor_total NUMERIC NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Agendamentos
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT REFERENCES users(uid),
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_phone TEXT,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 5. Execute o Projeto

```bash
# Modo desenvolvimento
npm run dev

# Build de produção
npm run build

# Executar produção
npm start
```

Acesse: [http://localhost:3000](http://localhost:3000)

```

## 👤 Sistema de Perfil de Investidor

O sistema analisa o perfil de risco do usuário através de um questionário de 10 perguntas.

### Perfis disponíveis:
1. **Conservador** - Renda Fixa
2. **Moderado** - Renda Fixa, Ações e FIIs
3. **Arrojado** - Todos os ativos (incluindo Cripto)

### Como funciona:
1. Usuário responde questionário em `/perfil`
2. Sistema calcula pontuação total
3. Perfil é salvo no Supabase
4. Recomendações personalizadas em `/investimentos`
5. Filtros automáticos baseados no perfil

---

## 📰 Sistema de Notícias

Integração com múltiplos feeds RSS do mercado financeiro brasileiro.

### Fontes:
- InfoMoney
- Valor Econômico
- CNN Brasil
- E-Investidor

### Características:
- 📅 Filtro automático por data (notícias do dia)
- 🔄 Paginação inteligente
- 🔗 Links externos para ler notícia completa
- ⏰ Horário de publicação
- 🏷️ Badge da fonte

---

## 🔐 Segurança

- ✅ Autenticação via Supabase Auth (JWT)
- ✅ Rotas protegidas com middleware
- ✅ Validação de assinatura em tempo real
- ✅ Webhooks seguros do Stripe (assinatura de evento)
- ✅ Cliente Supabase singleton (evita múltiplas instâncias)
- ✅ Variáveis de ambiente para credenciais sensíveis

---

## 📊 APIs Integradas

### brapi.dev
- Cotações em tempo real de ações (B3)
- Dados de FIIs (Fundos Imobiliários)
- Histórico de dividendos
- Informações fundamentalistas

### Binance API
- Cotações de criptomoedas
- Dados em tempo real
- Pares BRL e USDT

### Tesouro Direto
- Títulos públicos disponíveis
- Rentabilidade e vencimentos
- Preços atualizados

---

## 🛠️ Troubleshooting

### Erro: "Supabase credentials missing"
Verifique se as variáveis `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` estão no `.env.local`

### Erro: Stripe webhook não funciona localmente
Use o Stripe CLI para encaminhar webhooks:
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

### Build falha com erro de TypeScript
```bash
# Limpe cache e reinstale
rm -rf .next node_modules
npm install
npm run build
```

---

## 📄 Licença

Este projeto é open-source e está disponível sob a licença MIT.

---

## 👨‍💻 Autores

<!-- **Carlos** - Desenvolvedor Front-end -->

---

## 🔗 Links Úteis

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [brapi.dev Documentation](https://brapi.dev/docs)

---

<div align="center">

**Desenvolvido com ❤️ usando Next.js 16 + Supabase + shadcn/ui**

⭐ Se este projeto foi útil, considere dar uma estrela!

</div>