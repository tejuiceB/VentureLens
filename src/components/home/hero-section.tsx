import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export default function HeroSection() {
  return (
    <section className="relative h-[600px] flex items-center justify-center text-center text-white overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="https://picsum.photos/seed/hero/1920/1080"
          alt="Abstract background"
          fill
          className="object-cover"
          data-ai-hint="abstract tech"
          priority
        />
        <div className="absolute inset-0 bg-background/80" />
      </div>
      <div className="relative z-10 container mx-auto px-4">
        <h1 className="font-headline text-4xl md:text-6xl font-bold tracking-tight">
          Unlock the Future of Startup Investing
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-foreground/80">
          Leverage AI-driven insights to discover, analyze, and invest in the world's most promising startups.
        </p>
        <div className="mt-8">
          {/* <Button size="lg" asChild>
            <Link href="/signup">Get Started Free</Link>
          </Button> */}
        </div>
      </div>
    </section>
  );
}
