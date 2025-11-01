'use server';

/**
 * @fileOverview Benchmarks startup metrics against sector peers using BigQuery data.
 * 
 * - benchmarkStartup - Compares startup metrics with industry benchmarks
 * - SectorBenchmarkInput - Input type for benchmarking
 * - SectorBenchmarkOutput - Output with percentile rankings and comparisons
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { BigQuery } from '@google-cloud/bigquery';

const SectorBenchmarkInputSchema = z.object({
  startupName: z.string().describe("The name of the startup."),
  sector: z.string().describe("The sector/industry (e.g., 'SaaS', 'FinTech', 'HealthTech', 'E-commerce')."),
  stage: z.string().describe("The funding stage (e.g., 'Seed', 'Series A', 'Series B')."),
  metrics: z.object({
    arr: z.number().optional().describe("Annual Recurring Revenue in USD."),
    mrr: z.number().optional().describe("Monthly Recurring Revenue in USD."),
    growthRate: z.number().optional().describe("Year-over-year growth rate as percentage."),
    burnRate: z.number().optional().describe("Monthly burn rate in USD."),
    runway: z.number().optional().describe("Runway in months."),
    customerCount: z.number().optional().describe("Total number of customers."),
    cac: z.number().optional().describe("Customer Acquisition Cost in USD."),
    ltv: z.number().optional().describe("Lifetime Value in USD."),
    teamSize: z.number().optional().describe("Total number of employees."),
    marketSize: z.number().optional().describe("Total Addressable Market in USD billions."),
  }).describe("Current startup metrics."),
});
export type SectorBenchmarkInput = z.infer<typeof SectorBenchmarkInputSchema>;

const SectorBenchmarkOutputSchema = z.object({
  benchmarkData: z.object({
    avgARR: z.number().optional(),
    medianARR: z.number().optional(),
    topQuartileARR: z.number().optional(),
    avgGrowthRate: z.number().optional(),
    medianGrowthRate: z.number().optional(),
    avgBurnRate: z.number().optional(),
    avgTeamSize: z.number().optional(),
    avgCAC: z.number().optional(),
    avgLTV: z.number().optional(),
    avgLTVCACRatio: z.number().optional(),
  }).describe("Sector average and median metrics."),
  percentileRankings: z.object({
    arrPercentile: z.number().optional().describe("Where startup ranks in ARR (0-100)."),
    growthPercentile: z.number().optional().describe("Where startup ranks in growth rate (0-100)."),
    efficiencyPercentile: z.number().optional().describe("Where startup ranks in LTV:CAC ratio (0-100)."),
    teamSizePercentile: z.number().optional().describe("Where startup ranks in team size (0-100)."),
  }).describe("Percentile rankings (higher is better)."),
  comparison: z.object({
    strengths: z.array(z.string()).describe("Metrics where startup outperforms sector average."),
    weaknesses: z.array(z.string()).describe("Metrics where startup underperforms sector average."),
    outliers: z.array(z.string()).describe("Metrics that are significantly different from peers."),
  }).describe("Comparative analysis."),
  verdict: z.enum(['Exceptional', 'Above Average', 'Average', 'Below Average', 'Concerning']).describe("Overall performance verdict."),
  summary: z.string().describe("AI-generated summary of benchmarking results."),
});
export type SectorBenchmarkOutput = z.infer<typeof SectorBenchmarkOutputSchema>;

/**
 * Query BigQuery for sector benchmarks
 * Note: This uses mock data if BigQuery is not configured or dataset doesn't exist
 */
async function getBigQueryBenchmarks(sector: string, stage: string) {
  try {
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
    const datasetId = process.env.BIGQUERY_DATASET_ID || 'startup_benchmarks';

    if (!projectId) {
      console.warn('BigQuery not configured. Using mock benchmark data.');
      return getMockBenchmarkData(sector, stage);
    }

    // Initialize BigQuery with credentials from environment variable
    let bigquery;
    const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    
    if (serviceAccountKey) {
      // Parse and use the service account credentials
      const credentials = JSON.parse(serviceAccountKey);
      bigquery = new BigQuery({ 
        projectId,
        credentials 
      });
    } else {
      // Fallback to Application Default Credentials
      bigquery = new BigQuery({ projectId });
    }

    // Sanitize inputs to prevent SQL injection
    const safeSector = sector.replace(/[^a-zA-Z0-9_]/g, '');
    const safeStage = stage.replace(/[^a-zA-Z0-9_]/g, '');

    const query = `
      SELECT 
        AVG(arr) as avg_arr,
        APPROX_QUANTILES(arr, 100)[OFFSET(50)] as median_arr,
        APPROX_QUANTILES(arr, 100)[OFFSET(75)] as top_quartile_arr,
        AVG(growth_rate) as avg_growth_rate,
        APPROX_QUANTILES(growth_rate, 100)[OFFSET(50)] as median_growth_rate,
        AVG(burn_rate) as avg_burn_rate,
        AVG(team_size) as avg_team_size,
        AVG(cac) as avg_cac,
        AVG(ltv) as avg_ltv,
        AVG(ltv / NULLIF(cac, 0)) as avg_ltv_cac_ratio
      FROM \`${projectId}.${datasetId}.${safeSector.toLowerCase()}\`
      WHERE stage = @stage
      LIMIT 1
    `;

    const options = {
      query: query,
      params: { stage: safeStage },
    };

    const [rows] = await bigquery.query(options);

    if (rows && rows.length > 0) {
      return rows[0];
    } else {
      console.warn(`No benchmark data found for ${sector} / ${stage}. Using mock data.`);
      return getMockBenchmarkData(sector, stage);
    }
  } catch (error: any) {
    console.error('BigQuery error:', error.message);
    return getMockBenchmarkData(sector, stage);
  }
}

/**
 * Mock benchmark data for demonstration
 */
function getMockBenchmarkData(sector: string, stage: string) {
  const benchmarks: Record<string, any> = {
    'SaaS': {
      'Seed': {
        avg_arr: 200000,
        median_arr: 150000,
        top_quartile_arr: 400000,
        avg_growth_rate: 150,
        median_growth_rate: 120,
        avg_burn_rate: 80000,
        avg_team_size: 8,
        avg_cac: 1200,
        avg_ltv: 6000,
        avg_ltv_cac_ratio: 5,
      },
      'Series A': {
        avg_arr: 2000000,
        median_arr: 1500000,
        top_quartile_arr: 3500000,
        avg_growth_rate: 200,
        median_growth_rate: 180,
        avg_burn_rate: 250000,
        avg_team_size: 25,
        avg_cac: 2000,
        avg_ltv: 12000,
        avg_ltv_cac_ratio: 6,
      },
      'Series B': {
        avg_arr: 10000000,
        median_arr: 8000000,
        top_quartile_arr: 15000000,
        avg_growth_rate: 150,
        median_growth_rate: 120,
        avg_burn_rate: 800000,
        avg_team_size: 75,
        avg_cac: 3500,
        avg_ltv: 20000,
        avg_ltv_cac_ratio: 5.7,
      },
    },
    'FinTech': {
      'Seed': {
        avg_arr: 300000,
        median_arr: 250000,
        top_quartile_arr: 500000,
        avg_growth_rate: 180,
        median_growth_rate: 150,
        avg_burn_rate: 100000,
        avg_team_size: 10,
        avg_cac: 800,
        avg_ltv: 5000,
        avg_ltv_cac_ratio: 6.25,
      },
      'Series A': {
        avg_arr: 2500000,
        median_arr: 2000000,
        top_quartile_arr: 4000000,
        avg_growth_rate: 220,
        median_growth_rate: 200,
        avg_burn_rate: 300000,
        avg_team_size: 30,
        avg_cac: 1500,
        avg_ltv: 10000,
        avg_ltv_cac_ratio: 6.67,
      },
    },
    'HealthTech': {
      'Seed': {
        avg_arr: 250000,
        median_arr: 200000,
        top_quartile_arr: 450000,
        avg_growth_rate: 120,
        median_growth_rate: 100,
        avg_burn_rate: 90000,
        avg_team_size: 12,
        avg_cac: 2500,
        avg_ltv: 15000,
        avg_ltv_cac_ratio: 6,
      },
      'Series A': {
        avg_arr: 1800000,
        median_arr: 1500000,
        top_quartile_arr: 3000000,
        avg_growth_rate: 150,
        median_growth_rate: 130,
        avg_burn_rate: 280000,
        avg_team_size: 35,
        avg_cac: 3000,
        avg_ltv: 18000,
        avg_ltv_cac_ratio: 6,
      },
    },
  };

  const sectorData = benchmarks[sector] || benchmarks['SaaS'];
  return sectorData[stage] || sectorData['Series A'];
}

export async function benchmarkStartup(
  input: SectorBenchmarkInput
): Promise<SectorBenchmarkOutput> {
  return sectorBenchmarkingFlow(input);
}

const sectorBenchmarkingFlow = ai.defineFlow(
  {
    name: 'sectorBenchmarkingFlow',
    inputSchema: SectorBenchmarkInputSchema,
    outputSchema: SectorBenchmarkOutputSchema,
  },
  async (input) => {
    try {
      // Get benchmark data from BigQuery (or mock data)
      const benchmarkData = await getBigQueryBenchmarks(input.sector, input.stage);

      const benchmarks = {
        avgARR: benchmarkData.avg_arr,
        medianARR: benchmarkData.median_arr,
        topQuartileARR: benchmarkData.top_quartile_arr,
        avgGrowthRate: benchmarkData.avg_growth_rate,
        avgBurnRate: benchmarkData.avg_burn_rate,
        avgTeamSize: benchmarkData.avg_team_size,
        avgCAC: benchmarkData.avg_cac,
        avgLTV: benchmarkData.avg_ltv,
        avgLTVCACRatio: benchmarkData.avg_ltv_cac_ratio,
      };

      // Build context for Gemini
      let metricsText = `**Startup Metrics:**\n`;
      if (input.metrics.arr) metricsText += `- ARR: $${input.metrics.arr.toLocaleString()}\n`;
      if (input.metrics.growthRate) metricsText += `- Growth Rate: ${input.metrics.growthRate}% YoY\n`;
      if (input.metrics.burnRate) metricsText += `- Burn Rate: $${input.metrics.burnRate.toLocaleString()}/month\n`;
      if (input.metrics.cac) metricsText += `- CAC: $${input.metrics.cac.toLocaleString()}\n`;
      if (input.metrics.ltv) metricsText += `- LTV: $${input.metrics.ltv.toLocaleString()}\n`;
      if (input.metrics.teamSize) metricsText += `- Team Size: ${input.metrics.teamSize} employees\n`;

      let benchmarksText = `**Sector Benchmarks (${input.sector} - ${input.stage}):**\n`;
      if (benchmarks.avgARR) benchmarksText += `- Average ARR: $${benchmarks.avgARR.toLocaleString()}\n`;
      if (benchmarks.medianARR) benchmarksText += `- Median ARR: $${benchmarks.medianARR.toLocaleString()}\n`;
      if (benchmarks.topQuartileARR) benchmarksText += `- Top Quartile ARR: $${benchmarks.topQuartileARR.toLocaleString()}\n`;
      if (benchmarks.avgGrowthRate) benchmarksText += `- Average Growth: ${benchmarks.avgGrowthRate}% YoY\n`;
      if (benchmarks.avgBurnRate) benchmarksText += `- Average Burn: $${benchmarks.avgBurnRate.toLocaleString()}/month\n`;
      if (benchmarks.avgTeamSize) benchmarksText += `- Average Team Size: ${benchmarks.avgTeamSize}\n`;
      if (benchmarks.avgCAC) benchmarksText += `- Average CAC: $${benchmarks.avgCAC.toLocaleString()}\n`;
      if (benchmarks.avgLTV) benchmarksText += `- Average LTV: $${benchmarks.avgLTV.toLocaleString()}\n`;
      if (benchmarks.avgLTVCACRatio) benchmarksText += `- Average LTV:CAC Ratio: ${benchmarks.avgLTVCACRatio.toFixed(1)}x\n`;

      const analysisPrompt = `You are an AI analyst comparing a startup's metrics against sector benchmarks.

**Startup:** ${input.startupName}
**Sector:** ${input.sector}
**Stage:** ${input.stage}

${metricsText}

${benchmarksText}

**Instructions:**
1. Calculate percentile rankings for each metric (0 = worst, 100 = best)
2. Identify strengths (metrics above sector average)
3. Identify weaknesses (metrics below sector average)
4. Flag outliers (metrics >2x or <0.5x sector average)
5. Determine overall verdict:
   - Exceptional: Top 10% across multiple metrics
   - Above Average: Better than average in most metrics
   - Average: Mixed performance, close to benchmarks
   - Below Average: Underperforming in most metrics
   - Concerning: Significantly below benchmarks with red flags
6. Write a 2-3 paragraph summary with actionable insights

Be specific with numbers and provide investor-ready analysis.`;

      // Use Gemini to analyze and compare
      const { output } = await ai.generate({
        model: 'googleai/gemini-2.0-flash-exp',
        prompt: analysisPrompt,
        output: { schema: SectorBenchmarkOutputSchema },
      });

      if (!output) {
        throw new Error("AI model returned null response during benchmarking.");
      }

      // Add benchmark data to output
      return {
        ...output,
        benchmarkData: benchmarks,
      };
    } catch (error: any) {
      console.error("Error in sectorBenchmarkingFlow:", error);
      throw new Error(`Failed to benchmark startup. Original error: ${error.message}`);
    }
  }
);
