import Image from "next/image";
import { UserCheck, Target, FileScan, ShieldCheck, Handshake } from 'lucide-react';

const featureDetails = [
  {
    icon: UserCheck,
    title: 'Investor Risk Profiler',
    description: 'Our sophisticated AI questionnaire goes beyond simple risk tolerance. It builds a multi-dimensional profile of your investment philosophy, including sector preferences, desired involvement, and ethical considerations, ensuring every match is truly personalized.',
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
    icon: FileScan,
    title: 'Startup Pitch Deck Analyzer',
    description: 'Upload any pitch deck and receive an instant, in-depth analysis tailored to your investment criteria. Our AI identifies strengths, weaknesses, hidden risks, and uncovers questions you need to ask. It’s like having a team of analysts on demand.',
    imageUrl: 'https://picsum.photos/seed/deck-analyzer/600/400',
    imageHint: 'document data analysis',
  },
   {
    icon: ShieldCheck,
    title: 'Global Regulatory Compliance',
    description: 'Invest with confidence across borders. We provide up-to-date insights on regulatory landscapes for various jurisdictions and assign a compliance score to each startup, helping you navigate complex legal environments and mitigate risk.',
    imageUrl: 'https://picsum.photos/seed/gavel-compliance/600/400',
    imageHint: 'gavel justice scales',
  },
  {
    icon: Handshake,
    title: 'Connect & Invest',
    description: 'Once you’ve found the right fit, use our platform to securely connect with founders and take the next steps towards investment.',
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
