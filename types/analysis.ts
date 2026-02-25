export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface RiskItem {
  title: string;
  description: string;
  level: RiskLevel;
  clause?: string;
  recommendation?: string;
}

export interface KeyClause {
  title: string;
  content: string;
  type: "favorable" | "unfavorable" | "neutral";
  importance: "low" | "medium" | "high";
  pageHint?: string;
}

export interface PartyInfo {
  name: string;
  role: string;
  obligations: string[];
  rights: string[];
}

export interface ContractAnalysis {
  contractType: string;
  contractTitle: string;
  overallRisk: RiskLevel;
  riskScore: number; // 0-100
  summary: string;
  effectiveDate?: string;
  expirationDate?: string;
  jurisdiction?: string;
  governingLaw?: string;
  parties: PartyInfo[];
  keyClauses: KeyClause[];
  risks: RiskItem[];
  recommendations: string[];
  redFlags: string[];
  strengths: string[];
  missingClauses: string[];
  unusualProvisions: string[];
  financialTerms?: {
    amount?: string;
    currency?: string;
    paymentTerms?: string;
    penalties?: string;
  };
  terminationClauses: string[];
  confidentialityClauses: string[];
  disputeResolution?: string;
  completenessScore: number; // 0-100
  fairnessScore: number; // 0-100
  analysisTimestamp: string;
}

export interface AnalysisState {
  status: "idle" | "uploading" | "extracting" | "analyzing" | "complete" | "error";
  progress: number;
  message: string;
  result?: ContractAnalysis;
  error?: string;
  filename?: string;
  fileSize?: number;
}
