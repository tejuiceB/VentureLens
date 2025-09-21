import { FileText, PersonStanding, Search, BarChart, FileScan, Handshake } from "lucide-react";
import Image from "next/image";

const steps = [
  { 
    icon: FileText, 
    title: "1. Complete the Questionnaire", 
    description: "Answer a few smart questions about your investment goals, risk tolerance, and preferred industries. Our AI uses this to build your unique investor DNA.",
    imageUrl: "https://picsum.photos/seed/questionnaire/600/400",
    imageHint: "form survey checklist"
  },
  { 
    icon: PersonStanding, 
    title: "2. Create Your Profile", 
    description: "Your questionnaire responses generate a comprehensive investor profile, which serves as the foundation for all personalized recommendations.",
    imageUrl: "https://picsum.photos/seed/user-profile/600/400",
    imageHint: "personal dashboard profile"
  },
  { 
    icon: Search, 
    title: "3. Discover AI-Matched Startups", 
    description: "Instantly access a dynamic dashboard of startups from around the world, all algorithmically scored and ranked based on their compatibility with your profile.",
    imageUrl: "https://picsum.photos/seed/startup-discovery/600/400",
    imageHint: "world map connections"
  },
  { 
    icon: FileScan, 
    title: "4. Analyze Pitch Decks", 
    description: "Dive deep by running any pitch deck through our AI analyzer. Get an unbiased report on the business model, market, team, and financials in minutes.",
    imageUrl: "https://picsum.photos/seed/pitch-deck/600/400",
    imageHint: "presentation chart analysis"
  },
  { 
    icon: BarChart, 
    title: "5. Review Compliance & Data", 
    description: "Assess the startup’s regulatory compliance score and review all critical data points in one organized place, from financials to competitive landscape.",
    imageUrl: "https://picsum.photos/seed/compliance-chart/600/400",
    imageHint: "data graph compliance"
  },
  { 
    icon: Handshake, 
    title: "6. Connect & Invest", 
    description: "Once you’ve found the right fit, use our platform to securely connect with founders and take the next steps towards investment.",
    imageUrl: "https://picsum.photos/seed/connect-invest/600/400",
    imageHint: "business meeting handshake"
  },
]

export default function HowItWorksPage() {
  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="font-headline text-4xl md:text-5xl font-bold">
            Your Journey to Smarter Investing
          </h1>
          <p className="mt-4 text-muted-foreground md:text-lg">
            We've engineered a seamless workflow to take you from discovery to decision with clarity and confidence.
          </p>
        </div>

        <div className="mt-20 space-y-24">
          {steps.map((step, index) => (
            <div key={step.title} className={`grid md:grid-cols-2 gap-12 items-center ${index % 2 !== 0 ? 'md:grid-flow-col-dense' : ''}`}>
              <div className={index % 2 !== 0 ? 'md:col-start-2' : ''}>
                <div className="flex items-center gap-4">
                   <div className="bg-primary/10 rounded-lg p-2 w-fit">
                    <step.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="font-headline text-3xl font-bold">{step.title}</h2>
                </div>
                <p className="mt-4 text-muted-foreground text-lg">{step.description}</p>
              </div>
              <div className={`relative aspect-[3/2] rounded-lg overflow-hidden shadow-lg ${index % 2 !== 0 ? 'md:col-start-1' : ''}`}>
                <Image
                  src={step.imageUrl}
                  alt={step.title}
                  fill
                  className="object-cover"
                  data-ai-hint={step.imageHint}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
