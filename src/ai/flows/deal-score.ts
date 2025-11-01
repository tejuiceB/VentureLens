'use server';

/**
 * @fileOverview Calculates comprehensive deal score with customizable investor preferences.
 * 
 * - calculateDealScore - Scores startup 0-100 with category breakdown
 * - DealScoreInput - Input type with startup data and investor weights
 * - DealScoreOutput - Output with overall score, category scores, and recommendation
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DealScoreInputSchema = z.object({
  startupName: z.string().describe("The name of the startup."),
  sector: z.string().describe("The sector/industry."),
  stage: z.string().describe("The funding stage."),
  
  // Investor preference weights (sum should be 100)
  weights: z.object({
    team: z.number().min(0).max(100).default(25).describe("Weight for team quality (0-100%)."),
    market: z.number().min(0).max(100).default(20).describe("Weight for market opportunity (0-100%)."),
    traction: z.number().min(0).max(100).default(25).describe("Weight for traction/growth (0-100%)."),
    product: z.number().min(0).max(100).default(15).describe("Weight for product differentiation (0-100%)."),
    financials: z.number().min(0).max(100).default(15).describe("Weight for financial health (0-100%)."),
  }).describe("Investor preference weights. Must sum to 100."),
  
  // Team data
  team: z.object({
    founders: z.array(z.object({
      name: z.string(),
      role: z.string(),
      background: z.string(),
      yearsExperience: z.number().optional(),
    })).describe("Founder information."),
    teamSize: z.number().optional().describe("Total team size."),
    hasRelevantExperience: z.boolean().optional().describe("Do founders have domain expertise?"),
    hasPriorSuccesses: z.boolean().optional().describe("Do founders have previous exits?"),
    advisors: z.array(z.string()).optional().describe("Notable advisors or board members."),
  }).describe("Team assessment data."),
  
  // Market data
  market: z.object({
    tam: z.number().optional().describe("Total Addressable Market in USD billions."),
    growthRate: z.number().optional().describe("Market growth rate %."),
    competitiveIntensity: z.enum(['Low', 'Medium', 'High']).optional().describe("Level of competition."),
    marketTrend: z.enum(['Declining', 'Stable', 'Growing', 'Explosive']).optional().describe("Market trend."),
  }).describe("Market opportunity assessment."),
  
  // Traction data
  traction: z.object({
    arr: z.number().optional().describe("Annual Recurring Revenue."),
    mrr: z.number().optional().describe("Monthly Recurring Revenue."),
    growthRate: z.number().optional().describe("YoY growth rate %."),
    customerCount: z.number().optional().describe("Total customers."),
    revenueGrowthLast6Months: z.number().optional().describe("% revenue growth in last 6 months."),
    keyCustomers: z.array(z.string()).optional().describe("Notable customer names."),
  }).describe("Traction and growth metrics."),
  
  // Product data
  product: z.object({
    hasUniqueValue: z.boolean().optional().describe("Does product have unique value proposition?"),
    hasTechMoat: z.boolean().optional().describe("Is there a defensible technology moat?"),
    productStage: z.enum(['Concept', 'MVP', 'Beta', 'Production', 'Mature']).optional().describe("Product maturity."),
    hasIntellectualProperty: z.boolean().optional().describe("Patents, trademarks, or proprietary tech?"),
    competitorAdvantages: z.array(z.string()).optional().describe("Key advantages over competitors."),
  }).describe("Product differentiation assessment."),
  
  // Financial data
  financials: z.object({
    cac: z.number().optional().describe("Customer Acquisition Cost."),
    ltv: z.number().optional().describe("Customer Lifetime Value."),
    burnRate: z.number().optional().describe("Monthly burn rate."),
    runway: z.number().optional().describe("Months of runway."),
    grossMargin: z.number().optional().describe("Gross margin %."),
    churnRate: z.number().optional().describe("Annual churn rate %."),
    profitPathMonths: z.number().optional().describe("Estimated months to profitability."),
  }).describe("Financial health metrics."),
  
  // External analysis results (from previous flows)
  benchmarkScore: z.number().min(0).max(100).optional().describe("Score from sector benchmarking (0-100)."),
  riskScore: z.number().min(0).max(100).optional().describe("Risk score from risk detection (0-100, higher = lower risk)."),
  publicSentiment: z.enum(['Very Negative', 'Negative', 'Neutral', 'Positive', 'Very Positive']).optional(),
});
export type DealScoreInput = z.infer<typeof DealScoreInputSchema>;

const CategoryScoreSchema = z.object({
  category: z.string().describe("Category name."),
  score: z.number().min(0).max(100).describe("Category score (0-100)."),
  weight: z.number().min(0).max(100).describe("Weight applied (%)."),
  weightedScore: z.number().describe("Score * weight."),
  reasoning: z.string().describe("Brief explanation of score."),
  strengths: z.array(z.string()).describe("Key strengths in this category."),
  concerns: z.array(z.string()).describe("Key concerns in this category."),
});
export type CategoryScore = z.infer<typeof CategoryScoreSchema>;

const DealScoreOutputSchema = z.object({
  overallScore: z.number().min(0).max(100).describe("Final weighted deal score (0-100)."),
  recommendation: z.enum(['Strong Pass', 'Pass', 'Maybe - Needs More Diligence', 'Invest with Caution', 'Strong Invest']).describe("Investment recommendation."),
  confidence: z.enum(['Low', 'Medium', 'High']).describe("Confidence level in recommendation."),
  
  categoryScores: z.array(CategoryScoreSchema).describe("Detailed scores by category."),
  
  // Investment thesis
  investmentThesis: z.string().describe("2-3 paragraph summary explaining the score and recommendation."),
  keyStrengths: z.array(z.string()).describe("Top 3-5 reasons to invest."),
  keyConcerns: z.array(z.string()).describe("Top 3-5 risks or concerns."),
  
  // Risk-adjusted projections
  projections: z.object({
    estimatedReturnMultiple: z.string().describe("Estimated return (e.g., '3-5x', '10-15x')."),
    timeToExit: z.string().describe("Estimated years to exit."),
    probabilityOfSuccess: z.string().describe("% likelihood of successful exit."),
    riskAdjustedReturn: z.string().describe("Risk-adjusted IRR estimate."),
  }).describe("Financial projections."),
  
  nextSteps: z.array(z.string()).describe("Recommended due diligence actions."),
});
export type DealScoreOutput = z.infer<typeof DealScoreOutputSchema>;

/**
 * Calculate team score based on founder experience, team size, and track record
 */
function calculateTeamScore(team: any): { score: number; strengths: string[]; concerns: string[] } {
  let score = 50; // Base score
  const strengths: string[] = [];
  const concerns: string[] = [];

  // Founder experience
  if (team.hasRelevantExperience) {
    score += 15;
    strengths.push("Founders have deep domain expertise");
  } else {
    concerns.push("Limited domain-specific experience");
  }

  // Prior successes
  if (team.hasPriorSuccesses) {
    score += 20;
    strengths.push("Founders have previous successful exits");
  } else {
    score -= 5;
    concerns.push("No proven track record of exits");
  }

  // Team size
  if (team.teamSize) {
    if (team.teamSize >= 10 && team.teamSize <= 50) {
      score += 10;
      strengths.push(`Well-sized team of ${team.teamSize} employees`);
    } else if (team.teamSize < 10) {
      score += 5;
      concerns.push("Small team may struggle to execute");
    } else {
      concerns.push("Large team may indicate high burn rate");
    }
  }

  // Advisors
  if (team.advisors && team.advisors.length > 0) {
    score += 5;
    strengths.push(`Strong advisory board: ${team.advisors.slice(0, 2).join(', ')}`);
  }

  // Founder count
  if (team.founders.length === 2 || team.founders.length === 3) {
    score += 10;
    strengths.push("Optimal founder team size (2-3 co-founders)");
  } else if (team.founders.length === 1) {
    concerns.push("Solo founder - higher execution risk");
  } else if (team.founders.length > 4) {
    concerns.push("Too many co-founders may lead to conflict");
  }

  return { score: Math.min(100, Math.max(0, score)), strengths, concerns };
}

/**
 * Calculate market score based on TAM, growth, and competition
 */
function calculateMarketScore(market: any): { score: number; strengths: string[]; concerns: string[] } {
  let score = 50;
  const strengths: string[] = [];
  const concerns: string[] = [];

  // Market size (TAM)
  if (market.tam) {
    if (market.tam >= 10) {
      score += 20;
      strengths.push(`Large TAM of $${market.tam}B+`);
    } else if (market.tam >= 1) {
      score += 10;
      strengths.push(`Decent TAM of $${market.tam}B`);
    } else {
      score -= 10;
      concerns.push("Small addressable market (<$1B)");
    }
  }

  // Market growth
  if (market.growthRate) {
    if (market.growthRate >= 20) {
      score += 15;
      strengths.push(`Fast-growing market (${market.growthRate}% CAGR)`);
    } else if (market.growthRate >= 10) {
      score += 8;
      strengths.push(`Growing market (${market.growthRate}% CAGR)`);
    } else {
      score -= 5;
      concerns.push("Slow market growth");
    }
  }

  // Market trend
  if (market.marketTrend === 'Explosive') {
    score += 15;
    strengths.push("Explosive market momentum");
  } else if (market.marketTrend === 'Growing') {
    score += 8;
  } else if (market.marketTrend === 'Declining') {
    score -= 15;
    concerns.push("Market is in decline");
  }

  // Competitive intensity
  if (market.competitiveIntensity === 'Low') {
    score += 10;
    strengths.push("Low competitive intensity - easier to capture market share");
  } else if (market.competitiveIntensity === 'High') {
    score -= 10;
    concerns.push("Highly competitive market - difficult to differentiate");
  }

  return { score: Math.min(100, Math.max(0, score)), strengths, concerns };
}

/**
 * Calculate traction score based on revenue, growth, and customers
 */
function calculateTractionScore(traction: any): { score: number; strengths: string[]; concerns: string[] } {
  let score = 40;
  const strengths: string[] = [];
  const concerns: string[] = [];

  // Revenue
  if (traction.arr) {
    if (traction.arr >= 5000000) {
      score += 25;
      strengths.push(`Strong ARR of $${(traction.arr / 1000000).toFixed(1)}M`);
    } else if (traction.arr >= 1000000) {
      score += 15;
      strengths.push(`Solid ARR of $${(traction.arr / 1000000).toFixed(1)}M`);
    } else if (traction.arr >= 100000) {
      score += 8;
      strengths.push(`Early revenue of $${(traction.arr / 1000).toFixed(0)}K ARR`);
    } else {
      concerns.push("Limited revenue traction");
    }
  }

  // Growth rate
  if (traction.growthRate) {
    if (traction.growthRate >= 200) {
      score += 20;
      strengths.push(`Exceptional growth rate of ${traction.growthRate}% YoY`);
    } else if (traction.growthRate >= 100) {
      score += 12;
      strengths.push(`Strong growth of ${traction.growthRate}% YoY`);
    } else if (traction.growthRate >= 50) {
      score += 6;
      strengths.push(`Healthy growth of ${traction.growthRate}% YoY`);
    } else {
      score -= 5;
      concerns.push("Slow growth momentum");
    }
  }

  // Customer count
  if (traction.customerCount) {
    if (traction.customerCount >= 1000) {
      score += 10;
      strengths.push(`${traction.customerCount.toLocaleString()} customers - strong validation`);
    } else if (traction.customerCount >= 100) {
      score += 5;
      strengths.push(`${traction.customerCount} customers - gaining traction`);
    } else {
      concerns.push("Limited customer base");
    }
  }

  // Recent growth
  if (traction.revenueGrowthLast6Months) {
    if (traction.revenueGrowthLast6Months >= 50) {
      score += 5;
      strengths.push("Strong recent momentum");
    } else if (traction.revenueGrowthLast6Months < 0) {
      score -= 10;
      concerns.push("Negative revenue growth in last 6 months");
    }
  }

  // Key customers
  if (traction.keyCustomers && traction.keyCustomers.length > 0) {
    score += 10;
    strengths.push(`Notable customers: ${traction.keyCustomers.slice(0, 2).join(', ')}`);
  }

  return { score: Math.min(100, Math.max(0, score)), strengths, concerns };
}

/**
 * Calculate product score based on differentiation and maturity
 */
function calculateProductScore(product: any): { score: number; strengths: string[]; concerns: string[] } {
  let score = 50;
  const strengths: string[] = [];
  const concerns: string[] = [];

  // Unique value proposition
  if (product.hasUniqueValue) {
    score += 15;
    strengths.push("Clear unique value proposition");
  } else {
    score -= 10;
    concerns.push("Unclear differentiation from competitors");
  }

  // Tech moat
  if (product.hasTechMoat) {
    score += 20;
    strengths.push("Strong defensible technology moat");
  } else {
    concerns.push("Limited competitive barriers");
  }

  // Product maturity
  if (product.productStage === 'Production' || product.productStage === 'Mature') {
    score += 15;
    strengths.push("Production-ready product with proven stability");
  } else if (product.productStage === 'Beta') {
    score += 8;
    strengths.push("Beta product with customer validation");
  } else if (product.productStage === 'MVP') {
    score += 3;
    concerns.push("Early MVP stage - execution risk remains");
  } else if (product.productStage === 'Concept') {
    score -= 10;
    concerns.push("Concept stage - no product validation yet");
  }

  // Intellectual property
  if (product.hasIntellectualProperty) {
    score += 10;
    strengths.push("Protected by patents or proprietary technology");
  }

  // Competitive advantages
  if (product.competitorAdvantages && product.competitorAdvantages.length >= 3) {
    score += 10;
    strengths.push(`Multiple competitive advantages: ${product.competitorAdvantages.slice(0, 2).join(', ')}`);
  } else if (product.competitorAdvantages && product.competitorAdvantages.length > 0) {
    score += 5;
  } else {
    concerns.push("No clear competitive advantages identified");
  }

  return { score: Math.min(100, Math.max(0, score)), strengths, concerns };
}

/**
 * Calculate financial score based on unit economics and runway
 */
function calculateFinancialScore(financials: any): { score: number; strengths: string[]; concerns: string[] } {
  let score = 50;
  const strengths: string[] = [];
  const concerns: string[] = [];

  // LTV:CAC ratio
  if (financials.ltv && financials.cac) {
    const ratio = financials.ltv / financials.cac;
    if (ratio >= 5) {
      score += 20;
      strengths.push(`Excellent LTV:CAC ratio of ${ratio.toFixed(1)}x`);
    } else if (ratio >= 3) {
      score += 12;
      strengths.push(`Healthy LTV:CAC ratio of ${ratio.toFixed(1)}x`);
    } else if (ratio < 2) {
      score -= 15;
      concerns.push(`Poor unit economics (LTV:CAC = ${ratio.toFixed(1)}x, need >3x)`);
    } else {
      concerns.push("Marginal unit economics");
    }
  }

  // Gross margin
  if (financials.grossMargin) {
    if (financials.grossMargin >= 70) {
      score += 12;
      strengths.push(`Strong gross margins of ${financials.grossMargin}%`);
    } else if (financials.grossMargin >= 50) {
      score += 6;
    } else {
      score -= 5;
      concerns.push("Low gross margins may limit scalability");
    }
  }

  // Runway
  if (financials.runway) {
    if (financials.runway >= 18) {
      score += 10;
      strengths.push(`${financials.runway} months runway - well-capitalized`);
    } else if (financials.runway >= 12) {
      score += 5;
    } else if (financials.runway < 6) {
      score -= 15;
      concerns.push(`Critical: Only ${financials.runway} months runway remaining`);
    } else {
      concerns.push("Limited runway - needs to raise soon");
    }
  }

  // Churn rate
  if (financials.churnRate !== undefined) {
    if (financials.churnRate <= 5) {
      score += 8;
      strengths.push(`Low churn rate of ${financials.churnRate}% indicates strong retention`);
    } else if (financials.churnRate <= 10) {
      score += 3;
    } else {
      score -= 10;
      concerns.push(`High churn rate of ${financials.churnRate}% indicates weak product-market fit`);
    }
  }

  // Path to profitability
  if (financials.profitPathMonths) {
    if (financials.profitPathMonths <= 12) {
      score += 10;
      strengths.push(`Near-term path to profitability (${financials.profitPathMonths} months)`);
    } else if (financials.profitPathMonths <= 24) {
      score += 5;
    } else {
      concerns.push("Long path to profitability");
    }
  }

  return { score: Math.min(100, Math.max(0, score)), strengths, concerns };
}

export async function calculateDealScore(
  input: DealScoreInput
): Promise<DealScoreOutput> {
  return dealScoreFlow(input);
}

const dealScoreFlow = ai.defineFlow(
  {
    name: 'dealScoreFlow',
    inputSchema: DealScoreInputSchema,
    outputSchema: DealScoreOutputSchema,
  },
  async (input) => {
    try {
      // Validate weights sum to 100
      const weightSum = Object.values(input.weights).reduce((a, b) => a + b, 0);
      if (Math.abs(weightSum - 100) > 0.1) {
        throw new Error(`Weights must sum to 100. Current sum: ${weightSum}`);
      }

      // Calculate category scores
      const teamResult = calculateTeamScore(input.team);
      const marketResult = calculateMarketScore(input.market);
      const tractionResult = calculateTractionScore(input.traction);
      const productResult = calculateProductScore(input.product);
      const financialResult = calculateFinancialScore(input.financials);

      // Build category scores array
      const categoryScores: CategoryScore[] = [
        {
          category: 'Team',
          score: teamResult.score,
          weight: input.weights.team,
          weightedScore: (teamResult.score * input.weights.team) / 100,
          reasoning: `${teamResult.strengths.length} strengths, ${teamResult.concerns.length} concerns`,
          strengths: teamResult.strengths,
          concerns: teamResult.concerns,
        },
        {
          category: 'Market',
          score: marketResult.score,
          weight: input.weights.market,
          weightedScore: (marketResult.score * input.weights.market) / 100,
          reasoning: `${marketResult.strengths.length} strengths, ${marketResult.concerns.length} concerns`,
          strengths: marketResult.strengths,
          concerns: marketResult.concerns,
        },
        {
          category: 'Traction',
          score: tractionResult.score,
          weight: input.weights.traction,
          weightedScore: (tractionResult.score * input.weights.traction) / 100,
          reasoning: `${tractionResult.strengths.length} strengths, ${tractionResult.concerns.length} concerns`,
          strengths: tractionResult.strengths,
          concerns: tractionResult.concerns,
        },
        {
          category: 'Product',
          score: productResult.score,
          weight: input.weights.product,
          weightedScore: (productResult.score * input.weights.product) / 100,
          reasoning: `${productResult.strengths.length} strengths, ${productResult.concerns.length} concerns`,
          strengths: productResult.strengths,
          concerns: productResult.concerns,
        },
        {
          category: 'Financials',
          score: financialResult.score,
          weight: input.weights.financials,
          weightedScore: (financialResult.score * input.weights.financials) / 100,
          reasoning: `${financialResult.strengths.length} strengths, ${financialResult.concerns.length} concerns`,
          strengths: financialResult.strengths,
          concerns: financialResult.concerns,
        },
      ];

      // Calculate overall weighted score
      const overallScore = categoryScores.reduce((sum, cat) => sum + cat.weightedScore, 0);

      // Factor in external scores if available
      let adjustedScore = overallScore;
      if (input.benchmarkScore !== undefined) {
        adjustedScore = (adjustedScore * 0.8) + (input.benchmarkScore * 0.1); // 10% weight to benchmark
      }
      if (input.riskScore !== undefined) {
        adjustedScore = (adjustedScore * 0.9) + (input.riskScore * 0.1); // 10% weight to risk
      }

      // Determine recommendation
      let recommendation: 'Strong Pass' | 'Pass' | 'Maybe - Needs More Diligence' | 'Invest with Caution' | 'Strong Invest';
      let confidence: 'Low' | 'Medium' | 'High';

      if (adjustedScore >= 80) {
        recommendation = 'Strong Invest';
        confidence = 'High';
      } else if (adjustedScore >= 70) {
        recommendation = 'Invest with Caution';
        confidence = 'High';
      } else if (adjustedScore >= 55) {
        recommendation = 'Maybe - Needs More Diligence';
        confidence = 'Medium';
      } else if (adjustedScore >= 40) {
        recommendation = 'Pass';
        confidence = 'Medium';
      } else {
        recommendation = 'Strong Pass';
        confidence = 'Low';
      }

      // Collect all strengths and concerns
      const allStrengths = categoryScores.flatMap(c => c.strengths);
      const allConcerns = categoryScores.flatMap(c => c.concerns);

      // Build context for AI thesis generation
      const context = `
**Startup:** ${input.startupName}
**Sector:** ${input.sector} | **Stage:** ${input.stage}
**Overall Score:** ${adjustedScore.toFixed(1)}/100

**Category Breakdown:**
${categoryScores.map(c => 
  `- ${c.category}: ${c.score}/100 (weight: ${c.weight}%) = ${c.weightedScore.toFixed(1)} points`
).join('\n')}

**Top Strengths:**
${allStrengths.slice(0, 5).map((s, i) => `${i + 1}. ${s}`).join('\n')}

**Key Concerns:**
${allConcerns.slice(0, 5).map((c, i) => `${i + 1}. ${c}`).join('\n')}

**External Factors:**
${input.benchmarkScore ? `- Benchmark Score: ${input.benchmarkScore}/100` : ''}
${input.riskScore ? `- Risk Score: ${input.riskScore}/100 (higher = lower risk)` : ''}
${input.publicSentiment ? `- Public Sentiment: ${input.publicSentiment}` : ''}

**Recommendation:** ${recommendation} (${confidence} confidence)
      `;

      const thesisPrompt = `You are a senior VC partner writing an investment thesis memo.

${context}

Write a compelling 2-3 paragraph investment thesis that:
1. Opens with your recommendation and overall assessment
2. Highlights the 2-3 most compelling reasons to invest (or pass)
3. Acknowledges the main risks and how they could be mitigated
4. Provides actionable guidance for the investment committee

Be direct, data-driven, and use specific numbers from the analysis. Write in a professional VC tone.`;

      const { text: investmentThesis } = await ai.generate({
        model: 'googleai/gemini-2.0-flash-exp',
        prompt: thesisPrompt,
      });

      // Generate risk-adjusted projections
      let estimatedReturnMultiple = '3-5x';
      let timeToExit = '5-7 years';
      let probabilityOfSuccess = '15-25%';
      let riskAdjustedReturn = '10-15% IRR';

      if (adjustedScore >= 80) {
        estimatedReturnMultiple = '10-20x';
        timeToExit = '4-6 years';
        probabilityOfSuccess = '35-50%';
        riskAdjustedReturn = '25-35% IRR';
      } else if (adjustedScore >= 70) {
        estimatedReturnMultiple = '5-10x';
        timeToExit = '5-7 years';
        probabilityOfSuccess = '25-35%';
        riskAdjustedReturn = '18-25% IRR';
      } else if (adjustedScore >= 55) {
        estimatedReturnMultiple = '3-7x';
        timeToExit = '6-8 years';
        probabilityOfSuccess = '15-25%';
        riskAdjustedReturn = '10-18% IRR';
      } else {
        estimatedReturnMultiple = '1-3x';
        timeToExit = '7-10 years';
        probabilityOfSuccess = '5-15%';
        riskAdjustedReturn = '5-10% IRR';
      }

      // Generate next steps
      const nextSteps: string[] = [];
      if (financialResult.concerns.some(c => c.includes('unit economics'))) {
        nextSteps.push("Request detailed unit economics breakdown and cohort analysis");
      }
      if (teamResult.concerns.some(c => c.includes('experience'))) {
        nextSteps.push("Conduct reference checks on founders and key team members");
      }
      if (marketResult.concerns.some(c => c.includes('market'))) {
        nextSteps.push("Validate TAM with independent market research");
      }
      if (tractionResult.concerns.some(c => c.includes('revenue'))) {
        nextSteps.push("Review MRR breakdown, churn data, and customer contracts");
      }
      if (productResult.concerns.some(c => c.includes('differentiation'))) {
        nextSteps.push("Schedule product demo and competitive analysis review");
      }
      if (nextSteps.length === 0) {
        nextSteps.push("Review cap table and prior round terms");
        nextSteps.push("Schedule founder interviews and team assessment");
        nextSteps.push("Conduct customer reference calls");
      }

      return {
        overallScore: Math.round(adjustedScore * 10) / 10,
        recommendation,
        confidence,
        categoryScores,
        investmentThesis: investmentThesis || 'Investment thesis generation in progress.',
        keyStrengths: allStrengths.slice(0, 5),
        keyConcerns: allConcerns.slice(0, 5),
        projections: {
          estimatedReturnMultiple,
          timeToExit,
          probabilityOfSuccess,
          riskAdjustedReturn,
        },
        nextSteps: nextSteps.slice(0, 5),
      };
    } catch (error: any) {
      console.error("Error in dealScoreFlow:", error);
      throw new Error(`Failed to calculate deal score. Original error: ${error.message}`);
    }
  }
);