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
import { getBigQueryCredentials } from '@/lib/service-account';

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
      throw new Error('GOOGLE_CLOUD_PROJECT_ID environment variable not set');
    }

    // Construct service account credentials from environment variables
    const serviceAccountEmail = process.env.GCP_SERVICE_ACCOUNT_CLIENT_EMAIL;
    const privateKey = process.env.GCP_SERVICE_ACCOUNT_PRIVATE_KEY;
    
    if (!serviceAccountEmail || !privateKey) {
      throw new Error('GCP service account credentials not set. Required: GCP_SERVICE_ACCOUNT_CLIENT_EMAIL and GCP_SERVICE_ACCOUNT_PRIVATE_KEY');
    }

    console.log(`[BigQuery] Initializing with project: ${projectId}, service account: ${serviceAccountEmail}`);
    
    const bigquery = new BigQuery({ 
      projectId,
      credentials: {
        client_email: serviceAccountEmail,
        private_key: privateKey.replace(/\\n/g, '\n'), // Handle escaped newlines
      },
    });

    // Sanitize sector name for table name (only alphanumeric and underscore)
    const safeSector = sector.replace(/[^a-zA-Z0-9_]/g, '');
    
    // Map sector names to table names
    const sectorTableMap: Record<string, string> = {
      'SaaS': 'saas',
      'FinTech': 'fintech',
      'HealthTech': 'healthtech',
      'E-commerce': 'ecommerce',
      'EdTech': 'edtech',
      'AI/ML': 'aiml',
    };
    
    const tableName = sectorTableMap[sector] || safeSector.toLowerCase();

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
      FROM \`${projectId}.${datasetId}.${tableName}\`
      WHERE stage = @stage
      LIMIT 1
    `;

    const options = {
      query: query,
      params: { stage: stage }, // Use original stage value with + symbol
    };

    console.log(`[BigQuery] Querying table: ${projectId}.${datasetId}.${tableName}, stage: "${stage}"`);
    
    const [rows] = await bigquery.query(options);

    console.log(`[BigQuery] Query returned ${rows.length} rows`);
    if (rows.length > 0) {
      console.log('[BigQuery] Sample data:', rows[0]);
    }

    if (rows && rows.length > 0) {
      // Check if we got actual data or just nulls
      const hasData = rows[0].avg_arr !== null || rows[0].median_arr !== null;
      if (!hasData) {
        throw new Error(`BigQuery returned null values for ${sector} / ${stage}. No matching data in table.`);
      }
      return rows[0];
    } else {
      throw new Error(`No benchmark data found in BigQuery for ${sector} / ${stage}.`);
    }
  } catch (error: any) {
    console.error('[BigQuery ERROR]:', error.message);
    // CRITICAL: Don't use mock data - throw error so user knows BigQuery failed
    throw new Error(`BigQuery query failed: ${error.message}. Please check service account permissions and table data.`);
  }
}

// Mock data removed - using real BigQuery data only

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

      // Calculate percentiles based on comparison to benchmarks
      const calculatePercentile = (value: number | undefined, avg: number | undefined, median: number | undefined): number => {
        if (!value || !avg) return 0;
        
        // Use normal distribution approximation
        // If value equals average, percentile is 50
        // If value is 2x average, percentile is ~97.5
        // If value is 0.5x average, percentile is ~2.5
        
        const ratio = value / avg;
        
        if (ratio >= 2) return 98;
        if (ratio >= 1.5) return 85;
        if (ratio >= 1.2) return 70;
        if (ratio >= 1.0) return 50;
        if (ratio >= 0.8) return 30;
        if (ratio >= 0.5) return 15;
        return 5;
      };

      const arrPercentile = calculatePercentile(input.metrics.arr, benchmarks.avgARR, benchmarks.medianARR);
      const growthPercentile = calculatePercentile(input.metrics.growthRate, benchmarks.avgGrowthRate, undefined);
      
      // For LTV:CAC efficiency
      const startupLTVCAC = (input.metrics.ltv && input.metrics.cac && input.metrics.cac > 0) 
        ? input.metrics.ltv / input.metrics.cac 
        : undefined;
      const efficiencyPercentile = calculatePercentile(startupLTVCAC, benchmarks.avgLTVCACRatio, undefined);
      
      const teamSizePercentile = calculatePercentile(input.metrics.teamSize, benchmarks.avgTeamSize, undefined);

      console.log('[Percentiles Calculated]:', { arrPercentile, growthPercentile, efficiencyPercentile, teamSizePercentile });

      const analysisPrompt = `You are an AI analyst comparing a startup's metrics against sector benchmarks.

**Startup:** ${input.startupName}
**Sector:** ${input.sector}
**Stage:** ${input.stage}

${metricsText}

${benchmarksText}

**Calculated Percentile Rankings:**
- ARR Percentile: ${arrPercentile}th (${input.metrics.arr ? `$${input.metrics.arr.toLocaleString()}` : 'N/A'} vs avg $${benchmarks.avgARR?.toLocaleString() || 'N/A'})
- Growth Percentile: ${growthPercentile}th (${input.metrics.growthRate || 'N/A'}% vs avg ${benchmarks.avgGrowthRate || 'N/A'}%)
- Efficiency Percentile: ${efficiencyPercentile}th (${startupLTVCAC?.toFixed(1) || 'N/A'}x vs avg ${benchmarks.avgLTVCACRatio?.toFixed(1) || 'N/A'}x LTV:CAC)
- Team Size Percentile: ${teamSizePercentile}th (${input.metrics.teamSize || 'N/A'} vs avg ${benchmarks.avgTeamSize?.toFixed(0) || 'N/A'})

**Instructions:**
1. Use the CALCULATED percentile rankings above (do NOT recalculate them)
2. Identify strengths (percentiles >60) and weaknesses (percentiles <40)
3. Flag outliers (metrics >2x or <0.5x sector average)
4. Determine overall verdict:
   - Exceptional: Top 20% (percentiles >80) across multiple metrics
   - Above Average: Above average (percentiles 60-80) in most metrics
   - Average: Mixed performance (percentiles 40-60)
   - Below Average: Underperforming (percentiles 20-40) in most metrics
   - Concerning: Significantly below (percentiles <20) benchmarks with red flags
5. Write a 2-3 paragraph summary with SPECIFIC, ACTIONABLE insights for investors
6. Focus on what the startup needs to DO to improve weak areas

Be direct, quantitative, and investor-focused. Reference specific numbers from the data.`;

      // Use Gemini to analyze and compare
      const { output } = await ai.generate({
        model: 'googleai/gemini-2.0-flash-exp',
        prompt: analysisPrompt,
        output: { schema: SectorBenchmarkOutputSchema },
      });

      if (!output) {
        throw new Error("AI model returned null response during benchmarking.");
      }

      // Override with our calculated percentiles (don't trust AI's calculations)
      return {
        benchmarkData: benchmarks,
        percentileRankings: {
          arrPercentile,
          growthPercentile,
          efficiencyPercentile,
          teamSizePercentile,
        },
        comparison: output.comparison,
        verdict: output.verdict,
        summary: output.summary,
      };
    } catch (error: any) {
      console.error("Error in sectorBenchmarkingFlow:", error);
      throw new Error(`Failed to benchmark startup. Original error: ${error.message}`);
    }
  }
);
