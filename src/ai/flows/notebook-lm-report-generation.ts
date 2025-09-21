
'use server';

/**
 * @fileOverview Generates reports from multiple startup documents using an AI model.
 *
 * - generateNotebookLmReport - A function that handles the report generation process.
 * - NotebookLmReportInput - The input type for the generateNotebookLm-report-generation function.
 * - NotebookLmReportOutput - The return type for the generateNotebookLm-report-generation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FileDataSchema = z.object({
  name: z.string().describe('The name of the file.'),
  dataUri: z.string().describe("The file content as a data URI. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});

const NotebookLmReportInputSchema = z.object({
  files: z.array(FileDataSchema).describe('An array of files to be analyzed.'),
  investorCriteria: z
    .string()
    .describe(
      'The investor’s personalized investment criteria, risk profile, and desired returns.'
    ),
  founderInput: z.string().optional().describe('Direct input or answers from the founder.'),
  startupComparison: z.array(z.string()).optional().describe('An optional list of startup names (from the matching tool) to compare the uploaded documents against.'),
});
export type NotebookLmReportInput = z.infer<typeof NotebookLmReportInputSchema>;

const NotebookLmReportOutputSchema = z.object({
  investmentMemo: z.string().describe("A detailed investment memo in Markdown format, including sections for executive summary, problem/solution, team, market, competition, KPIs, risks, funding ask, and recommendation."),
});
export type NotebookLmReportOutput = z.infer<typeof NotebookLmReportOutputSchema>;

const reportGenerationPrompt = ai.definePrompt({
  name: 'reportGenerationPrompt',
  input: { schema: NotebookLmReportInputSchema },
  output: { schema: NotebookLmReportOutputSchema },
  prompt: `You are an expert investment analyst. Your task is to produce a comprehensive investment memo based on the provided documents.

1.  **Parse all available inputs**: uploaded documents, founder notes, and investor criteria. If some of the documents are unreadable or corrupt, you MUST ignore them and proceed with the analysis based on the valid information. Do not fail the entire process.
2.  **Extract structured data** and simulate enriching it with publicly available data. **If you use any external data, you MUST cite your source inline (e.g., "[Source: TechCrunch, 2023]").**
3.  **Evaluate the investment thesis** based on the data, analyzing the Founder & Team, Market Size, Competition, KPIs, and Differentiation.
4.  **Reweight the analysis** based on the provided investor preferences: {{{investorCriteria}}}.
5.  **Produce an Investment Memo**: A detailed memo in Markdown format. It MUST include these exact headings: '### Executive Summary', '### Problem & Solution', '### Founder & Team', '### Market Opportunity', '### Competition & Differentiation', '### KPIs & Traction', '### Risks', '### Funding Ask & Use of Funds', and '### Recommendation'. The recommendation must be weighted and justified based on the investor's preferences.

**Analyze the following documents, founder notes, and investor preferences:**
- **Investor Preferences**: {{{investorCriteria}}}
- **Founder Input (if any)**: {{#if founderInput}}{{{founderInput}}}{{else}}N/A{{/if}}
- **Startup Documents**:
{{#each files}}
---
File: {{{name}}}
Content:
{{media url=dataUri}}
---
{{/each}}

{{#if startupComparison}}
**Comparative Analysis Request**:
Compare the primary startup against these companies: {{#each startupComparison}}{{#if @index}}, {{/if}}{{{this}}}{{/each}}. Integrate this comparison into the 'Competition & Differentiation' and 'Recommendation' sections of the investment memo.
{{/if}}

Now, execute the workflow and generate the final investment memo.
`,
});


export async function generateNotebookLmReport(
  input: NotebookLmReportInput
): Promise<NotebookLmReportOutput> {
  return notebookLmReportFlow(input);
}


const notebookLmReportFlow = ai.defineFlow(
  {
    name: 'notebookLmReportFlow',
    inputSchema: NotebookLmReportInputSchema,
    outputSchema: NotebookLmReportOutputSchema,
  },
  async (input) => {
    const { output } = await reportGenerationPrompt(input);

    if (!output?.investmentMemo) {
      throw new Error("The AI model returned an empty or invalid response. This may be due to the content of the uploaded documents or a temporary model issue.");
    }
    
    return output;
  }
);
