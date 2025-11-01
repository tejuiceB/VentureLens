import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Calendar, TrendingUp, Users, AlertTriangle, Newspaper } from "lucide-react";
import type { PublicDataOutput } from "@/ai/flows/public-data-enrichment";

interface PublicDataTimelineProps {
  publicData: PublicDataOutput;
  startupName?: string;
}

export function PublicDataTimeline({ publicData, startupName }: PublicDataTimelineProps) {
  const getSentimentColor = (sentiment?: string) => {
    if (sentiment === 'positive') return 'bg-green-100 text-green-800 border-green-300';
    if (sentiment === 'negative') return 'bg-red-100 text-red-800 border-red-300';
    return 'bg-yellow-100 text-yellow-800 border-yellow-300';
  };

  const getSentimentIcon = (sentiment?: string) => {
    if (sentiment === 'positive') return '✓';
    if (sentiment === 'negative') return '✗';
    return '−';
  };

  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Public Data Intelligence
              {startupName && <Badge variant="outline">{startupName}</Badge>}
            </CardTitle>
            <CardDescription>
              News, funding events, and market presence from public sources
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary */}
        <div className="p-4 rounded-lg bg-muted/50 border">
          <p className="text-sm leading-relaxed">{publicData.summary}</p>
        </div>

        {/* Market Presence Overview */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-blue-50 border-2 border-blue-200 text-center">
            <div className="text-2xl font-bold text-blue-700">{publicData.marketPresence.newsVolume}</div>
            <div className="text-xs text-blue-600 mt-1">News Articles</div>
          </div>
          <div className="p-4 rounded-lg bg-purple-50 border-2 border-purple-200 text-center">
            <div className="text-2xl font-bold text-purple-700">
              {(publicData.marketPresence.linkedInFollowers ?? 0).toLocaleString()}
            </div>
            <div className="text-xs text-purple-600 mt-1">LinkedIn Followers</div>
          </div>
          <div className="p-4 rounded-lg bg-orange-50 border-2 border-orange-200 text-center">
            <div className="text-2xl font-bold text-orange-700">{publicData.marketPresence.glassdoorRating}</div>
            <div className="text-xs text-orange-600 mt-1">Glassdoor Rating</div>
          </div>
        </div>

        {/* Risk Indicators */}
        {publicData.riskIndicators.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-bold text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              Risk Indicators ({publicData.riskIndicators.length})
            </h4>
            <div className="grid gap-2">
              {publicData.riskIndicators.map((indicator, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-red-50 border-2 border-red-200">
                  <p className="text-sm font-semibold text-red-800">{indicator}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Funding History Timeline */}
        {publicData.fundingHistory && publicData.fundingHistory.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-bold text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              Funding History ({publicData.fundingHistory.length})
            </h4>
            <div className="relative border-l-2 border-green-300 ml-2 space-y-4">
              {publicData.fundingHistory.map((event, idx) => (
                <div key={idx} className="relative pl-6 pb-4">
                  <div className="absolute -left-2.5 top-1 w-4 h-4 rounded-full bg-green-500 border-2 border-white"></div>
                  <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-bold text-sm text-green-900">{event.round}</p>
                        <p className="text-xs text-green-700 mt-1">{event.amount}</p>
                        {event.investors && event.investors.length > 0 && (
                          <p className="text-xs text-green-600 mt-1">Investors: {event.investors.join(', ')}</p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Calendar className="h-4 w-4 text-green-600" />
                        <span className="text-xs text-green-600">{event.date}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Competitor Mentions */}
        {publicData.competitorMentions && publicData.competitorMentions.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-bold text-sm flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-600" />
              Competitors Identified ({publicData.competitorMentions.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {publicData.competitorMentions.map((competitor, idx) => (
                <Badge key={idx} variant="outline" className="px-3 py-1 text-sm border-purple-300 text-purple-700">
                  {competitor}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* News Articles Timeline */}
        {publicData.newsArticles.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-bold text-sm flex items-center gap-2">
              <Newspaper className="h-4 w-4 text-blue-600" />
              Recent News Coverage ({publicData.newsArticles.length})
            </h4>
            <div className="space-y-3">
              {publicData.newsArticles.map((article, idx) => (
                <div key={idx} className="p-4 rounded-lg border-2 bg-white hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <h5 className="font-bold text-sm text-gray-900 flex-1">{article.title}</h5>
                    <Badge className={`ml-2 border-2 ${getSentimentColor(article.sentiment)}`}>
                      {getSentimentIcon(article.sentiment)} {article.sentiment}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3 leading-relaxed">{article.snippet}</p>
                  {article.link && (
                    <a 
                      href={article.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Read full article
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {publicData.newsArticles.length === 0 && 
         (!publicData.fundingHistory || publicData.fundingHistory.length === 0) && 
         (!publicData.competitorMentions || publicData.competitorMentions.length === 0) && 
         publicData.riskIndicators.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            <Newspaper className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No public data available</p>
            <p className="text-xs mt-1">This could indicate limited market presence or API configuration needed</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
