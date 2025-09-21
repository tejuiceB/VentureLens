
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
  audioSummary: z.string().describe("A concise script for a 2-3 minute audio overview, summarizing the key points of the investment memo. It should be engaging and easy to understand for a busy investor."),
  flashcards: z.string().describe("A set of 5-10 flashcards in Markdown format. Each flashcard should have a 'Term' and a 'Definition' on a new line. For example: 'Term: ARR\nDefinition: Annual Recurring Revenue.'"),
});
export type NotebookLmReportOutput = z.infer<typeof NotebookLmReportOutputSchema>;

const reportGenerationPrompt = ai.definePrompt({
  name: 'reportGenerationPrompt',
  input: { schema: NotebookLmReportInputSchema },
  output: { schema: NotebookLmReportOutputSchema },
  prompt: `You are an expert investment analyst. Your task is to produce a comprehensive investment memo, an audio summary script, and a set of flashcards based on the provided documents.

**Investor Preferences**: {{{investorCriteria}}}
**Founder Input (if any)**: {{#if founderInput}}{{{founderInput}}}{{else}}N/A{{/if}}
**Startup Documents**:
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

---

**YOUR TASKS:**

1.  **Produce an Investment Memo**: A detailed memo in Markdown format. It MUST include these exact headings: '### Executive Summary', '### Problem & Solution', '### Founder & Team', '### Market Opportunity', '### Competition & Differentiation', '### KPIs & Traction', '### Risks', '### Funding Ask & Use of Funds', and '### Recommendation'. The recommendation must be weighted and justified based on the investor's preferences.
2.  **Create an Audio Summary Script**: Write a script for a 2-3 minute audio overview. This should be a compelling summary of the entire investment memo, hitting the most critical points an investor needs to hear. The tone should be professional and engaging.
3.  **Generate Flashcards**: Create a set of 5 to 10 flashcards in Markdown format. Each flashcard must define a key term, metric, or concept found in the documents. Use the format: 'Term: [Term Name]\\nDefinition: [The definition]'.

Execute the workflow and generate all three outputs. If some of the documents are unreadable or corrupt, you MUST ignore them and proceed with the analysis based on the valid information. Do not fail the entire process.
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
    try {
      const { output } = await reportGenerationPrompt(input);
      if (!output) {
        throw new Error("The AI model returned a null response.");
      }
      return output;
    } catch (error: any) {
      console.error("Error in notebookLmReportFlow:", error);
      throw new Error(`Failed to generate analysis. The model may have failed to return a valid response. Original error: ${error.message}`);
    }
  }
);

