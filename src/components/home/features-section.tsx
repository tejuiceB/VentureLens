import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCheck, Target, FileScan, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

const features = [
  {
    icon: UserCheck,
    title: 'Investor Risk Profiler',
    description: 'AI-powered tool to analyze your risk appetite, desired returns, and investment preferences through a short questionnaire.',
  },
  {
    icon: Target,
    title: 'Personalized Startup Matching',
    description: 'Our AI analyzes startups across all countries and sectors to match you with opportunities aligned with your unique profile.',
  },
  {
    icon: FileScan,
    title: 'Startup Pitch Deck Analyzer',
    description: 'Evaluate pitch decks based on your personalized criteria, instantly highlighting potential risks and opportunities.',
  },
  {
    icon: ShieldCheck,
    title: 'Global Compliance',
    description: 'Navigate complex legal environments with AI-generated compliance scores for startups across jurisdictions.',
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto">
           <h2 className="font-headline text-3xl md:text-4xl font-bold">
            An Unfair Advantage for Modern Investors
          </h2>
          <p className="mt-4 text-muted-foreground md:text-lg">
            VentureLens combines cutting-edge AI with comprehensive data to give you an unparalleled advantage.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="text-center shadow-md hover:shadow-lg transition-shadow bg-card border-border/60">
              <CardHeader>
                <div className="mx-auto bg-primary/10 rounded-full p-3 w-fit">
                  <feature.icon className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="font-headline pt-4 text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="text-center mt-12">
            <Link href="/features" className="text-primary hover:underline">
                Learn more about our features &rarr;
            </Link>
        </div>
      </div>
    </section>
  );
}
