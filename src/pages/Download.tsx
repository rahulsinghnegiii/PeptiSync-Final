import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { PageHeader } from "@/components/PageHeader";
import { AppStoreButtons } from "@/components/AppStoreButtons";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { 
  Smartphone, 
  Download as DownloadIcon, 
  Check, 
  QrCode,
  Apple,
  Monitor
} from "lucide-react";
import { APP_LINKS } from "@/lib/constants";
import appPreview from "@/assets/app-preview.jpg";

const Download = () => {
  const features = [
    "Track unlimited peptide protocols",
    "AI-powered insights and analytics",
    "Injection site rotation tracker",
    "Vendor price comparison",
    "Progress photos and measurements",
    "Cloud sync across devices",
    "Dark mode support",
    "Offline access",
  ];

  const requirements = [
    { platform: "iOS", version: "iOS 14.0 or later", icon: <Apple className="w-5 h-5" /> },
    { platform: "Android", version: "Android 8.0 or later", icon: <Monitor className="w-5 h-5" /> },
  ];

  const screenshots = [
    { src: appPreview, alt: "Dashboard view" },
    { src: appPreview, alt: "Protocol tracking" },
    { src: appPreview, alt: "Analytics" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main id="main-content" className="flex-grow pt-16">
        <PageHeader
          title="Download PeptiSync"
          subtitle="Get the most advanced peptide tracking app on your device"
          badge="Available Now"
          icon={<Smartphone className="w-4 h-4 text-primary" />}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
          {/* Download Section */}
          <motion.section
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <Card className="glass border-glass-border max-w-4xl mx-auto">
              <CardContent className="p-12">
                <div className="mb-8">
                  <DownloadIcon className="w-16 h-16 mx-auto mb-4 text-primary" />
                  <h2 className="text-3xl font-bold mb-4">Download Now</h2>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    Available on iOS and Android. Download for free and start tracking your peptide protocols today.
                  </p>
                </div>

                <AppStoreButtons className="mb-8" />

                <div className="grid md:grid-cols-2 gap-6 mt-12">
                  <div className="text-center">
                    <div className="w-48 h-48 mx-auto bg-white rounded-2xl p-4 flex items-center justify-center">
                      <QrCode className="w-full h-full text-gray-800" />
                    </div>
                    <p className="text-sm text-muted-foreground mt-4">Scan for iOS</p>
                  </div>
                  <div className="text-center">
                    <div className="w-48 h-48 mx-auto bg-white rounded-2xl p-4 flex items-center justify-center">
                      <QrCode className="w-full h-full text-gray-800" />
                    </div>
                    <p className="text-sm text-muted-foreground mt-4">Scan for Android</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.section>

          {/* Features List */}
          <motion.section
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-center mb-12">What's Included</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
              {features.map((feature, index) => (
                <motion.div
                  key={feature}
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <Card className="glass border-glass-border h-full">
                    <CardContent className="p-4 flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Screenshots */}
          <motion.section
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-center mb-12">App Preview</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {screenshots.map((screenshot, index) => (
                <motion.div
                  key={index}
                  initial={{ y: 30, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="cursor-pointer"
                >
                  <Card className="glass border-glass-border overflow-hidden">
                    <img 
                      src={screenshot.src} 
                      alt={screenshot.alt}
                      className="w-full h-auto"
                    />
                  </Card>
                  <p className="text-center text-sm text-muted-foreground mt-2">
                    {screenshot.alt}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* System Requirements */}
          <motion.section
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-center mb-12">System Requirements</h2>
            <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {requirements.map((req, index) => (
                <motion.div
                  key={req.platform}
                  initial={{ x: index === 0 ? -30 : 30, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <Card className="glass border-glass-border">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center text-white">
                          {req.icon}
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold">{req.platform}</h3>
                          <Badge variant="secondary" className="mt-1">
                            {req.version}
                          </Badge>
                        </div>
                      </div>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-primary" />
                          Free to download
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-primary" />
                          In-app purchases available
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-primary" />
                          Regular updates
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* CTA Section */}
          <motion.section
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <Card className="glass border-glass-border max-w-3xl mx-auto">
              <CardContent className="p-12">
                <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
                <p className="text-muted-foreground mb-8">
                  Join thousands of users already tracking their peptide protocols with PeptiSync
                </p>
                <AppStoreButtons />
              </CardContent>
            </Card>
          </motion.section>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Download;

