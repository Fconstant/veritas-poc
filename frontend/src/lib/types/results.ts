// Tipos específicos do frontend para resultados convertidos
// Mapeia o FactCheckResult do backend para um formato simplificado usado na UI

export type VerificationOutcome = 'verified' | 'unverified' | 'pending';

export interface ResultData {
  id: string;
  text: string;
  confidence: number;
  status: VerificationOutcome;
  sources?: string[];
  explanation?: string;
}
