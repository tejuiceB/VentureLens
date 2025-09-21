
'use server';

/**
 * @fileOverview Assesses investor risk appetite, investment preferences, and desired returns through a questionnaire.
 *
 * - investorRiskAssessment - A function that handles the investor risk assessment process.
 * - InvestorRiskAssessmentInput - The input type for the investorRiskAssessment function.
 * - InvestorRiskAssessmentOutput - The return type for the investorRiskAssessment function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const InvestorRiskAssessmentInputSchema = z.object({
  riskAppetite: z
    .string()
    .describe(
      'The investor risk appetite, e.g., Conservative, Moderate, Aggressive.'
    ),
  investmentPreferences: z
    .string()
    .describe('The investor investment preferences, e.g., Tech, Healthcare, Real Estate.'),
  desiredReturns: z
    .string()
    .describe('The investor desired returns, e.g., Low, Medium, High.'),
  investmentAmount: z
    .string()
    .describe('The amount the investor is looking to invest.'),
  investmentHorizon: z
    .string()
    .describe('The duration the investor wants to invest.'),
  country: z
    .string()
    .describe('The country of residence of the investor.'),
  investmentFocus: z.string().optional().describe('The investor investment focus, e.g., Seed Stage, Early Stage, Growth Stage.'),
  investmentStage: z.string().optional().describe('The investor investment stage, e.g., Pre-seed, Seed, Series A.'),
  investmentCriteria: z.string().optional().describe('Specific criteria the investor has for investments.'),
});
export type InvestorRiskAssessmentInput = z.infer<
  typeof InvestorRiskAssessmentInputSchema
>;

const InvestorRiskAssessmentOutputSchema = z.object({
  riskProfile: z
    .string()
    .describe('A summary of the investor risk profile based on the questionnaire, formatted in Markdown.'),
  investmentRecommendations: z
    .string()
    .describe(
      'Personalized startup investment recommendations based on the risk profile, formatted in Markdown.'
    ),
});
export type InvestorRiskAssessmentOutput = z.infer<
  typeof InvestorRiskAssessmentOutputSchema
>;

export async function investorRiskAssessment(
  input: InvestorRiskAssessmentInput
): Promise<InvestorRiskAssessmentOutput> {
  return investorRiskAssessmentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'investorRiskAssessmentPrompt',
  input: {schema: InvestorRiskAssessmentInputSchema},
  output: {schema: InvestorRiskAssessmentOutputSchema},
  prompt: `You are an expert financial analyst and AI investment advisor. Your task is to analyze the provided investor details and generate a comprehensive risk profile and a set of personalized startup investment recommendations.

Your response is for a professional audience (the Let'sVenture team) and MUST be formatted in clean, readable Markdown. The presentation quality is very important.

**Formatting Requirements (Strict):**
- Use headings (e.g., '### Risk Profile Summary') for each of the two sections.
- Use bullet points or numbered lists to present information clearly. Do NOT output dense paragraphs.
- Use **bold** or *italic* formatting to emphasize important keywords for quick reference. Do not bold entire sentences.
- Ensure the output is well-structured and professional.
- When mentioning financial figures, consider the local currency provided for the investment amount.
- Incorporate local and global regulatory compliance considerations in your analysis.

**Investor Details:**
- **Risk Appetite:** {{{riskAppetite}}}
- **Investment Philosophy:** {{{desiredReturns}}}
- **Preferred Sectors:** {{{investmentPreferences}}}
- **Investment Amount:** {{{investmentAmount}}}
- **Investment Horizon:** {{{investmentHorizon}}}
- **Country of Residence:** {{{country}}}
{{#if investmentFocus}}- **Investment Focus:** {{{investmentFocus}}}{{/if}}
{{#if investmentStage}}- **Investment Stage:** {{{investmentStage}}}{{/if}}
{{#if investmentCriteria}}- **Specific Investment Criteria:** {{{investmentCriteria}}}{{/if}}

**Your Task:**
Based *only* on the information above, generate the following two sections:
1.  A **Risk Profile Summary** in Markdown.
2.  A set of **Personalized Investment Recommendations** in Markdown.
`,
});

const investorRiskAssessmentFlow = ai.defineFlow(
  {
    name: 'investorRiskAssessmentFlow',
    inputSchema: InvestorRiskAssessmentInputSchema,
    outputSchema: InvestorRiskAssessmentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
