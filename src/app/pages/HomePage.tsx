import { Header } from '../components/Header';
import { HeroSection } from '../components/HeroSection';
import { ProblemSection } from '../components/ProblemSection';
import { SolutionSection } from '../components/SolutionSection';
import { HowItWorksSection } from '../components/HowItWorksSection';
import { WhoItsForSection } from '../components/WhoItsForSection';
import { TrustSection } from '../components/TrustSection';
import { FinalCTA } from '../components/FinalCTA';

export function HomePage() {
  return (
    <>
      <Header />
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <HowItWorksSection />
      <WhoItsForSection />
      <TrustSection />
      <FinalCTA />
    </>
  );
}
