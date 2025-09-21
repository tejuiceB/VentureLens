"use client";

import { useState } from "react";
import { FoundStartup } from "@/ai/flows/find-startups";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, TrendingUp } from "lucide-react";
import Image from "next/image";
import { matchStartup, MatchStartupOutput } from "@/ai/flows/personalized-startup-matching";
import { InvestorProfile } from "./profiler";
import { Badge } from "@/components/ui/badge";

interface StartupListProps {
  startups: FoundStartup[];
  investorProfile: InvestorProfile | null;
}

interface MatchResult extends MatchStartupOutput {
  startupId: string;
}

export function StartupList({ startups, investorProfile }: StartupListProps) {
  const [matchResults, setMatchResults] = useState<Record<string, MatchResult | null>>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleMatch = async (startup: FoundStartup) => {
    if (!investorProfile?.generatedProfile) {
      console.error("Please generate your investor profile first.");
      return;
    }
    setLoadingId(startup.name);
    setMatchResults(prev => ({ ...prev, [startup.name]: null }));

    try {
      const result = await matchStartup({
        riskAppetite: investorProfile.riskAppetite,
        desiredReturns: investorProfile.desiredReturns,
        investmentPreferences: investorProfile.investmentPreferences,
        country: investorProfile.country,
        startupProfile: `Name: ${startup.name}, Description: ${startup.description}, Sector: ${startup.sector}, Country: ${startup.country}`,
      });
      setMatchResults(prev => ({ ...prev, [startup.name]: { ...result, startupId: startup.name } }));
    } catch (error) {
      console.error("Error matching startup:", error);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {startups.map((startup) => {
        const result = matchResults[startup.name];
        return (
          <Card key={startup.name} className="bg-card border-border/60 flex flex-col">
            <CardHeader>
                <CardTitle className="font-headline text-xl">{startup.name}</CardTitle>
                <div className="flex gap-2 pt-1">
                  <Badge variant="secondary">{startup.sector}</Badge>
                  <Badge variant="outline">{startup.country}</Badge>
                </div>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col">
              <p className="text-sm text-muted-foreground flex-grow">{startup.description}</p>
              
              {result && (
                <div className="mt-4 space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                     <div className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        <span className="text-sm font-semibold">Match Score</span>
                     </div>
                     <span className="font-bold text-lg text-primary">{result.matchScore}%</span>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <h4 className="font-semibold text-sm mb-1">Reasoning</h4>
                    <p className="text-xs text-muted-foreground">{result.reasoning}</p>
                  </div>
                </div>
              )}
            </CardContent>
            <div className="p-6 pt-0">
              <Button onClick={() => handleMatch(startup)} disabled={!investorProfile?.generatedProfile || loadingId === startup.name} className="w-full">
                {loadingId === startup.name ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {result ? 'Rematch' : 'Check Match'}
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
