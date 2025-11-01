import { FileText, PersonStanding, Search, Database, TrendingUp, BarChart, Download, FileScan, Handshake } from "lucide-react";
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
    icon: Database, 
    title: "4. Run AI Deal Analysis", 
    description: "Enter basic startup information (name, sector, stage, metrics) and watch our AI automatically enrich it with real-time public data from Crunchbase. Get funding history, team details, revenue estimates, and market intelligence—all without manual research.",
    imageUrl: "https://picsum.photos/seed/data-enrich/600/400",
    imageHint: "database automation network"
  },
  { 
    icon: TrendingUp, 
    title: "5. Compare Against Sector Benchmarks", 
    description: "Our AI compares the startup's metrics against real industry benchmarks from our BigQuery database. See percentile rankings for ARR, growth rate, burn efficiency, team size, and unit economics. Identify if the startup is an outlier performer or underperformer in their sector and stage.",
    imageUrl: "https://picsum.photos/seed/benchmark-compare/600/400",
    imageHint: "growth chart percentile"
  },
  { 
    icon: BarChart, 
    title: "6. Assess Risks & Get Deal Score", 
    description: "Receive a comprehensive risk assessment covering regulatory compliance, financial health, and market positioning. Our AI generates a proprietary Deal Score (0-100) that synthesizes all data points into a single, actionable investment grade with detailed reasoning.",
    imageUrl: "https://picsum.photos/seed/risk-score/600/400",
    imageHint: "risk analysis dashboard"
  },
  { 
    icon: FileScan, 
    title: "7. Analyze Documents & Ask Questions", 
    description: "Upload pitch decks, financials, or business plans to get comprehensive investment memos with key highlights, flashcards, and audio summaries. Use our intelligent Q&A chatbot to ask specific questions about the documents and get instant, contextual answers.",
    imageUrl: "https://picsum.photos/seed/pitch-deck/600/400",
    imageHint: "presentation chart analysis"
  },
  { 
    icon: Download, 
    title: "8. Download Professional Reports", 
    description: "Export your complete AI Deal Analysis as professional PDF or Word documents. Get detailed reports with all enriched data, benchmark comparisons, risk assessments, and deal scores for your records, team sharing, and due diligence.",
    imageUrl: "https://picsum.photos/seed/report-download/600/400",
    imageHint: "document download export"
  },
  { 
    icon: Handshake, 
    title: "9. Schedule Meetings & Invest", 
    description: "Schedule meetings with founders directly through our platform. Our smart scheduler generates professional meeting invitations with Google Meet links, automatically including your investment criteria and analysis context. Take the next confident step towards investment with all the information you need.",
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
