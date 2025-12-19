import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import Features from "@/components/Features";
import { FeaturePreviews } from "@/components/FeaturePreviews";
import { FoundingUserCounter } from "@/components/FoundingUserCounter";
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
      </main>
      <Footer />
    </div>
  );
};

export default Index;
