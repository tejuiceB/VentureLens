import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';

const testimonials = [
  {
    quote: "VentureLens transformed how I source deals. The AI-matching is incredibly accurate and has saved me hundreds of hours.",
    name: "Alex Johnson",
    title: "Angel Investor",
    avatar: "https://picsum.photos/seed/person1/100/100",
  },
  {
    quote: "The pitch deck analysis is a game-changer. I can now spot red flags and key opportunities in minutes, not hours.",
    name: "Samantha Lee",
    title: "VC Partner, Tech Growth Ventures",
    avatar: "https://picsum.photos/seed/person2/100/100",
  },
  {
    quote: "As someone who invests globally, the compliance feature is invaluable. It gives me peace of mind with every investment.",
    name: "David Chen",
    title: "Founder, Global Edge Capital",
    avatar: "https://picsum.photos/seed/person3/100/100",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="font-headline text-3xl md:text-4xl font-bold">
            Trusted by Leading Investors
          </h2>
          <p className="mt-4 text-muted-foreground md:text-lg">
            See what our users are saying about VentureLens.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="p-6 flex flex-col justify-between shadow-md bg-card border-border/60">
              <CardContent className="p-0">
                <p className="text-muted-foreground italic">"{testimonial.quote}"</p>
              </CardContent>
              <div className="mt-6 flex items-center gap-4">
                <Image
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  width={48}
                  height={48}
                  className="rounded-full"
                  data-ai-hint="person portrait"
                />
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
