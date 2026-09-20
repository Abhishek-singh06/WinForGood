import { HeroSection } from "@/components/homepage/HeroSection";
import { HowItWorksSection } from "@/components/homepage/HowItWorksSection";
import { CharitySpotlightSection } from "@/components/homepage/CharitySpotlightSection";
import { DrawPreviewSection } from "@/components/homepage/DrawPreviewSection";
import { TestimonialImpactSection } from "@/components/homepage/TestimonialImpactSection";
import { CtaBanner } from "@/components/homepage/CtaBanner";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <HowItWorksSection />
      <CharitySpotlightSection />
      <DrawPreviewSection />
      <TestimonialImpactSection />
      <CtaBanner />
    </>
  );
}
