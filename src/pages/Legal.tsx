import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Legal = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0">
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-primary rounded-full"
                initial={{ 
                  x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
                  y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
                  opacity: 0 
                }}
                animate={{
                  y: [null, -100, -200],
                  opacity: [0, 0.4, 0],
                }}
                transition={{
                  duration: 6 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 4,
                }}
              />
            ))}
          </div>
          
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl lg:text-6xl font-bold mb-6">
                Legal <span className="text-gradient">Information</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Terms, Privacy Policy, and important disclaimers
              </p>
            </motion.div>
          </div>
        </section>

        {/* Legal Content */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <Tabs defaultValue="terms" className="w-full">
                <TabsList className="glass w-full mb-8">
                  <TabsTrigger value="terms" className="flex-1">Terms of Service</TabsTrigger>
                  <TabsTrigger value="privacy" className="flex-1">Privacy Policy</TabsTrigger>
                  <TabsTrigger value="disclaimer" className="flex-1">Disclaimer</TabsTrigger>
                </TabsList>
                
                <TabsContent value="terms" className="glass p-8 rounded-lg">
                  <div className="prose prose-invert max-w-none">
                    <h2 className="text-2xl font-bold text-gradient mb-6">Terms of Service</h2>
                    
                    <h3 className="text-lg font-semibold mb-4">1. Acceptance of Terms</h3>
                    <p className="text-muted-foreground mb-6">
                      By accessing and using PeptiSync, you accept and agree to be bound by the terms and provision of this agreement.
                    </p>
                    
                    <h3 className="text-lg font-semibold mb-4">2. Use License</h3>
                    <p className="text-muted-foreground mb-6">
                      Permission is granted to temporarily download one copy of PeptiSync for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
                    </p>
                    
                    <h3 className="text-lg font-semibold mb-4">3. User Account</h3>
                    <p className="text-muted-foreground mb-6">
                      You are responsible for safeguarding the password and for maintaining the confidentiality of your account. You agree not to disclose your password to any third party.
                    </p>
                    
                    <h3 className="text-lg font-semibold mb-4">4. Prohibited Uses</h3>
                    <p className="text-muted-foreground mb-6">
                      You may not use PeptiSync for any unlawful purpose or to solicit others to perform unlawful acts. You may not transmit any worms or viruses or any code of a destructive nature.
                    </p>
                    
                    <h3 className="text-lg font-semibold mb-4">5. Termination</h3>
                    <p className="text-muted-foreground">
                      We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                    </p>
                  </div>
                </TabsContent>
                
                <TabsContent value="privacy" className="glass p-8 rounded-lg">
                  <div className="prose prose-invert max-w-none">
                    <h2 className="text-2xl font-bold text-gradient mb-6">Privacy Policy</h2>
                    
                    <h3 className="text-lg font-semibold mb-4">Information We Collect</h3>
                    <p className="text-muted-foreground mb-6">
                      We collect information you provide directly to us, such as when you create an account, update your profile, or use our services. This includes your name, email address, and peptide tracking data.
                    </p>
                    
                    <h3 className="text-lg font-semibold mb-4">How We Use Your Information</h3>
                    <p className="text-muted-foreground mb-6">
                      We use the information we collect to provide, maintain, and improve our services, process transactions, send communications, and personalize your experience.
                    </p>
                    
                    <h3 className="text-lg font-semibold mb-4">Data Security</h3>
                    <p className="text-muted-foreground mb-6">
                      We implement appropriate technical and organizational measures to protect your personal information against unauthorized or unlawful processing, accidental loss, destruction, or damage.
                    </p>
                    
                    <h3 className="text-lg font-semibold mb-4">Third-Party Services</h3>
                    <p className="text-muted-foreground mb-6">
                      Our service may contain links to third-party websites or services that are not owned or controlled by PeptiSync. We have no control over and assume no responsibility for the content or privacy policies of third-party services.
                    </p>
                    
                    <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
                    <p className="text-muted-foreground">
                      If you have any questions about this Privacy Policy, please contact us at privacy@peptisync.com.
                    </p>
                  </div>
                </TabsContent>
                
                <TabsContent value="disclaimer" className="glass p-8 rounded-lg">
                  <div className="prose prose-invert max-w-none">
                    <h2 className="text-2xl font-bold text-gradient mb-6">Medical Disclaimer</h2>
                    
                    <h3 className="text-lg font-semibold mb-4">Not Medical Advice</h3>
                    <p className="text-muted-foreground mb-6">
                      PeptiSync is a tracking tool and does not provide medical advice. The information provided through our service is for informational purposes only and should not be considered medical advice, diagnosis, or treatment.
                    </p>
                    
                    <h3 className="text-lg font-semibold mb-4">Consult Healthcare Professionals</h3>
                    <p className="text-muted-foreground mb-6">
                      Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition or treatment. Never disregard professional medical advice because of something you have read on PeptiSync.
                    </p>
                    
                    <h3 className="text-lg font-semibold mb-4">Emergency Situations</h3>
                    <p className="text-muted-foreground mb-6">
                      If you think you may have a medical emergency, call your doctor or emergency services immediately. PeptiSync does not recommend or endorse any specific tests, physicians, procedures, opinions, or other information mentioned on our platform.
                    </p>
                    
                    <h3 className="text-lg font-semibold mb-4">Limitation of Liability</h3>
                    <p className="text-muted-foreground mb-6">
                      PeptiSync and its affiliates will not be liable for any direct, indirect, incidental, special, consequential, or punitive damages arising out of your use of the service.
                    </p>
                    
                    <h3 className="text-lg font-semibold mb-4">Regulatory Compliance</h3>
                    <p className="text-muted-foreground">
                      Users are responsible for ensuring their use of peptides complies with all applicable laws and regulations in their jurisdiction. PeptiSync does not provide legal advice regarding peptide use or regulations.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Legal;