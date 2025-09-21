'use server';

/**
 * @fileOverview An AI agent that matches investors with startup companies based on their risk profile and investment preferences.
 *
 * - matchStartup - A function that handles the startup matching process.
 * - MatchStartupInput - The input type for the matchStartup function.
 * - MatchStartupOutput - The return type for the matchStartup function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MatchStartupInputSchema = z.object({
  riskAppetite: z
    .string()
    .describe("The investor's risk appetite (e.g., 'low', 'medium', 'high')."),
  desiredReturns: z
    .string()
    .describe("The investor's desired returns (e.g., 'conservative', 'moderate', 'aggressive')."),
  investmentPreferences: z
    .string()
    .describe("The investor's investment preferences (e.g., sectors, industries). Should be a comma separated string."),
  startupProfile: z.string().describe('Profile of the startup as a string.'),
  country: z
    .string()
    .describe('The country of residence of the investor.'),
});
export type MatchStartupInput = z.infer<typeof MatchStartupInputSchema>;

const MatchStartupOutputSchema = z.object({
  matchScore: z
    .number()
    .describe(
      'A score indicating how well the startup matches the investor (0-100).'
    ),
  reasoning: z
    .string()
    .describe('Explanation of why the startup matches the investor.'),
  suitabilityFactors: z
    .string()
    .describe('Key suitability factors for the investor and startup match.'),
});
export type MatchStartupOutput = z.infer<typeof MatchStartupOutputSchema>;

export async function matchStartup(input: MatchStartupInput): Promise<MatchStartupOutput> {
  return matchStartupFlow(input);
}

const prompt = ai.definePrompt({
  name: 'matchStartupPrompt',
  input: {schema: MatchStartupInputSchema},
  output: {schema: MatchStartupOutputSchema},
  prompt: `You are an expert investment advisor.  Your job is to evaluate how good of a match
a startup is for an investor.

Here is information about the investor's profile:
Risk Appetite: {{{riskAppetite}}}
Desired Returns: {{{desiredReturns}}}
Investment Preferences: {{{investmentPreferences}}}
Country of Residence: {{{country}}}

Here is information about the startup:
{{{startupProfile}}}

Based on the above information, determine a match score (0-100) and explain your reasoning.  Also, list the key suitability factors.

Remember that investment preferences is a comma separated list.

Make sure that the matchScore, reasoning, and suitabilityFactors are all populated.

Consider both local (based on the investor's country of residence) and global jurisdictions. Regulatory compliance and compliance score must be according to local and global jurisdictions.

Investors may have specific preferences for certain countries depending on their risk taking ability of those countries. It must be suitable for local and global investors.

Ensure that the analysis of startup companies include companies from all countries and all industries or all sectors

`,
});

const matchStartupFlow = ai.defineFlow(
  {
    name: 'matchStartupFlow',
    inputSchema: MatchStartupInputSchema,
    outputSchema: MatchStartupOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
