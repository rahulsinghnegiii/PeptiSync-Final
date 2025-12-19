import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Cookie } from "lucide-react";
import { COMPANY_INFO } from "@/lib/constants";

const CookiePolicy = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main id="main-content" className="flex-grow pt-16">
        <PageHeader
          title="Cookie Policy"
          subtitle="How we use cookies and similar technologies"
          icon={<Cookie className="w-4 h-4 text-primary" />}
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

                <h2>What Are Cookies?</h2>
                <p>
                  Cookies are small text files that are placed on your device when you visit our website. They help us provide you with a better experience by remembering your preferences and understanding how you use our Service.
                </p>

                <h2>Types of Cookies We Use</h2>
                
                <h3>1. Essential Cookies</h3>
                <p>
                  These cookies are necessary for the Service to function properly. They enable core functionality such as:
                </p>
                <ul>
                  <li>User authentication and security</li>
                  <li>Session management</li>
                  <li>Load balancing</li>
                </ul>

                <h3>2. Functional Cookies</h3>
                <p>
                  These cookies allow us to remember your preferences and provide enhanced features:
                </p>
                <ul>
                  <li>Language preferences</li>
                  <li>Theme settings (dark/light mode)</li>
                  <li>User interface customizations</li>
                </ul>

                <h3>3. Analytics Cookies</h3>
                <p>
                  We use analytics cookies to understand how visitors interact with our Service:
                </p>
                <ul>
                  <li>Pages visited and features used</li>
                  <li>Time spent on the Service</li>
                  <li>Error tracking and performance monitoring</li>
                </ul>

                <h3>4. Performance Cookies</h3>
                <p>
                  These cookies help us improve the performance of our Service by:
                </p>
                <ul>
                  <li>Identifying slow-loading pages</li>
                  <li>Optimizing content delivery</li>
                  <li>Reducing server load</li>
                </ul>

                <h2>Third-Party Cookies</h2>
                <p>
                  We may use third-party services that set cookies on your device:
                </p>
                <ul>
                  <li><strong>Firebase:</strong> For authentication and database services</li>
                  <li><strong>Analytics Services:</strong> To understand user behavior</li>
                  <li><strong>CDN Providers:</strong> To deliver content efficiently</li>
                </ul>

                <h2>How to Control Cookies</h2>
                <p>
                  You can control and manage cookies in several ways:
                </p>

                <h3>Browser Settings</h3>
                <p>
                  Most browsers allow you to:
                </p>
                <ul>
                  <li>View and delete cookies</li>
                  <li>Block third-party cookies</li>
                  <li>Block cookies from specific websites</li>
                  <li>Block all cookies</li>
                  <li>Delete all cookies when you close your browser</li>
                </ul>

                <h3>Opt-Out Links</h3>
                <p>
                  You can opt out of certain third-party cookies through these resources:
                </p>
                <ul>
                  <li>Network Advertising Initiative: <a href="http://www.networkadvertising.org/choices/" target="_blank" rel="noopener noreferrer">http://www.networkadvertising.org/choices/</a></li>
                  <li>Digital Advertising Alliance: <a href="http://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer">http://www.aboutads.info/choices/</a></li>
                </ul>

                <h2>Impact of Disabling Cookies</h2>
                <p>
                  If you disable cookies, some features of the Service may not function properly:
                </p>
                <ul>
                  <li>You may need to log in repeatedly</li>
                  <li>Your preferences may not be saved</li>
                  <li>Some features may be unavailable</li>
                </ul>

                <h2>Local Storage</h2>
                <p>
                  In addition to cookies, we use browser local storage to:
                </p>
                <ul>
                  <li>Cache data for offline access</li>
                  <li>Store user preferences</li>
                  <li>Improve application performance</li>
                </ul>

                <h2>Updates to This Policy</h2>
                <p>
                  We may update this Cookie Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date.
                </p>

                <h2>Contact Us</h2>
                <p>
                  If you have questions about our use of cookies, please contact us at:
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

export default CookiePolicy;

