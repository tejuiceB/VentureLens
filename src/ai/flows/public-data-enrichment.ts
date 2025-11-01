'use server';

/**
 * @fileOverview Enriches startup analysis with public data from Google Search API, news, and web sources.
 * 
 * - enrichWithPublicData - Fetches and analyzes public information about a startup
 * - PublicDataInput - Input type for public data enrichment
 * - PublicDataOutput - Output type with enriched information
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { google } from 'googleapis';

const PublicDataInputSchema = z.object({
  startupName: z.string().describe("The name of the startup to research."),
  website: z.string().optional().describe("The startup's website URL if available."),
  sector: z.string().optional().describe("The sector/industry of the startup."),
  location: z.string().optional().describe("The startup's geographic location."),
});
export type PublicDataInput = z.infer<typeof PublicDataInputSchema>;

const PublicDataOutputSchema = z.object({
  newsArticles: z.array(z.object({
    title: z.string(),
    snippet: z.string(),
    link: z.string(),
    date: z.string().optional(),
    sentiment: z.enum(['positive', 'neutral', 'negative']).optional(),
  })).describe("Recent news articles about the startup."),
  fundingHistory: z.array(z.object({
    round: z.string(),
    amount: z.string(),
    date: z.string(),
    investors: z.array(z.string()).optional(),
  })).optional().describe("Known funding rounds from public sources."),
  competitorMentions: z.array(z.string()).optional().describe("Competitors mentioned in public sources."),
  marketPresence: z.object({
    linkedInFollowers: z.number().optional(),
    glassdoorRating: z.number().optional(),
    newsVolume: z.number().describe("Number of recent news mentions."),
  }).describe("Market presence indicators."),
  riskIndicators: z.array(z.string()).describe("Potential concerns found in public data."),
  summary: z.string().describe("AI-generated summary of public data findings."),
});
export type PublicDataOutput = z.infer<typeof PublicDataOutputSchema>;

/**
 * Google Custom Search API integration
 */
async function searchGoogleNews(query: string, numResults: number = 10): Promise<any[]> {
  try {
    const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;
    const apiKey = process.env.GOOGLE_SEARCH_API_KEY || process.env.GEMINI_API_KEY;

    if (!searchEngineId || !apiKey) {
      console.warn('Google Search API credentials not configured. Returning mock data.');
      return [
        {
          title: `${query} - Recent News`,
          snippet: 'Mock news article for demonstration purposes.',
          link: 'https://example.com/news',
          date: new Date().toISOString(),
        }
      ];
    }

    const customsearch = google.customsearch('v1');
    const response = await customsearch.cse.list({
      auth: apiKey,
      cx: searchEngineId,
      q: query,
      num: numResults,
      dateRestrict: 'y1', // Last year
      sort: 'date', // Most recent first
    });

    return response.data.items || [];
  } catch (error: any) {
    console.error('Google Search API error:', error.message);
    // Return empty array instead of failing
    return [];
  }
}

const publicDataEnrichmentPrompt = ai.definePrompt({
  name: 'publicDataEnrichmentPrompt',
  input: { 
    schema: z.object({
      startupName: z.string(),
      sector: z.string().optional(),
      searchResults: z.array(z.object({
        title: z.string(),
        snippet: z.string(),
        link: z.string(),
      })),
    })
  },
  output: { schema: PublicDataOutputSchema },
  prompt: `You are an AI analyst researching a startup using public data sources.

**Startup:** {{{startupName}}}
{{#if sector}}**Sector:** {{{sector}}}{{/if}}

**Public Search Results:**
{{#each searchResults}}
---
**Title:** {{{title}}}
**Snippet:** {{{snippet}}}
**Source:** {{{link}}}
---
{{/each}}

**Instructions:**
1. Analyze the search results to extract key information about the startup
2. Identify funding announcements, news coverage, and market sentiment
3. Look for mentions of competitors or market positioning
4. Flag any risk indicators like:
   - Negative news (lawsuits, layoffs, controversies)
   - Inconsistent information across sources
   - Signs of financial distress
   - Leadership changes or founder departures
5. Assess market presence based on news volume and quality
6. Provide a concise summary of public perception

**Output Requirements:**
- Extract all funding rounds mentioned with dates and amounts
- Identify sentiment of each news article (positive/neutral/negative)
- List any competitors mentioned
- Calculate news volume (total articles found)
- Flag risk indicators with specific concerns
- Write a 2-3 paragraph summary of findings

Be objective and base conclusions only on the provided search results.
`,
});

export async function enrichWithPublicData(
  input: PublicDataInput
): Promise<PublicDataOutput> {
  return publicDataEnrichmentFlow(input);
}

const publicDataEnrichmentFlow = ai.defineFlow(
  {
    name: 'publicDataEnrichmentFlow',
    inputSchema: PublicDataInputSchema,
    outputSchema: PublicDataOutputSchema,
  },
  async (input) => {
    try {
      // Fetch news and public information
      const newsQuery = `"${input.startupName}" ${input.sector || ''} startup funding news`;
      const searchResults = await searchGoogleNews(newsQuery, 10);

      // Format search results for prompt
      const formattedResults = searchResults.map(item => ({
        title: item.title || '',
        snippet: item.snippet || '',
        link: item.link || '',
      }));

      // If no results, return basic structure
      if (formattedResults.length === 0) {
        return {
          newsArticles: [],
          marketPresence: {
            newsVolume: 0,
          },
          riskIndicators: ['Limited public information available - requires additional due diligence'],
          summary: `Limited public data found for ${input.startupName}. This could indicate an early-stage company with minimal media presence or a company operating in stealth mode. Additional verification through direct sources is recommended.`,
        };
      }

      // Use Gemini to analyze and structure the data
      const { output } = await publicDataEnrichmentPrompt({
        startupName: input.startupName,
        sector: input.sector,
        searchResults: formattedResults,
      });

      if (!output) {
        throw new Error("AI model returned null response during public data enrichment.");
      }

      return output;
    } catch (error: any) {
      console.error("Error in publicDataEnrichmentFlow:", error);
      
      // Graceful fallback
      return {
        newsArticles: [],
        marketPresence: {
          newsVolume: 0,
        },
        riskIndicators: [`Error fetching public data: ${error.message}. Manual research recommended.`],
        summary: `Unable to complete automated public data enrichment for ${input.startupName}. Error: ${error.message}. Please conduct manual research to verify startup information.`,
      };
    }
  }
);
