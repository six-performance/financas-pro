# 📊 Dashboard Components

Esta pasta contém os componentes modulares do dashboard, separados para melhor organização e reutilização.

## Estrutura de Arquivos

```
dashboard/
├── PortfolioSummary.tsx    # Resumo do portfólio e gráficos
├── DividendsSection.tsx     # Seção de dividendos completa
└── README.md                # Este arquivo
```

## Componentes

### 📈 PortfolioSummary

**Arquivo:** `PortfolioSummary.tsx`

Exibe o resumo completo do portfólio do usuário.

**Props:**
- `summary: PortfolioSummaryType` - Objeto com os totais e estatísticas
- `investments: Investment[]` - Array de investimentos do usuário

**Funcionalidades:**
- 4 Cards coloridos com métricas principais:
  - Valor Total
  - Total Investido
  - Lucro/Prejuízo
  - Número de Investimentos
- Gráfico de pizza com distribuição do portfólio
- Lista de investimentos recentes
- Mensagem de carteira vazia

---

### 💰 DividendsSection

**Arquivo:** `DividendsSection.tsx`

Exibe todo o histórico e análise de dividendos.

**Props:**
- `assets: AssetWithDividends[]` - Ativos com dados de dividendos
- `loading: boolean` - Estado de carregamento
- `error: string | null` - Mensagem de erro (se houver)

**Funcionalidades:**
- 3 Cards de resumo:
  - Total Recebido (últimos 12 meses)
  - Número de Pagamentos
  - Yield Médio
- Card informativo com ativos que pagam dividendos
- Tabela completa de histórico de proventos
- Distinção visual entre dividendos recebidos e não recebidos
- Cálculos automáticos baseados na data de compra

---

## Utils Relacionados

### 🛠️ formatters.ts

**Arquivo:** `src/utils/formatters.ts`

Funções utilitárias para formatação de dados.

**Funções:**
- `formatCurrency(value: number): string` - Formata valor em BRL
- `formatDate(date: Date | string): string` - Formata data em pt-BR
- `formatDateTime(date: Date | string): string` - Formata data e hora

---

## Tipos

### 📝 dividends.ts

**Arquivo:** `src/types/dividends.ts`

Tipos TypeScript específicos para dividendos.

**Interfaces:**
- `DividendData` - Dados brutos de um dividendo
- `AssetWithDividends` - Ativo com histórico de dividendos
- `DividendHistoryItem` - Item do histórico formatado

---

## Como Usar

### No Dashboard Principal

A lógica de carregamento de dados está diretamente na página do dashboard (`src/app/dashboard/page.tsx`).

Os componentes são utilizados assim:

```typescript
<PortfolioSummaryComponent 
  summary={summary} 
  investments={investments} 
/>

<DividendsSection
  assets={assets}
  loading={loadingDividends}
  error={errorDividends}
/>
```

---

## Benefícios da Refatoração

✅ **Modularidade**: Cada componente tem responsabilidade única  
✅ **Reutilização**: Componentes podem ser usados em outras páginas  
✅ **Manutenção**: Mais fácil encontrar e corrigir bugs  
✅ **Testabilidade**: Componentes menores são mais fáceis de testar  
✅ **Legibilidade**: Código mais limpo e organizado  
✅ **Performance**: Imports mais específicos e tree-shaking melhor  

---

## Métricas

**Antes da Refatoração:**
- Dashboard: 765 linhas (1 arquivo monolítico)

**Depois da Refatoração:**
- Dashboard: ~240 linhas (com lógica inline)
- PortfolioSummary: ~200 linhas
- DividendsSection: ~240 linhas
- formatters: ~30 linhas
- dividends types: ~25 linhas
- Total: ~735 linhas (em 5 arquivos organizados)

---

## Próximos Passos

Sugestões para melhorias futuras:

1. **Testes Unitários**: Adicionar testes para cada componente
2. **Storybook**: Documentar componentes visualmente
3. **Error Boundaries**: Adicionar tratamento de erros robusto
4. **Loading States**: Skeletons mais elaborados
5. **Animações**: Transições suaves entre estados
6. **Caching**: Implementar cache de dados com React Query

---

## Suporte

Para dúvidas ou problemas, consulte a documentação principal do projeto.

