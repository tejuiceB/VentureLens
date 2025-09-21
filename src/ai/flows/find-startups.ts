
'use server';

/**
 * @fileOverview Finds startups that match an investor's profile.
 *
 * - findStartups - A function that finds startups.
 * - FindStartupsInput - The input type for the findStartups function.
 * - FindStartupsOutput - The return type for the findStartups function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FindStartupsInputSchema = z.object({
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
export type FindStartupsInput = z.infer<typeof FindStartupsInputSchema>;


const FoundStartupSchema = z.object({
    name: z.string().describe('The name of the startup.'),
    description: z.string().describe('A one-sentence summary of what the startup does.'),
    sector: z.string().describe('The sector or industry of the startup.'),
    country: z.string().describe('The country where the startup is headquartered.'),
});
export type FoundStartup = z.infer<typeof FoundStartupSchema>;


const FindStartupsOutputSchema = z.object({
  startups: z.array(FoundStartupSchema).describe('An array of 5 to 10 matching startups.'),
});
export type FindStartupsOutput = z.infer<typeof FindStartupsOutputSchema>;


export async function findStartups(
  input: FindStartupsInput
): Promise<FindStartupsOutput> {
  return findStartupsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'findStartupsPrompt',
  input: {schema: FindStartupsInputSchema},
  output: {schema: FindStartupsOutputSchema},
  prompt: `You are an expert venture capital analyst with a deep knowledge of the global startup ecosystem. Your task is to identify real-world startups that are a strong match for the given investor profile.

Return a list of 5-10 real startup companies that fit the criteria below. For each startup, provide its name, a concise one-sentence description of what it does, its primary sector, and its headquarter country.

**Investor Profile:**
- **Risk Appetite:** {{{riskAppetite}}}
- **Investment Philosophy:** {{{desiredReturns}}}
- **Preferred Sectors:** {{{investmentPreferences}}}
- **Typical Investment Size:** {{{investmentAmount}}}
- **Investment Horizon:** {{{investmentHorizon}}}
- **Geographical Preferences:** {{{country}}}
{{#if investmentFocus}}- **Investment Focus:** {{{investmentFocus}}}{{/if}}
{{#if investmentStage}}- **Investment Stage:** {{{investmentStage}}}{{/if}}
{{#if investmentCriteria}}- **Specific Investment Criteria:** {{{investmentCriteria}}}{{/if}}

Based on the profile above, generate the list of matching startups.
`,
});

const findStartupsFlow = ai.defineFlow(
  {
    name: 'findStartupsFlow',
    inputSchema: FindStartupsInputSchema,
    outputSchema: FindStartupsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
