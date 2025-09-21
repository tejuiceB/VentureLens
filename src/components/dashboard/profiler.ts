
import type { InvestorRiskAssessmentOutput } from "@/ai/flows/investor-risk-assessment";

export interface InvestorProfile {
  fullName: string;
  riskAppetite: string; // Now Risk Tolerance
  desiredReturns: string; // Now Investment Philosophy
  investmentPreferences: string;
  investmentAmount: string;
  investmentHorizon: string;
  country: string; // Now Geographical Preferences
  involvement: string;
  ethicalConsiderations: string;
  preferredCurrency: string;
  investmentFocus: string;
  investmentStage: string;
  investmentCriteria: string;
  generatedProfile: InvestorRiskAssessmentOutput | null;
}

    