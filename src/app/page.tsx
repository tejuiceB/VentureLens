import HeroSection from '@/components/home/hero-section';
import FeaturesSection from '@/components/home/features-section';
import HowItWorksSection from '@/components/home/how-it-works-section';
import TestimonialsSection from '@/components/home/testimonials-section';
import CtaSection from '@/components/home/cta-section';

export default function Home() {
  return (
    <div>
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <CtaSection />
    </div>
  );
}
