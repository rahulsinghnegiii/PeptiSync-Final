import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  const sections = [
    {
      title: "1. Information We Collect",
      content:
        "We collect information you provide directly to us, including your name, email address, and health tracking data such as peptide doses, symptoms, and measurements.",
    },
    {
      title: "2. How We Use Your Information",
      content:
        "We use the information we collect to provide, maintain, and improve our services, to process your transactions, and to send you technical notices and support messages.",
    },
    {
      title: "3. Data Security",
      content:
        "We implement appropriate technical and organizational measures to protect your personal data against unauthorized or unlawful processing, accidental loss, destruction, or damage.",
    },
    {
      title: "4. Data Storage",
      content:
        "Your data is stored securely using Firebase Cloud Firestore and Supabase with encryption at rest and in transit. We retain your data for as long as your account is active.",
    },
    {
      title: "5. Data Sharing",
      content:
        "We do not sell, trade, or rent your personal information to third parties. We may share aggregated, anonymized data for research or analytics purposes.",
    },
    {
      title: "6. Your Rights",
      content:
        "You have the right to access, update, or delete your personal information at any time through your account settings. You may also request a copy of your data.",
    },
    {
      title: "7. Health Data",
      content:
        "Your health tracking data is treated with the highest level of confidentiality. We comply with applicable health data protection regulations including HIPAA where applicable.",
    },
    {
      title: "8. Cookies and Tracking",
      content:
        "We use cookies and similar tracking technologies to track activity on our service and hold certain information to improve and analyze our service.",
    },
    {
      title: "9. Children's Privacy",
      content:
        "Our service is not intended for use by children under the age of 18. We do not knowingly collect personal information from children under 18.",
    },
    {
      title: "10. Changes to Privacy Policy",
      content:
        'We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.',
    },
    {
      title: "11. Contact Us",
      content:
        "If you have any questions about this Privacy Policy, please contact us at privacy@peptisync.com",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-20">
        <section className="relative py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              
              <h1 className="text-4xl font-bold text-gradient mb-2">
                Privacy Policy
              </h1>
              <p className="text-muted-foreground">
                Last updated: November 17, 2025
              </p>
            </motion.div>

            {/* Content */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="glass border-glass-border rounded-lg p-8 space-y-8"
            >
              {/* Introduction */}
              <div className="pb-6 border-b border-glass-border">
                <p className="text-muted-foreground leading-relaxed">
                  At PeptiSync, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our peptide tracking and e-commerce platform. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
                </p>
              </div>

              {/* Sections */}
              {sections.map((section, index) => (
                <motion.div
                  key={section.title}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  className="space-y-3"
                >
                  <h2 className="text-xl font-bold text-foreground">
                    {section.title}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {section.content}
                  </p>
                </motion.div>
              ))}

              {/* Additional Information */}
              <div className="pt-6 border-t border-glass-border space-y-4">
                <h2 className="text-xl font-bold text-foreground">
                  12. Payment Processing
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Payment information is processed securely through Stripe. We do not store your complete credit card information on our servers. Stripe is PCI-DSS compliant and uses industry-standard encryption.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-bold text-foreground">
                  13. Third-Party Services
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  We use the following third-party services that may collect information used to identify you:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li>Supabase (Database and Authentication)</li>
                  <li>Firebase (Real-time Features)</li>
                  <li>Stripe (Payment Processing)</li>
                  <li>Resend (Email Notifications)</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-bold text-foreground">
                  14. Data Retention
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  We will retain your personal information only for as long as is necessary for the purposes set out in this Privacy Policy. We will retain and use your information to the extent necessary to comply with our legal obligations, resolve disputes, and enforce our policies.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-bold text-foreground">
                  15. International Data Transfers
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Your information may be transferred to and maintained on computers located outside of your state, province, country, or other governmental jurisdiction where the data protection laws may differ from those of your jurisdiction.
                </p>
              </div>

              {/* Contact Information */}
              <div className="pt-6 border-t border-glass-border bg-muted/30 rounded-lg p-6">
                <h2 className="text-xl font-bold text-foreground mb-4">
                  Contact Information
                </h2>
                <p className="text-muted-foreground mb-4">
                  If you have questions or comments about this Privacy Policy, please contact us at:
                </p>
                <div className="space-y-2 text-muted-foreground">
                  <p>
                    <strong className="text-foreground">Email:</strong>{" "}
                    <a
                      href="mailto:privacy@peptisync.com"
                      className="text-primary hover:underline"
                    >
                      privacy@peptisync.com
                    </a>
                  </p>
                  <p>
                    <strong className="text-foreground">Support:</strong>{" "}
                    <a
                      href="mailto:support@peptisync.com"
                      className="text-primary hover:underline"
                    >
                      support@peptisync.com
                    </a>
                  </p>
                </div>
              </div>

              {/* Effective Date */}
              <div className="text-center pt-6 border-t border-glass-border">
                <p className="text-sm text-muted-foreground italic">
                  This Privacy Policy is effective as of November 17, 2025 and will remain in effect except with respect to any changes in its provisions in the future, which will be in effect immediately after being posted on this page.
                </p>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;

