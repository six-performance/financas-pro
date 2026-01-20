import { RiskProfile, RiskProfileValue, InvestmentType } from '@/types';

/**
 * Mapeamento de perfis de risco para tipos de investimento compatíveis
 */
export const PERFIL_INVESTIMENTOS: Record<RiskProfileValue, InvestmentType[]> = {
  conservador: ['rendaFixa'],
  moderado: ['rendaFixa', 'fundo', 'acao'],
  arrojado: ['rendaFixa', 'fundo', 'acao', 'cripto'],
};

/**
 * Informações sobre cada perfil de risco
 */
export const profileInfo: Record<RiskProfileValue, { title: string; color: string; description: string; emoji: string }> = {
  conservador: {
    title: 'Conservador',
    color: 'blue',
    description: 'Você prioriza segurança e prefere investimentos de baixo risco como renda fixa.',
    emoji: '🛡️',
  },
  moderado: {
    title: 'Moderado',
    color: 'orange',
    description: 'Você busca equilíbrio entre segurança e rentabilidade, aceitando riscos moderados.',
    emoji: '📈',
  },
  arrojado: {
    title: 'Arrojado',
    color: 'red',
    description: 'Você busca máxima rentabilidade e aceita riscos elevados em busca de maiores retornos.',
    emoji: '⚡',
  },
};

/**
 * Retorna o perfil efetivo do usuário (usa 'conservador' como padrão se null)
 */
export function getEffectiveProfile(userProfile: RiskProfile): RiskProfileValue {
  return userProfile || 'conservador';
}

/**
 * Verifica se um tipo de investimento é compatível com o perfil de risco do usuário
 */
export function isInvestmentCompatible(
  investmentType: InvestmentType,
  userProfile: RiskProfile
): boolean {
  const effectiveProfile = getEffectiveProfile(userProfile);
  const allowedTypes = PERFIL_INVESTIMENTOS[effectiveProfile];
  return allowedTypes.includes(investmentType);
}


/**
 * Retorna o nome legível do tipo de investimento
 */
export function getInvestmentTypeName(type: InvestmentType): string {
  const names: Record<InvestmentType, string> = {
    acao: 'Ação',
    fundo: 'Fundo',
    rendaFixa: 'Renda Fixa',
    cripto: 'Criptomoeda',
  };
  return names[type];
}

/**
 * Retorna o emoji correspondente ao tipo de investimento
 */
export function getInvestmentTypeEmoji(type: InvestmentType): string {
  const emojis: Record<InvestmentType, string> = {
    acao: '📊',
    fundo: '📈',
    rendaFixa: '🏦',
    cripto: '₿',
  };
  return emojis[type];
}

/**
 * Retorna tipos de investimento disponíveis baseado no perfil
 */
export function getAvailableInvestmentTypes(
  userProfile: RiskProfile
): InvestmentType[] {
  const effectiveProfile = getEffectiveProfile(userProfile);
  return PERFIL_INVESTIMENTOS[effectiveProfile];
}
