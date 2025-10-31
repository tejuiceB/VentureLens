'use server';

/**
 * @fileOverview Answers questions about analyzed startup documents using AI.
 *
 * - askDocumentQuestion - A function that answers questions about the analyzed documents.
 * - DocumentQAInput - The input type for the askDocumentQuestion function.
 * - DocumentQAOutput - The return type for the askDocumentQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FileDataSchema = z.object({
  name: z.string().describe('The name of the file.'),
  dataUri: z.string().describe("The file content as a data URI. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});

const DocumentQAInputSchema = z.object({
  files: z.array(FileDataSchema).describe('An array of analyzed files.'),
  investmentMemo: z.string().describe('The generated investment memo for context.'),
  question: z.string().describe('The user question about the documents.'),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).optional().describe('Previous conversation history for context.'),
});
export type DocumentQAInput = z.infer<typeof DocumentQAInputSchema>;

const DocumentQAOutputSchema = z.object({
  answer: z.string().describe("A detailed answer to the user's question, based on the analyzed documents and investment memo."),
  sources: z.array(z.string()).optional().describe("References to specific sections or files that support the answer."),
});
export type DocumentQAOutput = z.infer<typeof DocumentQAOutputSchema>;

const documentQAPrompt = ai.definePrompt({
  name: 'documentQAPrompt',
  input: { schema: DocumentQAInputSchema },
  output: { schema: DocumentQAOutputSchema },
  prompt: `You are an expert investment analyst assistant. Your role is to answer questions about the analyzed startup documents with precision and insight.

**Context - Investment Memo:**
{{{investmentMemo}}}

**Available Documents:**
{{#each files}}
---
File: {{{name}}}
Content:
{{media url=dataUri}}
---
{{/each}}

{{#if conversationHistory}}
**Previous Conversation:**
{{#each conversationHistory}}
**{{role}}:** {{{content}}}
{{/each}}
{{/if}}

**User Question:**
{{{question}}}

---

**Instructions:**
1. Answer the question based ONLY on the provided documents and investment memo
2. Be specific and cite relevant information from the documents
3. If the information isn't in the documents, clearly state that
4. Keep answers concise but comprehensive (2-4 paragraphs max)
5. Use professional investor language
6. If applicable, mention which document or section contains the information
7. For numerical questions, provide exact figures when available
8. Consider the investment context and provide actionable insights

Provide a detailed answer and list the sources (document names or memo sections) that support your answer.
`,
});

export async function askDocumentQuestion(
  input: DocumentQAInput
): Promise<DocumentQAOutput> {
  return documentQAFlow(input);
}

const documentQAFlow = ai.defineFlow(
  {
    name: 'documentQAFlow',
    inputSchema: DocumentQAInputSchema,
    outputSchema: DocumentQAOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await documentQAPrompt(input);
      if (!output) {
        throw new Error("The AI model returned a null response.");
      }
      return output;
    } catch (error: any) {
      console.error("Error in documentQAFlow:", error);
      throw new Error(`Failed to answer question. Original error: ${error.message}`);
    }
  }
);
