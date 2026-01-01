import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { PageHeader } from "@/components/PageHeader";
import { MedicalDisclaimer } from "@/components/MedicalDisclaimer";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Heart, Target, Users, Shield, Sparkles } from "lucide-react";
import { COMPANY_INFO } from "@/lib/constants";

const About = () => {
  const values = [
    {
      icon: <Heart className="w-6 h-6" />,
      title: "User-Centric",
      description: "We put our users first, building features that truly matter for peptide tracking and optimization."
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Precision",
      description: "Accurate tracking and data management to help you achieve your health and wellness goals."
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Privacy First",
      description: "Your health data is yours. We prioritize security and privacy in everything we build."
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "Innovation",
      description: "Constantly evolving with cutting-edge features like AI insights and vendor price comparison."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main id="main-content" className="flex-grow pt-16">
        <PageHeader
          title="About PeptiSync"
          subtitle="Revolutionizing peptide tracking for health enthusiasts and biohackers worldwide"
          badge="Our Story"
          icon={<Users className="w-4 h-4 text-primary" />}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
          {/* Founder Story */}
          <motion.section
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="glass border-glass-border overflow-hidden">
              <CardContent className="p-8 md:p-12">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                  <div>
                    <h2 className="text-3xl font-bold mb-6">Why We Built PeptiSync</h2>
                    <div className="space-y-4 text-muted-foreground">
                      <p>
                        PeptiSync was born out of a simple frustration: there wasn't an easy, all-in-one 
                        way to track peptide protocols.
                      </p>
                      <p>
                        As peptide use grew within the health and wellness space, we saw people relying 
                        on spreadsheets, notebooks, and scattered notes just to stay organized. Tracking 
                        doses, schedules, and injection sites felt unnecessarily complicated — and 
                        important insights were getting lost along the way.
                      </p>
                      <p>
                        We knew there had to be a better solution. One platform that could not only 
                        simplify tracking, but also provide meaningful insights, compare vendor pricing, 
                        and help users make more informed decisions based on real data.
                      </p>
                      <p>
                        Today, PeptiSync supports a growing global community of wellness enthusiasts, 
                        biohackers, and athletes — all focused on optimizing their health with clarity 
                        and confidence. We're proud to be building a smarter, more intuitive platform 
                        for this evolving space.
                      </p>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <div className="aspect-square rounded-2xl glass p-8 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-32 h-32 mx-auto mb-6 rounded-full gradient-primary flex items-center justify-center">
                          <Users className="w-16 h-16 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">Founded 2025</h3>
                        <p className="text-muted-foreground">
                          Built by health enthusiasts,<br />for health enthusiasts
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.section>

          {/* Mission Statement */}
          <motion.section
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12">
              To empower individuals on their health optimization journey by providing the most 
              comprehensive, intuitive, and data-driven peptide tracking platform available.
            </p>
          </motion.section>

          {/* Values */}
          <motion.section
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ y: 30, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="glass border-glass-border h-full hover:shadow-neon transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-4 text-white">
                        {value.icon}
                      </div>
                      <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                      <p className="text-muted-foreground text-sm">{value.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Company Info */}
          <motion.section
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="glass border-glass-border">
              <CardContent className="p-8 md:p-12">
                <h2 className="text-3xl font-bold mb-6 text-center">Company Information</h2>
                <div className="max-w-2xl mx-auto space-y-4 text-center">
                  <div>
                    <p className="text-lg font-semibold">{COMPANY_INFO.legalName}</p>
                    <p className="text-muted-foreground">{COMPANY_INFO.address}</p>
                  </div>
                  <div className="pt-4">
                    <p className="text-sm text-muted-foreground">
                      For support inquiries, please contact us at{" "}
                      <a 
                        href={`mailto:${COMPANY_INFO.supportEmail}`}
                        className="text-primary hover:underline"
                      >
                        {COMPANY_INFO.supportEmail}
                      </a>
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Expected response time: {COMPANY_INFO.responseTime}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.section>

          {/* Medical Disclaimer */}
          <motion.section
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <MedicalDisclaimer variant="full" />
          </motion.section>

          {/* Stats */}
          <motion.section
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold mb-12">By The Numbers</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { value: "50K+", label: "Active Users" },
                { value: "1M+", label: "Protocols Tracked" },
                { value: "50+", label: "Verified Vendors" },
                { value: "98%", label: "User Satisfaction" }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, type: "spring" }}
                >
                  <div className="text-4xl font-bold text-gradient mb-2">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default About;

