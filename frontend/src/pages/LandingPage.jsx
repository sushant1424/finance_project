import LandingNavbar from '@/components/layout/LandingNavbar';
import LandingHero from '@/features/landing/LandingHero';
import LandingFeatures from '@/features/landing/LandingFeatures';
import LandingPricing from '@/features/landing/LandingPricing';
import LandingHowItWorks from '@/features/landing/LandingHowItWorks';
import LandingFooter from '@/features/landing/LandingFooter';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />
      <main>
        <LandingHero />
        <LandingFeatures />
        <LandingPricing />
        <div id="how-it-works">
          <LandingHowItWorks />
        </div>
        <LandingFooter />
      </main>
    </div>
  );
}
