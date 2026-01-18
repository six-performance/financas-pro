export type SubscriptionStatus = 'free' | 'paid';
export type RiskProfileValue = 'conservador' | 'moderado' | 'arrojado';
export type RiskProfile = RiskProfileValue | null;
export type InvestmentType = 'acao' | 'fundo' | 'rendaFixa' | 'cripto';
export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled';

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  subscriptionStatus: SubscriptionStatus;
  subscriptionId: string | null;
  customerId: string | null;
  riskProfile: RiskProfile;
  createdAt: any;
  updatedAt: any;
}

export interface Investment {
  id: string;
  userId: string;
  type: InvestmentType;
  ticker: string;
  nome: string;
  quantidade: number;
  precoMedio: number;
  dataCompra: any;
  valorTotal: number;
}

export interface Appointment {
  id: string;
  userId: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  message: string;
  userEmail: string;
  userName: string;
  userPhone?: string;
  createdAt: any;
}

export interface Asset {
  ticker: string;
  nome: string;
  preco: number;
  variacao?: number;
  tipo: InvestmentType;
  logo?: string;
}

export interface PortfolioSummary {
  valorTotal: number;
  totalInvestido: number;
  lucroOuPrejuizo: number;
  percentualRetorno: number;
  numeroInvestimentos: number;
}

