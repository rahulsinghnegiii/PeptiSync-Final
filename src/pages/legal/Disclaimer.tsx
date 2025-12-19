import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { COMPANY_INFO, MEDICAL_DISCLAIMER } from "@/lib/constants";

const Disclaimer = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main id="main-content" className="flex-grow pt-16">
        <PageHeader
          title="Medical & Legal Disclaimer"
          subtitle="Important information about using PeptiSync"
          icon={<AlertTriangle className="w-4 h-4 text-warning" />}
        />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="glass border-warning bg-warning/10">
              <CardContent className="p-8 md:p-12 prose prose-lg dark:prose-invert max-w-none">
                <p className="text-sm text-muted-foreground">
                  Last Updated: December 19, 2024
                </p>

                <h2>Medical Disclaimer</h2>
                <p className="text-lg font-semibold text-warning">
                  {MEDICAL_DISCLAIMER.full}
                </p>

                <h2>Not Medical Advice</h2>
                <p>
                  PeptiSync is a tracking and organizational tool. It is NOT a medical device, medical service, or healthcare provider. The information provided through PeptiSync is for informational and educational purposes only.
                </p>

                <h2>Consult Healthcare Professionals</h2>
                <p>
                  Always consult with a qualified healthcare provider before:
                </p>
                <ul>
                  <li>Starting any peptide protocol</li>
                  <li>Changing your current protocol</li>
                  <li>Stopping any treatment</li>
                  <li>Making any health-related decisions</li>
                </ul>

                <h2>No FDA Approval</h2>
                <p>
                  PeptiSync is not FDA approved. The peptides tracked through our application may not be FDA approved for human use. Research peptides are for research purposes only.
                </p>

                <h2>No Warranties</h2>
                <p>
                  We make no representations or warranties regarding:
                </p>
                <ul>
                  <li>The accuracy of information provided</li>
                  <li>The effectiveness of any peptide protocols</li>
                  <li>The safety of any substances tracked</li>
                  <li>The reliability of vendor information</li>
                </ul>

                <h2>Assumption of Risk</h2>
                <p>
                  By using PeptiSync, you acknowledge and agree that:
                </p>
                <ul>
                  <li>You use the Service at your own risk</li>
                  <li>You are responsible for your own health decisions</li>
                  <li>You will consult appropriate healthcare professionals</li>
                  <li>You understand the risks associated with peptide use</li>
                </ul>

                <h2>Vendor Information</h2>
                <p>
                  Vendor price information is user-submitted and community-verified. We do not:
                </p>
                <ul>
                  <li>Endorse any specific vendor</li>
                  <li>Guarantee the quality of vendor products</li>
                  <li>Verify the authenticity of vendor claims</li>
                  <li>Take responsibility for vendor transactions</li>
                </ul>

                <h2>Educational Purposes Only</h2>
                <p>
                  All content provided through PeptiSync is for educational and informational purposes only. It should not be considered as medical advice, diagnosis, or treatment.
                </p>

                <h2>Limitation of Liability</h2>
                <p>
                  {COMPANY_INFO.legalName} and its affiliates, officers, employees, agents, partners, and licensors shall not be liable for any direct, indirect, incidental, special, consequential, or exemplary damages resulting from your use of PeptiSync.
                </p>

                <h2>Emergency Situations</h2>
                <p>
                  If you are experiencing a medical emergency, call emergency services immediately. Do not rely on PeptiSync for emergency medical assistance.
                </p>

                <h2>Contact Information</h2>
                <p>
                  If you have questions about this disclaimer, contact us at:
                </p>
                <p>
                  Email: <a href={`mailto:${COMPANY_INFO.supportEmail}`}>{COMPANY_INFO.supportEmail}</a>
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Disclaimer;

