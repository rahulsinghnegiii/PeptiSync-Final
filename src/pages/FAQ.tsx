import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
  const faqs = [
    {
      question: "What is PeptiSync and how does it work?",
      answer: "PeptiSync is an advanced peptide tracking platform that helps you monitor your peptide protocols, track progress, and optimize results with AI-powered insights. Simply log your injections, set reminders, and track your progress over time."
    },
    {
      question: "Is PeptiSync safe and secure?",
      answer: "Absolutely. We use enterprise-grade encryption to protect your data, comply with HIPAA regulations, and never share your personal health information with third parties. All data is stored securely in encrypted databases."
    },
    {
      question: "What devices does PeptiSync support?",
      answer: "PeptiSync is available on iOS, Android, and as a web application. All your data syncs seamlessly across all devices, so you can track your progress anywhere."
    },
    {
      question: "Can I track multiple peptide protocols?",
      answer: "Yes! PeptiSync supports tracking multiple protocols simultaneously. You can set different schedules, dosages, and monitoring parameters for each protocol."
    },
    {
      question: "What's included in the Pro membership?",
      answer: "Pro membership includes unlimited protocol tracking, advanced analytics, AI-powered insights, priority support, cloud backup, and access to our community of peptide enthusiasts."
    },
    {
      question: "How do I cancel my subscription?",
      answer: "You can cancel your subscription anytime from your account settings. Your Pro features will remain active until the end of your current billing period."
    },
    {
      question: "Do you offer refunds?",
      answer: "We offer a 30-day money-back guarantee for all paid memberships. If you're not satisfied, contact our support team for a full refund."
    },
    {
      question: "Can I export my data?",
      answer: "Yes, you can export all your tracking data in multiple formats (CSV, PDF, JSON) from your account dashboard. Your data belongs to you."
    },
    {
      question: "Is there a free version?",
      answer: "Yes! Our free version includes basic tracking for up to 2 protocols, reminder notifications, and progress charts. Upgrade to Pro for unlimited features."
    },
    {
      question: "How do I contact support?",
      answer: "Our support team is available 24/7 through the in-app chat, email at support@peptisync.com, or through our contact form. Pro members get priority support."
    }
  ];

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0">
            {Array.from({ length: 12 }).map((_, i) => (
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
                  opacity: [0, 0.5, 0],
                }}
                transition={{
                  duration: 5 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 3,
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
                Frequently Asked <span className="text-gradient">Questions</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Find answers to common questions about PeptiSync and peptide tracking
              </p>
            </motion.div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <Accordion type="single" collapsible className="space-y-4">
                {faqs.map((faq, index) => (
                  <motion.div
                    key={index}
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1, duration: 0.6 }}
                  >
                    <AccordionItem 
                      value={`item-${index}`}
                      className="glass border-glass-border rounded-lg px-6 hover:border-primary/30 transition-all duration-300"
                    >
                      <AccordionTrigger className="text-left hover:text-gradient transition-colors py-6">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground pb-6">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  </motion.div>
                ))}
              </Accordion>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default FAQ;