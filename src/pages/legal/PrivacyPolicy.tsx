import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import { COMPANY_INFO } from "@/lib/constants";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main id="main-content" className="flex-grow pt-16">
        <PageHeader
          title="Privacy Policy"
          subtitle="How we collect, use, and protect your information"
          icon={<Shield className="w-4 h-4 text-primary" />}
        />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="glass border-glass-border">
              <CardContent className="p-8 md:p-12 prose prose-lg dark:prose-invert max-w-none">
                <p className="text-sm text-muted-foreground">
                  Last Updated: December 19, 2024
                </p>

                <h2>Introduction</h2>
                <p>
                  PeptiSync ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application PeptiSync (the "App") and website. Please read this Privacy Policy carefully. If you do not agree with the terms of this Privacy Policy, please do not access or use the App or website.
                </p>

                <h2>Information We Collect</h2>
                
                <h3>Personal Information</h3>
                <p>
                  We collect information that you provide directly to us, including:
                </p>
                <ul>
                  <li><strong>Account Information:</strong> Email address, display name, profile photo, phone number (optional)</li>
                  <li><strong>Authentication Data:</strong> Credentials for email/password authentication, or authentication tokens from third-party providers (Google, Apple)</li>
                  <li><strong>Biometric Data:</strong> Face ID or fingerprint data (stored locally on your device only, never transmitted to our servers)</li>
                </ul>

                <h3>Health and Wellness Data</h3>
                <p>
                  To provide our core services, we collect and store:
                </p>
                <ul>
                  <li><strong>Peptide Information:</strong> Peptide names, dosages, injection logs, cycle information, inventory data</li>
                  <li><strong>Body Measurements:</strong> Height, weight, body measurements, body fat calculations</li>
                  <li><strong>Progress Photos:</strong> Images you upload to track your progress</li>
                  <li><strong>Lab Results:</strong> Laboratory test results and related health metrics</li>
                  <li><strong>Symptom Tracking:</strong> Symptoms, severity levels, and related notes</li>
                  <li><strong>Goals:</strong> Wellness goals and progress tracking</li>
                  <li><strong>Stacks:</strong> Custom peptide stack configurations and performance data</li>
                </ul>

                <h3>Usage and Technical Data</h3>
                <p>
                  We automatically collect certain information when you use the App:
                </p>
                <ul>
                  <li><strong>Device Information:</strong> Device type, operating system, unique device identifiers</li>
                  <li><strong>Usage Data:</strong> App features used, interaction patterns, timestamps</li>
                  <li><strong>Push Notification Tokens:</strong> Firebase Cloud Messaging (FCM) tokens for delivering notifications</li>
                  <li><strong>Analytics Data:</strong> App performance metrics, crash reports, error logs</li>
                </ul>

                <h3>Subscription and Payment Information</h3>
                <ul>
                  <li><strong>Subscription Status:</strong> Plan tier, subscription status, trial information</li>
                  <li><strong>Payment Processing:</strong> Handled by third-party payment processors (Stripe/RevenueCat). We do not store credit card information.</li>
                </ul>

                <h2>How We Use Your Information</h2>
                <p>
                  We use the information we collect to:
                </p>
                <ol>
                  <li><strong>Provide and Maintain the App:</strong> Deliver core functionality including dose tracking, progress monitoring, and analytics</li>
                  <li><strong>Authentication:</strong> Verify your identity and manage account access</li>
                  <li><strong>Personalization:</strong> Customize your experience, including preferences and settings</li>
                  <li><strong>Notifications:</strong> Send push notifications for dose reminders, low stock alerts, and important updates (with your consent)</li>
                  <li><strong>Analytics:</strong> Analyze usage patterns to improve app performance and user experience</li>
                  <li><strong>Customer Support:</strong> Respond to your inquiries and provide technical support</li>
                  <li><strong>Security:</strong> Detect and prevent fraud, abuse, and security threats</li>
                  <li><strong>Legal Compliance:</strong> Comply with legal obligations and enforce our terms of service</li>
                </ol>

                <h2>Data Storage and Security</h2>
                
                <h3>Data Storage</h3>
                <ul>
                  <li><strong>Cloud Storage:</strong> Your data is stored securely in Firebase (Google Cloud Platform) using industry-standard encryption</li>
                  <li><strong>Local Storage:</strong> Some data, including biometric authentication credentials, is stored locally on your device using secure storage mechanisms</li>
                  <li><strong>Data Retention:</strong> We retain your data for as long as your account is active or as needed to provide services. You may request deletion at any time.</li>
                </ul>

                <h3>Security Measures</h3>
                <p>
                  We implement appropriate technical and organizational security measures to protect your data:
                </p>
                <ul>
                  <li><strong>Encryption:</strong> Data in transit is encrypted using TLS/SSL protocols</li>
                  <li><strong>Access Controls:</strong> Strict access controls limit who can view your data</li>
                  <li><strong>Secure Authentication:</strong> Multi-factor authentication options and secure credential storage</li>
                  <li><strong>Regular Audits:</strong> Security audits and vulnerability assessments</li>
                  <li><strong>Compliance:</strong> Adherence to industry security standards</li>
                </ul>
                <p>
                  <strong>However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your data, we cannot guarantee absolute security.</strong>
                </p>

                <h2>Third-Party Services</h2>
                <p>
                  We use the following third-party services that may collect information:
                </p>
                
                <h3>Firebase (Google)</h3>
                <ul>
                  <li><strong>Firebase Authentication:</strong> For user authentication</li>
                  <li><strong>Cloud Firestore:</strong> For database storage</li>
                  <li><strong>Firebase Storage:</strong> For file storage (photos, documents)</li>
                  <li><strong>Firebase Cloud Messaging:</strong> For push notifications</li>
                  <li><strong>Firebase Analytics:</strong> For app analytics</li>
                </ul>
                <p>
                  Firebase's privacy practices are governed by <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google's Privacy Policy</a>.
                </p>

                <h3>Google Sign-In</h3>
                <p>
                  When you choose to sign in with Google, Google may collect information as described in their <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.
                </p>

                <h3>Apple Sign-In</h3>
                <p>
                  When you choose to sign in with Apple, Apple may collect information as described in their <a href="https://www.apple.com/privacy/privacy-policy/" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.
                </p>

                <h3>Payment Processors</h3>
                <ul>
                  <li><strong>Stripe:</strong> Payment processing (see <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer">Stripe Privacy Policy</a>)</li>
                  <li><strong>RevenueCat:</strong> Subscription management (see <a href="https://www.revenuecat.com/privacy" target="_blank" rel="noopener noreferrer">RevenueCat Privacy Policy</a>)</li>
                </ul>

                <h3>Analytics</h3>
                <p>
                  We may use analytics services to understand app usage. These services may collect device identifiers and usage data.
                </p>

                <h2>Data Sharing and Disclosure</h2>
                <p>
                  We do not sell your personal information. We may share your information only in the following circumstances:
                </p>
                <ol>
                  <li><strong>With Your Consent:</strong> When you explicitly authorize sharing</li>
                  <li><strong>Service Providers:</strong> With trusted third-party service providers who assist in operating the App (e.g., cloud hosting, analytics)</li>
                  <li><strong>Legal Requirements:</strong> When required by law, court order, or government regulation</li>
                  <li><strong>Protection of Rights:</strong> To protect our rights, privacy, safety, or property, or that of our users</li>
                  <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets (with notice to users)</li>
                </ol>

                <h3>Community Features</h3>
                <ul>
                  <li><strong>Vendor Pricing:</strong> If you submit vendor pricing information, it may be visible to other users (with moderation)</li>
                  <li><strong>Public Profiles:</strong> Profile information you choose to make public may be visible to other users</li>
                </ul>

                <h2>Your Rights and Choices</h2>
                <p>
                  You have the following rights regarding your personal information:
                </p>

                <h3>Access and Portability</h3>
                <ul>
                  <li><strong>View Your Data:</strong> Access your personal information through the App settings</li>
                  <li><strong>Export Data:</strong> Request a copy of your data in a portable format</li>
                  <li><strong>Data Export:</strong> Use the in-app data export feature to download your data</li>
                </ul>

                <h3>Deletion</h3>
                <ul>
                  <li><strong>Delete Account:</strong> Request account deletion through the App settings or by contacting us</li>
                  <li><strong>Data Deletion:</strong> Upon account deletion, we will delete your personal information, subject to legal retention requirements</li>
                  <li><strong>Partial Deletion:</strong> You may delete specific data (photos, notes, etc.) through the App</li>
                </ul>

                <h3>Correction</h3>
                <ul>
                  <li><strong>Update Information:</strong> Modify your profile and preferences through the App settings</li>
                  <li><strong>Correct Errors:</strong> Request correction of inaccurate information</li>
                </ul>

                <h3>Opt-Out</h3>
                <ul>
                  <li><strong>Notifications:</strong> Manage notification preferences in App settings</li>
                  <li><strong>Marketing:</strong> Opt out of marketing communications</li>
                  <li><strong>Analytics:</strong> Some analytics may be opt-out through device settings</li>
                </ul>

                <h3>Biometric Data</h3>
                <ul>
                  <li><strong>Disable Biometric Auth:</strong> You can disable biometric authentication at any time through App settings</li>
                  <li><strong>Local Storage Only:</strong> Biometric data is stored only on your device and never transmitted</li>
                </ul>

                <h2>Children's Privacy</h2>
                <p>
                  PeptiSync is not intended for children under the age of 13 (or the minimum age in your jurisdiction). We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately, and we will delete such information.
                </p>

                <h2>International Data Transfers</h2>
                <p>
                  Your information may be transferred to and processed in countries other than your country of residence. These countries may have data protection laws that differ from those in your country. We ensure appropriate safeguards are in place for such transfers.
                </p>

                <h2>California Privacy Rights</h2>
                <p>
                  If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA):
                </p>
                <ul>
                  <li>Right to know what personal information is collected</li>
                  <li>Right to delete personal information</li>
                  <li>Right to opt-out of the sale of personal information (we do not sell personal information)</li>
                  <li>Right to non-discrimination for exercising your privacy rights</li>
                </ul>

                <h2>European Privacy Rights (GDPR)</h2>
                <p>
                  If you are located in the European Economic Area (EEA), you have additional rights under the General Data Protection Regulation (GDPR):
                </p>
                <ul>
                  <li>Right to access your personal data</li>
                  <li>Right to rectification of inaccurate data</li>
                  <li>Right to erasure ("right to be forgotten")</li>
                  <li>Right to restrict processing</li>
                  <li>Right to data portability</li>
                  <li>Right to object to processing</li>
                  <li>Right to withdraw consent</li>
                </ul>

                <h2>Changes to This Privacy Policy</h2>
                <p>
                  We may update this Privacy Policy from time to time. We will notify you of any changes by:
                </p>
                <ul>
                  <li>Posting the new Privacy Policy in the App and on our website</li>
                  <li>Updating the "Last Updated" date</li>
                  <li>Sending you a notification (for material changes)</li>
                </ul>
                <p>
                  Your continued use of the App after such modifications constitutes your acknowledgment and acceptance of the updated Privacy Policy.
                </p>

                <h2>Health Information Disclaimer</h2>
                <p>
                  PeptiSync is designed for tracking and informational purposes only. It is not a medical device and does not provide medical advice, diagnosis, or treatment. Always consult with qualified healthcare professionals regarding your health and wellness decisions.
                </p>

                <h2>Data Controller</h2>
                <p>
                  For questions about this Privacy Policy or our data practices, please contact:
                </p>
                <p>
                  <strong>PeptiSync</strong><br />
                  Email: <a href="mailto:privacy@peptisync.com">privacy@peptisync.com</a><br />
                  Support: <a href="mailto:support@peptisync.com">support@peptisync.com</a>
                </p>

                <h2>Consent</h2>
                <p>
                  By using PeptiSync, you consent to the collection and use of information in accordance with this Privacy Policy.
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

export default PrivacyPolicy;


