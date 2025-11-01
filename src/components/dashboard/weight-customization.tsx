import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, RotateCcw } from "lucide-react";

interface WeightCustomizationProps {
  weights: {
    team: number;
    market: number;
    traction: number;
    product: number;
    financials: number;
  };
  onWeightsChange: (weights: {
    team: number;
    market: number;
    traction: number;
    product: number;
    financials: number;
  }) => void;
  onRecalculate: () => void;
  isRecalculating?: boolean;
}

const DEFAULT_WEIGHTS = {
  team: 25,
  market: 20,
  traction: 25,
  product: 15,
  financials: 15,
};

export function WeightCustomization({ 
  weights, 
  onWeightsChange, 
  onRecalculate,
  isRecalculating = false 
}: WeightCustomizationProps) {
  const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
  const isValid = totalWeight === 100;

  const handleWeightChange = (category: keyof typeof weights, value: number[]) => {
    onWeightsChange({
      ...weights,
      [category]: value[0],
    });
  };

  const handleReset = () => {
    onWeightsChange(DEFAULT_WEIGHTS);
  };

  const getWeightColor = (weight: number) => {
    if (weight >= 30) return 'text-blue-600';
    if (weight >= 20) return 'text-green-600';
    if (weight >= 10) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const categories = [
    { key: 'team' as const, label: 'Team', description: 'Founder experience & team strength' },
    { key: 'market' as const, label: 'Market', description: 'Market size & growth potential' },
    { key: 'traction' as const, label: 'Traction', description: 'Revenue & customer metrics' },
    { key: 'product' as const, label: 'Product', description: 'Product differentiation & moat' },
    { key: 'financials' as const, label: 'Financials', description: 'Unit economics & runway' },
  ];

  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Customize Investment Criteria</CardTitle>
            <CardDescription>
              Adjust category weights to match your investment philosophy
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleReset}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Weight Validation Alert */}
        <div className={`p-4 rounded-lg border-2 ${
          isValid 
            ? 'bg-green-50 border-green-300' 
            : 'bg-yellow-50 border-yellow-300'
        }`}>
          <div className="flex items-start gap-3">
            <AlertCircle className={`h-5 w-5 mt-0.5 ${
              isValid ? 'text-green-600' : 'text-yellow-600'
            }`} />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className={`font-bold text-sm ${
                  isValid ? 'text-green-900' : 'text-yellow-900'
                }`}>
                  Total Weight: {totalWeight}%
                </span>
                <Badge variant={isValid ? "default" : "outline"} className={
                  isValid 
                    ? 'bg-green-600' 
                    : 'border-yellow-600 text-yellow-800'
                }>
                  {isValid ? 'Valid' : 'Must equal 100%'}
                </Badge>
              </div>
              <p className={`text-xs ${
                isValid ? 'text-green-700' : 'text-yellow-700'
              }`}>
                {isValid 
                  ? 'Weights are properly configured. Click "Recalculate Score" to apply changes.' 
                  : 'Adjust sliders so the total equals exactly 100%.'}
              </p>
            </div>
          </div>
        </div>

        {/* Weight Sliders */}
        <div className="space-y-6">
          {categories.map((category) => {
            const weight = weights[category.key];
            return (
              <div key={category.key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Label className="font-semibold">{category.label}</Label>
                    <p className="text-xs text-muted-foreground">{category.description}</p>
                  </div>
                  <div className={`text-2xl font-bold min-w-[80px] text-right ${getWeightColor(weight)}`}>
                    {weight}%
                  </div>
                </div>
                <Slider
                  value={[weight]}
                  onValueChange={(value) => handleWeightChange(category.key, value)}
                  min={0}
                  max={50}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0%</span>
                  <span>25%</span>
                  <span>50%</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Weight Distribution Visualization */}
        <div className="space-y-2">
          <Label className="font-semibold">Weight Distribution</Label>
          <div className="flex h-8 rounded-lg overflow-hidden border-2">
            {categories.map((category) => {
              const weight = weights[category.key];
              if (weight === 0) return null;
              
              return (
                <div
                  key={category.key}
                  className="relative group transition-all hover:opacity-80"
                  style={{ 
                    width: `${weight}%`,
                    backgroundColor: 
                      category.key === 'team' ? '#3b82f6' :
                      category.key === 'market' ? '#10b981' :
                      category.key === 'traction' ? '#8b5cf6' :
                      category.key === 'product' ? '#f59e0b' :
                      '#ef4444'
                  }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    {weight >= 10 && (
                      <span className="text-xs font-bold text-white">
                        {weight}%
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                    <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                      {category.label}: {weight}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-3 text-xs">
            {categories.map((category) => (
              <div key={category.key} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded"
                  style={{ 
                    backgroundColor: 
                      category.key === 'team' ? '#3b82f6' :
                      category.key === 'market' ? '#10b981' :
                      category.key === 'traction' ? '#8b5cf6' :
                      category.key === 'product' ? '#f59e0b' :
                      '#ef4444'
                  }}
                ></div>
                <span className="text-muted-foreground">{category.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recalculate Button */}
        <Button 
          onClick={onRecalculate} 
          disabled={!isValid || isRecalculating}
          className="w-full"
          size="lg"
        >
          {isRecalculating ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              Recalculating...
            </>
          ) : (
            'Recalculate Deal Score'
          )}
        </Button>

        {/* Info Box */}
        <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
          <p className="text-xs text-blue-800 leading-relaxed">
            <strong>💡 Pro Tip:</strong> Adjust weights to reflect your investment strategy. 
            For example, early-stage investors may prioritize Team (35%) and Market (30%), 
            while growth-stage investors may emphasize Traction (35%) and Financials (25%).
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
