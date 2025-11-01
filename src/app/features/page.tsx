import Image from "next/image";
import { UserCheck, Target, FileScan, TrendingUp, Database, Handshake } from 'lucide-react';

const featureDetails = [
  {
    icon: UserCheck,
    title: 'Investor Risk Profiler with Smart Persistence',
    description: 'Our sophisticated AI questionnaire goes beyond simple risk tolerance. It builds a multi-dimensional profile of your investment philosophy, including sector preferences, desired involvement, and ethical considerations. Your profile is automatically saved to your browser, so you never have to re-enter information. Welcome back messages and a clear profile option give you complete control.',
    imageUrl: 'https://picsum.photos/seed/profiler/600/400',
    imageHint: 'financial report analysis',
  },
  {
    icon: Target,
    title: 'Personalized Startup Matching',
    description: 'Stop sifting through endless databases. Our algorithm scans a global pool of vetted startups, presenting you with a curated list of opportunities that align with your unique profile. We score each match based on dozens of data points, from team strength to market potential.',
    imageUrl: 'https://picsum.photos/seed/matching/600/400',
    imageHint: 'target dartboard',
  },
  {
    icon: Database,
    title: 'AI Deal Analysis with Public Data Enrichment',
    description: 'Enter basic startup information and watch our AI automatically enrich it with real-time data from Crunchbase and other public sources. Get comprehensive insights including funding history, team size, revenue estimates, and market positioning—all without manual research.',
    imageUrl: 'https://picsum.photos/seed/data-enrichment/600/400',
    imageHint: 'database network connections',
  },
  {
    icon: TrendingUp,
    title: 'Real-Time Sector Benchmarking',
    description: 'Compare any startup against industry peers using our BigQuery-powered benchmarking engine. Get percentile rankings for ARR, growth rate, burn rate, team efficiency, and unit economics. Identify strengths, weaknesses, and outliers with data-driven sector comparisons across all funding stages from Seed to Series C+.',
    imageUrl: 'https://picsum.photos/seed/sector-benchmark/600/400',
    imageHint: 'growth chart comparison',
  },
  {
    icon: FileScan,
    title: 'Document Analyzer with AI Chatbot',
    description: 'Upload any startup documents (pitch decks, financials, business plans) and receive an instant, comprehensive investment memo with key highlights, flashcards, and audio summaries. Plus, ask questions via our intelligent Q&A chatbot that answers based on your analyzed documents. Analyze both matched startups and custom companies with multiple file support.',
    imageUrl: 'https://picsum.photos/seed/deck-analyzer/600/400',
    imageHint: 'document data analysis',
  },
  {
    icon: Handshake,
    title: 'Smart Meeting Scheduler',
    description: "Once you've found the right fit, schedule meetings with founders directly from the platform. Our AI-powered scheduler generates professional meeting invitations with Google Meet links, complete with your investment criteria and analysis context. Connect seamlessly with calendar integration.",
    imageUrl: 'https://picsum.photos/seed/investment-deal/600/400',
    imageHint: 'business handshake deal',
  },
];

export default function FeaturesPage() {
  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="font-headline text-4xl md:text-5xl font-bold">
            An Unfair Advantage for Modern Investors
          </h1>
          <p className="mt-4 text-muted-foreground md:text-lg">
            Explore the powerful, AI-driven tools that make VentureLens an essential part of your investment toolkit.
          </p>
        </div>
        <div className="mt-20 space-y-24">
          {featureDetails.map((feature, index) => (
            <div key={feature.title} className={`grid md:grid-cols-2 gap-12 items-center ${index % 2 !== 0 ? 'md:grid-flow-col-dense' : ''}`}>
              <div className={index % 2 !== 0 ? 'md:col-start-2' : ''}>
                <div className="flex items-center gap-4">
                   <div className="bg-primary/10 rounded-lg p-2 w-fit">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="font-headline text-3xl font-bold">{feature.title}</h2>
                </div>
                <p className="mt-4 text-muted-foreground text-lg">{feature.description}</p>
              </div>
              <div className={`relative aspect-[3/2] rounded-lg overflow-hidden shadow-lg ${index % 2 !== 0 ? 'md:col-start-1' : ''}`}>
                <Image
                  src={feature.imageUrl}
                  alt={feature.title}
                  fill
                  className="object-cover"
                  data-ai-hint={feature.imageHint}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
