import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import Features from "@/components/Features";
import { FeaturePreviews } from "@/components/FeaturePreviews";
import { FoundingUserCounter } from "@/components/FoundingUserCounter";
import { PricingComparison } from "@/components/PricingComparison";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main id="main-content">
        <Hero />
        <HowItWorks />
        <Features />
        <FeaturePreviews />
        <FoundingUserCounter />
        <PricingComparison />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
