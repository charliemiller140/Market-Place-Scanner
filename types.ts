
export enum UserTier {
  GUEST = 'guest',
  FREE = 'free',
  PAID = 'paid',
}

export interface User {
  id: string | null;
  email?: string;
  tier: UserTier;
  scansToday: number;
  totalGuestScans: number;
  aiCredits: number;
}

export interface AnalysisCriteria {
  criteria: string;
  score: number;
  explanation: string;
}

export interface AnalysisResult {
  overallScore: number;
  summary: string;
  report: AnalysisCriteria[];
  isMock?: boolean;
}
