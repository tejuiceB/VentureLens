'use server';

/**
 * @fileOverview Automated risk detection by cross-checking pitch deck claims against public data and benchmarks.
 * 
 * - detectRisks - Identifies potential red flags in startup pitch
 * - RiskDetectionInput - Input type with pitch deck data and external sources
 * - RiskDetectionOutput - Output with categorized risk flags
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RiskDetectionInputSchema = z.object({
  startupName: z.string().describe("The name of the startup."),
  sector: z.string().describe("The sector/industry."),
  
  // Pitch deck claims
  pitchDeckData: z.object({
    marketSize: z.number().optional().describe("Claimed Total Addressable Market in USD billions."),
    currentRevenue: z.number().optional().describe("Current ARR/MRR claimed in pitch deck."),
    growthRate: z.number().optional().describe("Claimed YoY growth rate percentage."),
    customerCount: z.number().optional().describe("Number of customers claimed."),
    churnRate: z.number().optional().describe("Claimed customer churn rate percentage."),
    competitorMentions: z.array(z.string()).optional().describe("Competitors mentioned in pitch deck."),
    teamExperience: z.string().optional().describe("Claims about team experience and track record."),
    fundingHistory: z.array(z.string()).optional().describe("Claimed previous funding rounds."),
    keyMetrics: z.object({
      cac: z.number().optional(),
      ltv: z.number().optional(),
      burnRate: z.number().optional(),
      runway: z.number().optional(),
    }).optional(),
  }).describe("Data extracted from pitch deck."),
  
  // External validation data
  publicData: z.object({
    newsArticles: z.array(z.object({
      title: z.string(),
      sentiment: z.enum(['positive', 'neutral', 'negative']),
      snippet: z.string(),
    })).optional(),
    fundingHistory: z.array(z.string()).optional(),
    competitorMentions: z.array(z.string()).optional(),
    riskIndicators: z.array(z.string()).optional(),
  }).optional().describe("Data from public-data-enrichment.ts flow."),
  
  benchmarkData: z.object({
    avgMarketSize: z.number().optional(),
    avgRevenue: z.number().optional(),
    avgGrowthRate: z.number().optional(),
    avgChurnRate: z.number().optional(),
    avgCAC: z.number().optional(),
    avgLTV: z.number().optional(),
  }).optional().describe("Sector averages from benchmarking flow."),
});
export type RiskDetectionInput = z.infer<typeof RiskDetectionInputSchema>;

const RiskFlagSchema = z.object({
  category: z.enum([
    'Financial Inconsistency',
    'Market Size Validation',
    'Churn & Unit Economics',
    'Competitive Landscape',
    'Team & Leadership',
    'Funding & Burn Rate',
    'Public Sentiment',
    'Operational Risk'
  ]).describe("Risk category."),
  severity: z.enum(['red', 'yellow', 'green']).describe("Red = critical, Yellow = concerning, Green = low risk."),
  flag: z.string().describe("Brief description of the risk flag."),
  evidence: z.string().describe("Specific evidence supporting this flag."),
  recommendation: z.string().describe("Actionable recommendation for investors."),
});
export type RiskFlag = z.infer<typeof RiskFlagSchema>;

const RiskDetectionOutputSchema = z.object({
  overallRiskScore: z.number().min(0).max(100).describe("Overall risk score (0 = highest risk, 100 = lowest risk)."),
  riskLevel: z.enum(['Critical', 'High', 'Medium', 'Low', 'Minimal']).describe("Overall risk classification."),
  redFlags: z.array(RiskFlagSchema).describe("Critical risks that could be deal-breakers."),
  yellowFlags: z.array(RiskFlagSchema).describe("Concerning areas requiring due diligence."),
  greenFlags: z.array(RiskFlagSchema).describe("Positive indicators reducing investment risk."),
  summary: z.string().describe("Executive summary of risk analysis."),
  recommendation: z.enum(['Pass', 'Caution - Deep Dive Required', 'Proceed with Due Diligence', 'Strong Candidate']).describe("Investment recommendation based on risk analysis."),
});
export type RiskDetectionOutput = z.infer<typeof RiskDetectionOutputSchema>;

/**
 * Validate market size claims against industry standards
 */
function validateMarketSize(claimed: number | undefined, benchmark: number | undefined): {
  isValid: boolean;
  severity: 'red' | 'yellow' | 'green';
  explanation: string;
} {
  if (!claimed) {
    return {
      isValid: true,
      severity: 'yellow',
      explanation: 'No market size data provided in pitch deck.'
    };
  }

  if (!benchmark) {
    return {
      isValid: true,
      severity: 'green',
      explanation: 'Market size appears reasonable (no benchmark available).'
    };
  }

  const ratio = claimed / benchmark;

  if (ratio > 3) {
    return {
      isValid: false,
      severity: 'red',
      explanation: `Claimed market size ($${claimed}B) is ${ratio.toFixed(1)}x higher than industry estimates ($${benchmark}B). Possible inflated TAM.`
    };
  } else if (ratio > 1.5) {
    return {
      isValid: true,
      severity: 'yellow',
      explanation: `Claimed market size ($${claimed}B) is ${ratio.toFixed(1)}x higher than typical estimates ($${benchmark}B). Verify methodology.`
    };
  } else {
    return {
      isValid: true,
      severity: 'green',
      explanation: `Market size claim ($${claimed}B) aligns with industry benchmarks ($${benchmark}B).`
    };
  }
}

/**
 * Check for metric inconsistencies
 */
function detectMetricInconsistencies(
  pitchData: any,
  publicData: any,
  benchmarks: any
): Array<{ severity: 'red' | 'yellow' | 'green'; flag: string; evidence: string }> {
  const inconsistencies: Array<{ severity: 'red' | 'yellow' | 'green'; flag: string; evidence: string }> = [];

  // Check funding history consistency
  if (pitchData.fundingHistory && publicData?.fundingHistory) {
    const pitchRounds = pitchData.fundingHistory.length;
    const publicRounds = publicData.fundingHistory.length;
    
    if (Math.abs(pitchRounds - publicRounds) > 1) {
      inconsistencies.push({
        severity: 'yellow',
        flag: 'Funding History Mismatch',
        evidence: `Pitch deck claims ${pitchRounds} rounds, but public records show ${publicRounds} rounds.`
      });
    }
  }

  // Check growth rate reasonableness
  if (pitchData.growthRate && benchmarks?.avgGrowthRate) {
    const ratio = pitchData.growthRate / benchmarks.avgGrowthRate;
    if (ratio > 3) {
      inconsistencies.push({
        severity: 'yellow',
        flag: 'Unusually High Growth Rate',
        evidence: `Claimed ${pitchData.growthRate}% growth is ${ratio.toFixed(1)}x sector average (${benchmarks.avgGrowthRate}%). Verify data sources.`
      });
    }
  }

  // Check unit economics
  if (pitchData.keyMetrics?.cac && pitchData.keyMetrics?.ltv) {
    const ltvCacRatio = pitchData.keyMetrics.ltv / pitchData.keyMetrics.cac;
    
    if (ltvCacRatio < 3) {
      inconsistencies.push({
        severity: 'red',
        flag: 'Poor Unit Economics',
        evidence: `LTV:CAC ratio is ${ltvCacRatio.toFixed(1)}x (industry best practice is >3x). Business may not be economically viable.`
      });
    } else if (ltvCacRatio > 10) {
      inconsistencies.push({
        severity: 'yellow',
        flag: 'Unusually High LTV:CAC',
        evidence: `LTV:CAC ratio of ${ltvCacRatio.toFixed(1)}x seems too good to be true. Verify calculation methodology.`
      });
    }
  }

  // Check churn patterns
  if (pitchData.churnRate !== undefined) {
    if (pitchData.churnRate > 10) {
      inconsistencies.push({
        severity: 'red',
        flag: 'High Customer Churn',
        evidence: `Annual churn rate of ${pitchData.churnRate}% indicates product-market fit issues. SaaS best practice is <5% annually.`
      });
    } else if (pitchData.churnRate > 5) {
      inconsistencies.push({
        severity: 'yellow',
        flag: 'Elevated Churn Rate',
        evidence: `Churn rate of ${pitchData.churnRate}% is higher than ideal (<5%). Monitor retention strategies.`
      });
    }
  }

  // Check burn rate vs runway
  if (pitchData.keyMetrics?.burnRate && pitchData.keyMetrics?.runway) {
    if (pitchData.keyMetrics.runway < 6) {
      inconsistencies.push({
        severity: 'red',
        flag: 'Critical Runway Shortage',
        evidence: `Only ${pitchData.keyMetrics.runway} months of runway remaining with $${pitchData.keyMetrics.burnRate.toLocaleString()}/month burn. Urgent funding needed.`
      });
    } else if (pitchData.keyMetrics.runway < 12) {
      inconsistencies.push({
        severity: 'yellow',
        flag: 'Limited Runway',
        evidence: `${pitchData.keyMetrics.runway} months of runway. Should raise within 6 months for buffer.`
      });
    }
  }

  return inconsistencies;
}

/**
 * Analyze competitive landscape gaps
 */
function analyzeCompetitiveLandscape(
  pitchCompetitors: string[] | undefined,
  publicCompetitors: string[] | undefined
): { severity: 'red' | 'yellow' | 'green'; flag: string; evidence: string } | null {
  if (!pitchCompetitors || pitchCompetitors.length === 0) {
    return {
      severity: 'yellow',
      flag: 'No Competitive Analysis',
      evidence: 'Pitch deck does not mention competitors. May indicate lack of market research or naivety.'
    };
  }

  if (publicCompetitors && publicCompetitors.length > 0) {
    const missedCompetitors = publicCompetitors.filter(
      pc => !pitchCompetitors.some(pitchComp => 
        pc.toLowerCase().includes(pitchComp.toLowerCase()) || 
        pitchComp.toLowerCase().includes(pc.toLowerCase())
      )
    );

    if (missedCompetitors.length >= 3) {
      return {
        severity: 'red',
        flag: 'Major Competitors Ignored',
        evidence: `Pitch deck missed ${missedCompetitors.length} major competitors: ${missedCompetitors.slice(0, 3).join(', ')}. Competitive analysis incomplete.`
      };
    } else if (missedCompetitors.length > 0) {
      return {
        severity: 'yellow',
        flag: 'Incomplete Competitive Analysis',
        evidence: `Public data shows additional competitors not mentioned: ${missedCompetitors.join(', ')}.`
      };
    }
  }

  return {
    severity: 'green',
    flag: 'Thorough Competitive Analysis',
    evidence: `Pitch deck acknowledges ${pitchCompetitors.length} competitors, showing market awareness.`
  };
}

/**
 * Analyze public sentiment and news
 */
function analyzePublicSentiment(
  newsArticles: Array<{ title: string; sentiment: string; snippet: string }> | undefined,
  riskIndicators: string[] | undefined
): Array<{ severity: 'red' | 'yellow' | 'green'; flag: string; evidence: string }> {
  const flags: Array<{ severity: 'red' | 'yellow' | 'green'; flag: string; evidence: string }> = [];

  if (!newsArticles || newsArticles.length === 0) {
    flags.push({
      severity: 'yellow',
      flag: 'Limited Public Presence',
      evidence: 'Minimal news coverage found. Startup may lack market visibility or traction.'
    });
    return flags;
  }

  const negativeCount = newsArticles.filter(a => a.sentiment === 'negative').length;
  const positiveCount = newsArticles.filter(a => a.sentiment === 'positive').length;
  const sentimentRatio = negativeCount / newsArticles.length;

  if (sentimentRatio > 0.5) {
    flags.push({
      severity: 'red',
      flag: 'Predominantly Negative Press',
      evidence: `${negativeCount}/${newsArticles.length} recent articles are negative. Public perception issues detected.`
    });
  } else if (sentimentRatio > 0.25) {
    flags.push({
      severity: 'yellow',
      flag: 'Mixed Public Sentiment',
      evidence: `${negativeCount}/${newsArticles.length} articles are negative. Monitor reputation closely.`
    });
  } else if (positiveCount > negativeCount * 2) {
    flags.push({
      severity: 'green',
      flag: 'Positive Media Coverage',
      evidence: `${positiveCount}/${newsArticles.length} positive articles. Strong public perception.`
    });
  }

  // Check specific risk indicators
  if (riskIndicators && riskIndicators.length > 0) {
    const criticalRisks = ['lawsuit', 'layoff', 'fraud', 'investigation', 'bankruptcy'];
    const hasCritical = riskIndicators.some(ri => 
      criticalRisks.some(cr => ri.toLowerCase().includes(cr))
    );

    if (hasCritical) {
      flags.push({
        severity: 'red',
        flag: 'Critical Risk Indicators Detected',
        evidence: `Public records show concerning events: ${riskIndicators.slice(0, 3).join(', ')}.`
      });
    } else if (riskIndicators.length > 0) {
      flags.push({
        severity: 'yellow',
        flag: 'Minor Risk Indicators',
        evidence: `Some concerns noted: ${riskIndicators.slice(0, 2).join(', ')}.`
      });
    }
  }

  return flags;
}

export async function detectRisks(
  input: RiskDetectionInput
): Promise<RiskDetectionOutput> {
  return riskDetectionFlow(input);
}

const riskDetectionFlow = ai.defineFlow(
  {
    name: 'riskDetectionFlow',
    inputSchema: RiskDetectionInputSchema,
    outputSchema: RiskDetectionOutputSchema,
  },
  async (input) => {
    try {
      const allFlags: Array<RiskFlag> = [];

      // 1. Market Size Validation
      const marketValidation = validateMarketSize(
        input.pitchDeckData.marketSize,
        input.benchmarkData?.avgMarketSize
      );
      allFlags.push({
        category: 'Market Size Validation',
        severity: marketValidation.severity,
        flag: marketValidation.isValid ? 'Market Size Verified' : 'Inflated Market Size',
        evidence: marketValidation.explanation,
        recommendation: marketValidation.severity === 'red' 
          ? 'Request detailed TAM methodology and third-party validation.'
          : marketValidation.severity === 'yellow'
          ? 'Verify market size assumptions with independent research.'
          : 'Market sizing appears reasonable.'
      });

      // 2. Metric Inconsistencies
      const metricFlags = detectMetricInconsistencies(
        input.pitchDeckData,
        input.publicData,
        input.benchmarkData
      );
      metricFlags.forEach(mf => {
        allFlags.push({
          category: mf.flag.includes('Funding') ? 'Funding & Burn Rate' : 
                   mf.flag.includes('Growth') ? 'Financial Inconsistency' :
                   mf.flag.includes('LTV') || mf.flag.includes('Churn') ? 'Churn & Unit Economics' :
                   'Financial Inconsistency',
          severity: mf.severity,
          flag: mf.flag,
          evidence: mf.evidence,
          recommendation: mf.severity === 'red'
            ? 'Deep dive required - request audited financials and data sources.'
            : 'Clarify methodology in due diligence calls.'
        });
      });

      // 3. Competitive Landscape
      const competitiveFlag = analyzeCompetitiveLandscape(
        input.pitchDeckData.competitorMentions,
        input.publicData?.competitorMentions
      );
      if (competitiveFlag) {
        allFlags.push({
          category: 'Competitive Landscape',
          ...competitiveFlag,
          recommendation: competitiveFlag.severity === 'red'
            ? 'Request comprehensive competitive analysis before proceeding.'
            : competitiveFlag.severity === 'yellow'
            ? 'Discuss competitive positioning in detail.'
            : 'Competitive awareness is solid.'
        });
      }

      // 4. Public Sentiment
      const sentimentFlags = analyzePublicSentiment(
        input.publicData?.newsArticles,
        input.publicData?.riskIndicators
      );
      sentimentFlags.forEach(sf => {
        allFlags.push({
          category: 'Public Sentiment',
          ...sf,
          recommendation: sf.severity === 'red'
            ? 'Conduct thorough background check and legal due diligence.'
            : sf.severity === 'yellow'
            ? 'Monitor media coverage and discuss concerns with founders.'
            : 'Public perception is positive.'
        });
      });

      // Separate by severity
      const redFlags = allFlags.filter(f => f.severity === 'red');
      const yellowFlags = allFlags.filter(f => f.severity === 'yellow');
      const greenFlags = allFlags.filter(f => f.severity === 'green');

      // Calculate overall risk score (0-100, higher = lower risk)
      const baseScore = 100;
      const redPenalty = redFlags.length * 20;
      const yellowPenalty = yellowFlags.length * 10;
      const greenBonus = greenFlags.length * 5;
      
      const overallRiskScore = Math.max(0, Math.min(100, baseScore - redPenalty - yellowPenalty + greenBonus));

      // Determine risk level
      let riskLevel: 'Critical' | 'High' | 'Medium' | 'Low' | 'Minimal';
      if (overallRiskScore < 40) riskLevel = 'Critical';
      else if (overallRiskScore < 55) riskLevel = 'High';
      else if (overallRiskScore < 70) riskLevel = 'Medium';
      else if (overallRiskScore < 85) riskLevel = 'Low';
      else riskLevel = 'Minimal';

      // Determine recommendation
      let recommendation: 'Pass' | 'Caution - Deep Dive Required' | 'Proceed with Due Diligence' | 'Strong Candidate';
      if (redFlags.length >= 3 || overallRiskScore < 40) {
        recommendation = 'Pass';
      } else if (redFlags.length >= 1 || overallRiskScore < 60) {
        recommendation = 'Caution - Deep Dive Required';
      } else if (yellowFlags.length >= 3 || overallRiskScore < 75) {
        recommendation = 'Proceed with Due Diligence';
      } else {
        recommendation = 'Strong Candidate';
      }

      // Build context for AI summary
      const context = `
**Startup:** ${input.startupName}
**Sector:** ${input.sector}
**Overall Risk Score:** ${overallRiskScore}/100 (${riskLevel} Risk)

**Red Flags (${redFlags.length}):**
${redFlags.map((f, i) => `${i + 1}. ${f.flag}: ${f.evidence}`).join('\n')}

**Yellow Flags (${yellowFlags.length}):**
${yellowFlags.map((f, i) => `${i + 1}. ${f.flag}: ${f.evidence}`).join('\n')}

**Green Flags (${greenFlags.length}):**
${greenFlags.map((f, i) => `${i + 1}. ${f.flag}: ${f.evidence}`).join('\n')}
      `;

      const summaryPrompt = `You are an AI investment analyst writing an executive summary of risk analysis.

${context}

Write a concise 2-3 paragraph summary that:
1. Highlights the most critical risks (if any)
2. Acknowledges positive indicators
3. Provides clear guidance for investors
4. Mentions specific concerns that require due diligence

Be direct, data-driven, and actionable. This will be read by busy VCs making investment decisions.`;

      const { text: summary } = await ai.generate({
        model: 'googleai/gemini-2.0-flash-exp',
        prompt: summaryPrompt,
      });

      return {
        overallRiskScore,
        riskLevel,
        redFlags,
        yellowFlags,
        greenFlags,
        summary: summary || 'Risk analysis complete. Review flags for details.',
        recommendation,
      };
    } catch (error: any) {
      console.error("Error in riskDetectionFlow:", error);
      throw new Error(`Failed to detect risks. Original error: ${error.message}`);
    }
  }
);