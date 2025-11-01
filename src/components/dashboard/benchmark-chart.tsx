import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { SectorBenchmarkOutput } from "@/ai/flows/sector-benchmarking";

interface BenchmarkChartProps {
  benchmarkData: SectorBenchmarkOutput;
  startupName?: string;
}

export function BenchmarkChart({ benchmarkData, startupName }: BenchmarkChartProps) {
  const radarData = [
    { metric: 'ARR', percentile: benchmarkData.percentileRankings.arrPercentile ?? 0 },
    { metric: 'Growth', percentile: benchmarkData.percentileRankings.growthPercentile ?? 0 },
    { metric: 'Efficiency', percentile: benchmarkData.percentileRankings.efficiencyPercentile ?? 0 },
    { metric: 'Team Size', percentile: benchmarkData.percentileRankings.teamSizePercentile ?? 0 },
  ];

  const getVerdictColor = (verdict: string) => {
    if (verdict === 'Exceptional') return 'bg-green-100 text-green-800 border-green-300';
    if (verdict === 'Above Average') return 'bg-blue-100 text-blue-800 border-blue-300';
    if (verdict === 'Average') return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    if (verdict === 'Below Average') return 'bg-orange-100 text-orange-800 border-orange-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  const getPercentileIcon = (percentile: number | undefined) => {
    const p = percentile ?? 0;
    if (p >= 70) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (p >= 40) return <Minus className="h-4 w-4 text-yellow-600" />;
    return <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  const getPercentileColor = (percentile: number | undefined) => {
    const p = percentile ?? 0;
    if (p >= 70) return '#22c55e';
    if (p >= 40) return '#eab308';
    return '#ef4444';
  };

  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Sector Benchmarking
              {startupName && <Badge variant="outline">{startupName}</Badge>}
            </CardTitle>
            <CardDescription>
              Performance comparison against sector peers
            </CardDescription>
          </div>
          <Badge className={`px-4 py-2 text-sm font-bold border-2 ${getVerdictColor(benchmarkData.verdict)}`}>
            {benchmarkData.verdict}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary */}
        <div className="p-4 rounded-lg bg-muted/50 border">
          <p className="text-sm leading-relaxed">{benchmarkData.summary}</p>
        </div>

        {/* Radar Chart */}
        <div className="space-y-2">
          <h4 className="font-bold text-sm">Percentile Rankings</h4>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar 
                name="Percentile" 
                dataKey="percentile" 
                stroke="#2563eb" 
                fill="#3b82f6" 
                fillOpacity={0.6} 
              />
              <Tooltip 
                formatter={(value: number) => [`${value}th percentile`, 'Performance']}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Percentile Breakdown */}
        <div className="space-y-3">
          <h4 className="font-bold text-sm">Detailed Metrics</h4>
          <div className="grid gap-3">
            {radarData.map((item) => (
              <div key={item.metric} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  {getPercentileIcon(item.percentile)}
                  <span className="font-medium text-sm">{item.metric}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all" 
                      style={{ 
                        width: `${item.percentile}%`,
                        backgroundColor: getPercentileColor(item.percentile)
                      }}
                    ></div>
                  </div>
                  <span className="font-bold text-sm w-16 text-right">{item.percentile}th</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Strengths & Weaknesses */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Strengths */}
          {benchmarkData.comparison.strengths.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-bold text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                Strengths
              </h4>
              <div className="space-y-2">
                {benchmarkData.comparison.strengths.map((strength, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-green-50 border border-green-200">
                    <p className="text-sm text-green-800">{strength}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Weaknesses */}
          {benchmarkData.comparison.weaknesses.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-bold text-sm flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-red-600" />
                Weaknesses
              </h4>
              <div className="space-y-2">
                {benchmarkData.comparison.weaknesses.map((weakness, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-red-50 border border-red-200">
                    <p className="text-sm text-red-800">{weakness}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Outliers */}
        {benchmarkData.comparison.outliers.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-bold text-sm">Notable Outliers</h4>
            <div className="space-y-2">
              {benchmarkData.comparison.outliers.map((outlier, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-purple-50 border border-purple-200">
                  <p className="text-sm text-purple-800">{outlier}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Benchmark Data Table */}
        <div className="space-y-2">
          <h4 className="font-bold text-sm">Sector Averages</h4>
          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-semibold">Metric</th>
                  <th className="text-right p-3 font-semibold">Average</th>
                  <th className="text-right p-3 font-semibold">Median</th>
                  <th className="text-right p-3 font-semibold">Top Quartile</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="p-3">ARR</td>
                  <td className="p-3 text-right font-mono">${((benchmarkData.benchmarkData.avgARR ?? 0) / 1000000).toFixed(1)}M</td>
                  <td className="p-3 text-right font-mono">${((benchmarkData.benchmarkData.medianARR ?? 0) / 1000000).toFixed(1)}M</td>
                  <td className="p-3 text-right font-mono">${((benchmarkData.benchmarkData.topQuartileARR ?? 0) / 1000000).toFixed(1)}M</td>
                </tr>
                <tr className="border-t bg-muted/20">
                  <td className="p-3">Growth Rate</td>
                  <td className="p-3 text-right font-mono">{benchmarkData.benchmarkData.avgGrowthRate ?? 0}%</td>
                  <td className="p-3 text-right">-</td>
                  <td className="p-3 text-right">-</td>
                </tr>
                <tr className="border-t">
                  <td className="p-3">Burn Rate</td>
                  <td className="p-3 text-right font-mono">${((benchmarkData.benchmarkData.avgBurnRate ?? 0) / 1000).toFixed(0)}K</td>
                  <td className="p-3 text-right">-</td>
                  <td className="p-3 text-right">-</td>
                </tr>
                <tr className="border-t bg-muted/20">
                  <td className="p-3">Team Size</td>
                  <td className="p-3 text-right font-mono">{benchmarkData.benchmarkData.avgTeamSize ?? 0}</td>
                  <td className="p-3 text-right">-</td>
                  <td className="p-3 text-right">-</td>
                </tr>
                <tr className="border-t">
                  <td className="p-3">LTV:CAC Ratio</td>
                  <td className="p-3 text-right font-mono">{(benchmarkData.benchmarkData.avgLTVCACRatio ?? 0).toFixed(1)}x</td>
                  <td className="p-3 text-right">-</td>
                  <td className="p-3 text-right">-</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
