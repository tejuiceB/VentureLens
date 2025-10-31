import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, Globe, Scale } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function CompliancePage() {
  return (
    <div className="bg-background">
      <section className="relative h-[400px] flex items-center justify-center text-center text-white overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://picsum.photos/seed/compliance/1200/400"
            alt="Compliance background"
            fill
            className="object-cover"
            data-ai-hint="legal documents scales"
            priority
          />
          <div className="absolute inset-0 bg-background/80" />
        </div>
        <div className="relative z-10 container mx-auto px-4">
          <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight">
            AI-Powered Compliance Reports
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-foreground/80">
            Generate comprehensive regulatory compliance assessments for any startup with a single click, helping you navigate the complexities of international investing with confidence.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-headline text-3xl font-bold">Intelligent Compliance Analysis</h2>
              <p className="mt-4 text-muted-foreground text-lg">
                In a globalized investment landscape, understanding and respecting local and international regulations is paramount. VentureLens uses advanced AI to analyze startup documents against your investment criteria and generate comprehensive compliance reports instantly.
              </p>
              <p className="mt-4 text-muted-foreground text-lg">
                Our AI-powered system evaluates regulatory adherence across multiple jurisdictions, identifies potential compliance risks, and provides actionable insights. Download professional reports in PDF or Word format for your due diligence records.
              </p>
              <p className="mt-4 text-muted-foreground text-lg">
                Each report includes a proprietary <strong>Compliance Score</strong>, detailed risk assessments, regulatory considerations, and recommendations tailored to your investment profile.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Card className="bg-card border-border/60">
                <CardHeader className="flex-row items-center gap-4 space-y-0 pb-2">
                  <Globe className="h-8 w-8 text-primary"/>
                  <CardTitle className="font-headline text-base">AI-Powered Reports</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Generate comprehensive compliance reports instantly with detailed regulatory analysis, risk factors, and jurisdiction-specific insights.</p>
                </CardContent>
              </Card>
               <Card className="bg-card border-border/60">
                <CardHeader className="flex-row items-center gap-4 space-y-0 pb-2">
                  <Scale className="h-8 w-8 text-primary"/>
                  <CardTitle className="font-headline text-base">Professional Downloads</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Export reports in PDF or Word format for your records, team sharing, and due diligence documentation.</p>
                </CardContent>
              </Card>
            </div>
          </div>
          <div className="mt-20 bg-card p-8 rounded-lg text-center border border-border/60">
            <ShieldCheck className="h-12 w-12 text-accent mx-auto" />
            <h3 className="font-headline text-2xl font-bold mt-4">Disclaimer</h3>
            <p className="text-muted-foreground max-w-3xl mx-auto mt-2">
              VentureLens provides information and tools to aid your due diligence process. We are not a law firm or a financial advisor. The information and Compliance Scores provided on this platform are for informational purposes only and do not constitute legal or financial advice. We strongly recommend consulting with qualified legal and financial professionals before making any investment decisions.
            </p>
            {/* <Button asChild className="mt-6">
              <Link href="/signup">I Understand, Get Started</Link>
            </Button> */}
          </div>
        </div>
      </section>
    </div>
  )
}
