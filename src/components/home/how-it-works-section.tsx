import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FileText, PersonStanding, Search, Handshake } from "lucide-react";


const steps = [
  {
    icon: FileText,
    title: '1. Create Your Profile',
    description: 'Answer a few smart questions about your investment goals and risk tolerance. Our AI uses this to build your unique investor DNA.',
  },
  {
    icon: Search,
    title: '2. Discover AI-Matched Startups',
    description: 'Instantly access a dynamic dashboard of startups from around the world, all algorithmically scored and ranked for you.',
  },
  {
    icon: Handshake,
    title: '3. Connect & Invest',
    description: 'Once you’ve found the right fit, use our platform to securely connect with founders and take the next steps towards investment.',
  },
];

export default function HowItWorksSection() {
  return (
    <section className="py-16 md:py-24 bg-card">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="font-headline text-3xl md:text-4xl font-bold">
            Streamline Your Investment Workflow
          </h2>
          <p className="mt-4 text-muted-foreground md:text-lg">
            From profiling to investment, our platform simplifies every step of your journey.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Dashed line for desktop */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-px -translate-y-12">
            <svg width="100%" height="2" className="overflow-visible">
              <line x1="15%" y1="1" x2="85%" y2="1" strokeWidth="2" strokeDasharray="10 10" className="stroke-border" />
            </svg>
          </div>

          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center text-center z-10">
               <div className="flex items-center justify-center w-20 h-20 rounded-full bg-background border-2 border-primary text-primary">
                <step.icon className="w-8 h-8"/>
              </div>
              <h3 className="mt-6 font-headline text-xl font-semibold">{step.title}</h3>
              <p className="mt-2 text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-16">
            <Button asChild variant="outline">
                <Link href="/how-it-works">See the Full Process</Link>
            </Button>
        </div>
      </div>
    </section>
  );
}
