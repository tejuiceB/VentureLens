
'use server';
/**
 * @fileOverview Generates a compliance and data report for a startup.
 *
 * - generateComplianceReport - A function that handles the compliance report generation process.
 * - GenerateComplianceReportInput - The input type for the generateComplianceReport function.
 * - GenerateComplianceReportOutput - The return type for the generateComplianceReport function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateComplianceReportInputSchema = z.object({
  startupName: z.string().describe('The name of the startup.'),
  startupDescription: z.string().describe('The description of the startup.'),
  investorCountry: z.string().describe("The investor's country of residence."),
  investmentMemo: z.string().describe('The full investment memo generated in the previous step.'),
});
export type GenerateComplianceReportInput = z.infer<typeof GenerateComplianceReportInputSchema>;

const GenerateComplianceReportOutputSchema = z.object({
  complianceScore: z.number().describe('A score from 0-100 representing the startup compliance posture.'),
  report: z.string().describe('A detailed compliance and data report in Markdown format.'),
});
export type GenerateComplianceReportOutput = z.infer<typeof GenerateComplianceReportOutputSchema>;

export async function generateComplianceReport(
  input: GenerateComplianceReportInput
): Promise<GenerateComplianceReportOutput> {
  return generateComplianceReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateComplianceReportPrompt',
  input: { schema: GenerateComplianceReportInputSchema },
  output: { schema: GenerateComplianceReportOutputSchema },
  prompt: `You are a world-class legal and financial analyst specializing in global investment compliance. Your task is to generate a compliance and data report for a startup based on an investor's location and the provided investment memo.

**Investor's Country of Residence:** {{{investorCountry}}}
**Startup Name:** {{{startupName}}}
**Startup Description:** {{{startupDescription}}}

**Full Investment Memo:**
{{{investmentMemo}}}

---

**Your Tasks:**

1.  **Generate a Compliance Score (0-100):**
    *   Based on all the information, assess the startup's regulatory posture.
    *   Consider potential challenges related to the investor's country (e.g., cross-border investment laws, data privacy (GDPR, etc.), financial regulations, intellectual property protection).
    *   A higher score indicates a stronger, more straightforward compliance situation. A lower score indicates potential hurdles or red flags that require further due diligence.

2.  **Write a Detailed Compliance & Data Report (in Markdown):**
    *   **Introduction:** Briefly summarize the purpose of the report.
    *   **Compliance Score Rationale:** Explain *why* you assigned the score. Detail the specific factors, risks, and opportunities you considered.
    *   **Regulatory Analysis (Local & Global):** Analyze the key regulatory hurdles and advantages for an investor from {{{investorCountry}}} investing in this startup. Mention relevant regulations.
    *   **Critical Data Review:** Synthesize the most important data points from the investment memo. This is a review, not just a copy-paste.
        *   **Financials:** Summarize key financial metrics, funding ask, and use of funds.
        *   **Competitive Landscape:** Briefly analyze the main competitors and the startup's key differentiators.
        *   **Market:** Reiterate the market size and opportunity.
    *   **Actionable Recommendations:** Suggest concrete next steps for the investor regarding due diligence on the compliance front.

Your analysis must be sharp, professional, and directly useful for an investment decision.
`,
});

const generateComplianceReportFlow = ai.defineFlow(
  {
    name: 'generateComplianceReportFlow',
    inputSchema: GenerateComplianceReportInputSchema,
    outputSchema: GenerateComplianceReportOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
