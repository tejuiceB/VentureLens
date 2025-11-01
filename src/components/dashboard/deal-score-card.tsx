import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, Target, TrendingUp, Users, Package, DollarSign, Lightbulb, AlertCircle } from "lucide-react";
import { useState } from "react";
import type { DealScoreOutput } from "@/ai/flows/deal-score";

interface DealScoreCardProps {
  dealScore: DealScoreOutput;
  startupName?: string;
}

export function DealScoreCard({ dealScore, startupName }: DealScoreCardProps) {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 55) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-600';
    if (score >= 70) return 'bg-blue-600';
    if (score >= 55) return 'bg-yellow-600';
    if (score >= 40) return 'bg-orange-600';
    return 'bg-red-600';
  };

  const getRecommendationColor = (recommendation: string) => {
    if (recommendation === 'Strong Invest') return 'bg-green-100 text-green-800 border-green-300';
    if (recommendation === 'Invest with Caution') return 'bg-blue-100 text-blue-800 border-blue-300';
    if (recommendation === 'Maybe - Needs More Diligence') return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    if (recommendation === 'Pass') return 'bg-orange-100 text-orange-800 border-orange-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  const getConfidenceColor = (confidence: string) => {
    if (confidence === 'High') return 'text-green-600';
    if (confidence === 'Medium') return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCategoryIcon = (category: string) => {
    if (category === 'Team') return Users;
    if (category === 'Market') return Target;
    if (category === 'Traction') return TrendingUp;
    if (category === 'Product') return Package;
    if (category === 'Financials') return DollarSign;
    return Lightbulb;
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({ ...prev, [category]: !prev[category] }));
  };

  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Deal Score Analysis
              {startupName && <Badge variant="outline">{startupName}</Badge>}
            </CardTitle>
            <CardDescription>
              Comprehensive investment evaluation across 5 categories
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Score Gauge */}
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div className="relative flex-shrink-0">
            <div className="w-40 h-40 rounded-full border-8 border-gray-200 flex items-center justify-center relative">
              <svg className="absolute inset-0 -rotate-90" viewBox="0 0 160 160">
                <circle
                  cx="80"
                  cy="80"
                  r="72"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeDasharray={`${(dealScore.overallScore / 100) * 452} 452`}
                  className={getScoreColor(dealScore.overallScore)}
                />
              </svg>
              <div className="text-center z-10">
                <div className={`text-4xl font-bold ${getScoreColor(dealScore.overallScore)}`}>
                  {dealScore.overallScore}
                </div>
                <div className="text-xs text-muted-foreground">out of 100</div>
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-4 w-full">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold">Recommendation</span>
                <Badge className={`px-3 py-1 font-bold border-2 ${getRecommendationColor(dealScore.recommendation)}`}>
                  {dealScore.recommendation}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">Confidence</span>
                <span className={`font-bold ${getConfidenceColor(dealScore.confidence)}`}>
                  {dealScore.confidence}
                </span>
              </div>
            </div>

            {/* Projections */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-muted/50 border">
                <div className="text-xs text-muted-foreground mb-1">Est. Return</div>
                <div className="text-lg font-bold">{dealScore.projections.estimatedReturnMultiple}</div>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 border">
                <div className="text-xs text-muted-foreground mb-1">Time to Exit</div>
                <div className="text-lg font-bold">{dealScore.projections.timeToExit}</div>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 border">
                <div className="text-xs text-muted-foreground mb-1">Success Rate</div>
                <div className="text-lg font-bold">{dealScore.projections.probabilityOfSuccess}</div>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 border">
                <div className="text-xs text-muted-foreground mb-1">Risk-Adj. IRR</div>
                <div className="text-lg font-bold">{dealScore.projections.riskAdjustedReturn}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Investment Thesis */}
        <div className="p-4 rounded-lg bg-primary/5 border-2 border-primary/20">
          <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Investment Thesis
          </h4>
          <p className="text-sm leading-relaxed whitespace-pre-line">{dealScore.investmentThesis}</p>
        </div>

        {/* Category Scores */}
        <div className="space-y-3">
          <h4 className="font-bold text-sm">Category Breakdown</h4>
          {dealScore.categoryScores.map((category) => {
            const Icon = getCategoryIcon(category.category);
            const isExpanded = expandedCategories[category.category];
            
            return (
              <Collapsible key={category.category} open={isExpanded} onOpenChange={() => toggleCategory(category.category)}>
                <Card className="border-2">
                  <CollapsibleTrigger className="w-full">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5 text-primary" />
                          <div className="text-left">
                            <CardTitle className="text-base">{category.category}</CardTitle>
                            <CardDescription className="text-xs">
                              Weight: {category.weight}% • Contributes {category.weightedScore.toFixed(1)} points
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className={`text-2xl font-bold ${getScoreColor(category.score)}`}>
                            {category.score}
                          </div>
                          {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                        </div>
                      </div>
                      <Progress value={category.score} className="h-2" />
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="pt-0 space-y-3">
                      <p className="text-sm text-muted-foreground">{category.reasoning}</p>
                      
                      {category.strengths.length > 0 && (
                        <div className="space-y-2">
                          <h5 className="font-semibold text-xs text-green-700">Strengths</h5>
                          <ul className="space-y-1">
                            {category.strengths.map((strength, idx) => (
                              <li key={idx} className="text-sm text-green-700 flex items-start gap-2">
                                <span className="text-green-500 mt-1">✓</span>
                                <span>{strength}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {category.concerns.length > 0 && (
                        <div className="space-y-2">
                          <h5 className="font-semibold text-xs text-red-700">Concerns</h5>
                          <ul className="space-y-1">
                            {category.concerns.map((concern, idx) => (
                              <li key={idx} className="text-sm text-red-700 flex items-start gap-2">
                                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                <span>{concern}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            );
          })}
        </div>

        {/* Key Strengths & Concerns */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-bold text-sm text-green-700">Top Strengths</h4>
            <ul className="space-y-2">
              {dealScore.keyStrengths.map((strength, idx) => (
                <li key={idx} className="text-sm p-3 rounded-lg bg-green-50 border border-green-200 text-green-800">
                  {strength}
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-bold text-sm text-red-700">Key Concerns</h4>
            <ul className="space-y-2">
              {dealScore.keyConcerns.map((concern, idx) => (
                <li key={idx} className="text-sm p-3 rounded-lg bg-red-50 border border-red-200 text-red-800">
                  {concern}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Next Steps */}
        {dealScore.nextSteps.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-bold text-sm">Recommended Next Steps</h4>
            <ol className="space-y-2">
              {dealScore.nextSteps.map((step, idx) => (
                <li key={idx} className="text-sm p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 flex gap-3">
                  <span className="font-bold text-blue-600">{idx + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
