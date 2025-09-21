
'use server';

/**
 * @fileOverview A server-side flow to convert an HTML string into a DOCX file.
 *
 * - generateDocxReport - Converts HTML to a Base64 DOCX string.
 * - GenerateDocxReportInput - The input type for the flow.
 * - GenerateDocxReportOutput - The return type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import htmlToDocx from 'html-to-docx';

const GenerateDocxReportInputSchema = z.object({
  htmlContent: z.string().describe('The HTML content to convert to DOCX.'),
});
export type GenerateDocxReportInput = z.infer<typeof GenerateDocxReportInputSchema>;

const GenerateDocxReportOutputSchema = z.object({
  docxBase64: z.string().describe('The generated DOCX file as a Base64 encoded string.'),
});
export type GenerateDocxReportOutput = z.infer<typeof GenerateDocxReportOutputSchema>;


export async function generateDocxReport(
  input: GenerateDocxReportInput
): Promise<GenerateDocxReportOutput> {
  return generateDocxReportFlow(input);
}


const generateDocxReportFlow = ai.defineFlow(
  {
    name: 'generateDocxReportFlow',
    inputSchema: GenerateDocxReportInputSchema,
    outputSchema: GenerateDocxReportOutputSchema,
  },
  async ({ htmlContent }) => {
    
    const fileBuffer = await htmlToDocx(htmlContent, undefined, {
        table: { row: { cantSplit: true } },
        footer: true,
        pageNumber: true,
    });

    return {
      docxBase64: (fileBuffer as Buffer).toString('base64'),
    };
  }
);
