import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, AlertTriangle, CheckCircle2, TrendingDown, TrendingUp } from "lucide-react";
import type { RiskDetectionOutput } from "@/ai/flows/risk-detection";

interface RiskFlagsPanelProps {
  riskAnalysis: RiskDetectionOutput;
  startupName?: string;
}

export function RiskFlagsPanel({ riskAnalysis, startupName }: RiskFlagsPanelProps) {
  const getRiskColor = (level: string) => {
    switch(level) {
      case 'Critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'High': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'Medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Low': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'Minimal': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRiskIcon = (level: string) => {
    if (level === 'Critical' || level === 'High') return AlertCircle;
    if (level === 'Medium') return AlertTriangle;
    return CheckCircle2;
  };

  const RiskIcon = getRiskIcon(riskAnalysis.riskLevel);

  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <RiskIcon className="h-5 w-5" />
              Risk Analysis
              {startupName && <Badge variant="outline">{startupName}</Badge>}
            </CardTitle>
            <CardDescription>
              Automated risk detection across 8 categories
            </CardDescription>
          </div>
          <div className={`px-4 py-2 rounded-lg border-2 ${getRiskColor(riskAnalysis.riskLevel)}`}>
            <div className="text-xs font-semibold mb-1">Risk Score</div>
            <div className="text-2xl font-bold">{riskAnalysis.overallRiskScore}/100</div>
            <div className="text-xs font-medium mt-1">{riskAnalysis.riskLevel} Risk</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Executive Summary */}
        <Alert className="bg-muted/50">
          <AlertDescription className="text-sm leading-relaxed">
            {riskAnalysis.summary}
          </AlertDescription>
        </Alert>

        {/* Recommendation */}
        <div className="p-4 rounded-lg bg-primary/5 border-2 border-primary/20">
          <div className="flex items-start gap-3">
            <div className="mt-1">
              {riskAnalysis.recommendation === 'Strong Candidate' ? (
                <TrendingUp className="h-5 w-5 text-green-600" />
              ) : riskAnalysis.recommendation === 'Pass' ? (
                <TrendingDown className="h-5 w-5 text-red-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              )}
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-sm mb-1">Investment Recommendation</h4>
              <p className="text-lg font-semibold text-primary">{riskAnalysis.recommendation}</p>
            </div>
          </div>
        </div>

        {/* Red Flags */}
        {riskAnalysis.redFlags.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-bold text-sm flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-full bg-red-500"></span>
              Critical Issues ({riskAnalysis.redFlags.length})
            </h4>
            <div className="space-y-3">
              {riskAnalysis.redFlags.map((flag, idx) => (
                <div key={idx} className="p-4 rounded-lg bg-red-50 border-2 border-red-200">
                  <div className="flex items-start justify-between mb-2">
                    <h5 className="font-bold text-sm text-red-900">{flag.flag}</h5>
                    <Badge variant="outline" className="text-xs border-red-300 text-red-700">
                      {flag.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-red-800 mb-3">{flag.evidence}</p>
                  <div className="pt-3 border-t border-red-200">
                    <p className="text-xs font-semibold text-red-700 mb-1">Recommendation:</p>
                    <p className="text-xs text-red-700">{flag.recommendation}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Yellow Flags */}
        {riskAnalysis.yellowFlags.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-bold text-sm flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-full bg-yellow-500"></span>
              Areas of Concern ({riskAnalysis.yellowFlags.length})
            </h4>
            <div className="space-y-3">
              {riskAnalysis.yellowFlags.map((flag, idx) => (
                <div key={idx} className="p-4 rounded-lg bg-yellow-50 border-2 border-yellow-200">
                  <div className="flex items-start justify-between mb-2">
                    <h5 className="font-bold text-sm text-yellow-900">{flag.flag}</h5>
                    <Badge variant="outline" className="text-xs border-yellow-300 text-yellow-700">
                      {flag.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-yellow-800 mb-3">{flag.evidence}</p>
                  <div className="pt-3 border-t border-yellow-200">
                    <p className="text-xs font-semibold text-yellow-700 mb-1">Recommendation:</p>
                    <p className="text-xs text-yellow-700">{flag.recommendation}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Green Flags */}
        {riskAnalysis.greenFlags.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-bold text-sm flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-full bg-green-500"></span>
              Positive Indicators ({riskAnalysis.greenFlags.length})
            </h4>
            <div className="space-y-3">
              {riskAnalysis.greenFlags.map((flag, idx) => (
                <div key={idx} className="p-4 rounded-lg bg-green-50 border-2 border-green-200">
                  <div className="flex items-start justify-between mb-2">
                    <h5 className="font-bold text-sm text-green-900">{flag.flag}</h5>
                    <Badge variant="outline" className="text-xs border-green-300 text-green-700">
                      {flag.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-green-800">{flag.evidence}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
