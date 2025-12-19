import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import { COMPANY_INFO } from "@/lib/constants";

const TermsOfUse = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main id="main-content" className="flex-grow pt-16">
        <PageHeader
          title="Terms of Use"
          subtitle="Please read these terms carefully before using PeptiSync"
          icon={<FileText className="w-4 h-4 text-primary" />}
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

                <h2>1. Acceptance of Terms</h2>
                <p>
                  By accessing and using PeptiSync ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these Terms of Service, please do not access or use the Service.
                </p>

                <h2>2. Use License</h2>
                <p>
                  Permission is granted to temporarily use PeptiSync for personal, non-commercial purposes only. This is the grant of a license, not a transfer of title, and under this license you may not:
                </p>
                <ul>
                  <li>Modify or copy the materials</li>
                  <li>Use the materials for any commercial purpose or for any public display</li>
                  <li>Attempt to reverse engineer any software contained in the Service</li>
                  <li>Remove any copyright or other proprietary notations from the materials</li>
                  <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
                </ul>

                <h2>3. Medical Disclaimer</h2>
                <p>
                  <strong>PeptiSync is a tracking tool and does not provide medical advice.</strong> Always consult with a qualified healthcare provider before starting any peptide therapy or making changes to your treatment plan. The information provided through the Service is for informational purposes only and should not be used as a substitute for professional medical advice, diagnosis, or treatment.
                </p>
                <p>
                  You acknowledge and agree that:
                </p>
                <ul>
                  <li>PeptiSync is not a medical device and does not diagnose, treat, cure, or prevent any disease</li>
                  <li>All health-related decisions should be made in consultation with qualified healthcare professionals</li>
                  <li>We do not endorse or recommend any specific peptides, vendors, or treatment protocols</li>
                  <li>You use the Service at your own risk and assume full responsibility for any health-related decisions</li>
                </ul>

                <h2>4. User Account</h2>
                <p>
                  You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account. You must:
                </p>
                <ul>
                  <li>Provide accurate, current, and complete information during registration</li>
                  <li>Maintain and promptly update your account information</li>
                  <li>Maintain the security and confidentiality of your login credentials</li>
                  <li>Immediately notify us of any unauthorized use of your account</li>
                  <li>Be at least 18 years of age to create an account</li>
                </ul>

                <h2>5. Data Privacy</h2>
                <p>
                  Your use of PeptiSync is also governed by our Privacy Policy. Please review our <a href="/legal/privacy-policy">Privacy Policy</a> to understand our practices regarding the collection, use, and disclosure of your personal information.
                </p>

                <h2>6. Subscription Terms</h2>
                <p>
                  Certain features of the Service require a paid subscription. By subscribing, you agree to the following:
                </p>
                <ul>
                  <li>Subscription fees are billed in advance on a recurring basis (monthly or annually)</li>
                  <li>You may cancel your subscription at any time through your account settings</li>
                  <li>Cancellations take effect at the end of the current billing period</li>
                  <li>No refunds are provided for partial subscription periods</li>
                  <li>We reserve the right to modify subscription pricing with 30 days notice</li>
                  <li>Free trials, if offered, automatically convert to paid subscriptions unless cancelled</li>
                </ul>

                <h2>7. Prohibited Uses</h2>
                <p>
                  You may not use PeptiSync for any illegal purpose or to violate any laws. Specifically, you may not:
                </p>
                <ul>
                  <li>Use the Service to engage in any illegal activity or violate any local, state, national, or international law</li>
                  <li>Violate or infringe upon the intellectual property rights of others</li>
                  <li>Harass, abuse, or harm another person or entity</li>
                  <li>Impersonate or attempt to impersonate another user, person, or entity</li>
                  <li>Interfere with or disrupt the Service or servers or networks connected to the Service</li>
                  <li>Attempt to gain unauthorized access to any portion of the Service</li>
                  <li>Use any automated system to access the Service (bots, scrapers, etc.)</li>
                  <li>Upload or transmit viruses or any other type of malicious code</li>
                  <li>Collect or track personal information of other users</li>
                  <li>Use the Service to provide medical advice, diagnosis, or treatment to others</li>
                  <li>Distribute, sell, or transfer controlled substances or prescription medications</li>
                </ul>

                <h2>8. Intellectual Property Rights</h2>
                <p>
                  The Service and its original content, features, and functionality are owned by PeptiSync and are protected by international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.
                </p>
                <p>
                  You retain ownership of any content you submit to the Service ("User Content"). By submitting User Content, you grant us a worldwide, non-exclusive, royalty-free, sublicensable, and transferable license to use, reproduce, distribute, prepare derivative works of, display, and perform the User Content in connection with the Service.
                </p>

                <h2>9. User Content Guidelines</h2>
                <p>
                  When submitting content to the Service (including vendor pricing, notes, or community contributions), you agree that your content:
                </p>
                <ul>
                  <li>Is accurate and not misleading</li>
                  <li>Does not violate any third-party rights</li>
                  <li>Does not contain illegal, harmful, or offensive material</li>
                  <li>Does not contain personal health information of others</li>
                  <li>Complies with all applicable laws and regulations</li>
                </ul>
                <p>
                  We reserve the right to remove any User Content that violates these Terms or is otherwise objectionable, at our sole discretion.
                </p>

                <h2>10. Vendor Pricing Submissions</h2>
                <p>
                  If you submit vendor pricing information:
                </p>
                <ul>
                  <li>You represent that the information is accurate to the best of your knowledge</li>
                  <li>You understand that submissions are subject to moderation and approval</li>
                  <li>Approved submissions may be visible to other users</li>
                  <li>We reserve the right to edit or remove submissions at any time</li>
                  <li>You will not submit false, misleading, or fraudulent pricing information</li>
                </ul>

                <h2>11. Third-Party Services</h2>
                <p>
                  The Service may contain links to third-party websites or services that are not owned or controlled by PeptiSync. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party websites or services.
                </p>

                <h2>12. Limitation of Liability</h2>
                <p>
                  TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL PEPTISYNC, ITS AFFILIATES, DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM:
                </p>
                <ul>
                  <li>Your access to or use of or inability to access or use the Service</li>
                  <li>Any conduct or content of any third party on the Service</li>
                  <li>Any content obtained from the Service</li>
                  <li>Unauthorized access, use, or alteration of your transmissions or content</li>
                  <li>Any health-related decisions made based on information from the Service</li>
                </ul>

                <h2>13. Disclaimer of Warranties</h2>
                <p>
                  YOUR USE OF THE SERVICE IS AT YOUR SOLE RISK. THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS. THE SERVICE IS PROVIDED WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, OR COURSE OF PERFORMANCE.
                </p>
                <p>
                  We do not warrant that:
                </p>
                <ul>
                  <li>The Service will function uninterrupted, secure, or available at any particular time or location</li>
                  <li>Any errors or defects will be corrected</li>
                  <li>The Service is free of viruses or other harmful components</li>
                  <li>The results of using the Service will meet your requirements</li>
                  <li>The accuracy or reliability of any information obtained through the Service</li>
                </ul>

                <h2>14. Indemnification</h2>
                <p>
                  You agree to defend, indemnify, and hold harmless PeptiSync and its affiliates, licensors, and service providers, and its and their respective officers, directors, employees, contractors, agents, licensors, suppliers, successors, and assigns from and against any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising out of or relating to your violation of these Terms or your use of the Service.
                </p>

                <h2>15. Termination</h2>
                <p>
                  We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
                </p>
                <p>
                  If you wish to terminate your account, you may do so through your account settings or by contacting us. Upon termination, your right to use the Service will immediately cease. All provisions of the Terms which by their nature should survive termination shall survive termination, including, without limitation, ownership provisions, warranty disclaimers, indemnity, and limitations of liability.
                </p>

                <h2>16. Changes to Terms</h2>
                <p>
                  We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
                </p>
                <p>
                  By continuing to access or use our Service after any revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, you are no longer authorized to use the Service.
                </p>

                <h2>17. Governing Law</h2>
                <p>
                  These Terms shall be governed and construed in accordance with the laws of the United States, without regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
                </p>

                <h2>18. Dispute Resolution</h2>
                <p>
                  Any dispute arising from these Terms or your use of the Service will be resolved through binding arbitration in accordance with the rules of the American Arbitration Association. You waive any right to a jury trial or to participate in a class action lawsuit.
                </p>

                <h2>19. Severability</h2>
                <p>
                  If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions of these Terms will remain in effect. These Terms constitute the entire agreement between us regarding our Service and supersede and replace any prior agreements we might have had between us regarding the Service.
                </p>

                <h2>20. Contact Information</h2>
                <p>
                  If you have any questions about these Terms of Service, please contact us at:
                </p>
                <p>
                  <strong>PeptiSync</strong><br />
                  Email: <a href="mailto:support@peptisync.com">support@peptisync.com</a>
                </p>

                <h2>21. Acknowledgment</h2>
                <p>
                  BY USING THE SERVICE, YOU ACKNOWLEDGE THAT YOU HAVE READ THESE TERMS OF SERVICE AND AGREE TO BE BOUND BY THEM.
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

export default TermsOfUse;


