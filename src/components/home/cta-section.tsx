import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function CtaSection() {
  return (
    <section className="py-16 md:py-24 bg-card border-t border-border/60">
      <div className="container mx-auto px-4 text-center">
        <h2 className="font-headline text-3xl md:text-4xl font-bold">
          Ready to Elevate Your Investment Game?
        </h2>
        <p className="mt-4 max-w-xl mx-auto text-muted-foreground md:text-lg">
          Join the new generation of investors using AI to build a winning portfolio. Get started with VentureLens today.
        </p>
        <div className="mt-8">
          {/* <Button size="lg" asChild>
            <Link href="/signup">Get Started for Free</Link>
          </Button> */}
        </div>
      </div>
    </section>
  );
}
