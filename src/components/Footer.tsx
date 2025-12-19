import { motion } from "framer-motion";
import { Facebook, Twitter, Instagram, Github, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { COMPANY_INFO, SOCIAL_LINKS } from "@/lib/constants";
import { FooterDisclaimer } from "@/components/MedicalDisclaimer";

const Footer = () => {
  const footerSections = [
    {
      title: "Product",
      links: [
        { name: "Features", href: "/features" },
        { name: "Download", href: "/download" },
        { name: "Vendor Pricing", href: "/vendor-pricing" },
        { name: "Store", href: "/store" },
      ]
    },
    {
      title: "Support",
      links: [
        { name: "Help Center", href: "/faq" },
        { name: "Contact Us", href: "/contact" },
        { name: "Documentation", href: "/faq" },
      ]
    },
    {
      title: "Company",
      links: [
        { name: "About", href: "/about" },
        { name: "Blog", href: "/blog" },
      ]
    },
    {
      title: "Legal",
      links: [
        { name: "Privacy Policy", href: "/legal/privacy" },
        { name: "Terms of Service", href: "/legal/terms" },
        { name: "Cookie Policy", href: "/legal/cookies" },
        { name: "Disclaimer", href: "/legal/disclaimer" },
      ]
    }
  ];

  const socialLinks = [
    { icon: Twitter, href: SOCIAL_LINKS.twitter, label: "Twitter" },
    { icon: Facebook, href: SOCIAL_LINKS.facebook, label: "Facebook" },
    { icon: Instagram, href: SOCIAL_LINKS.instagram, label: "Instagram" },
    { icon: Github, href: SOCIAL_LINKS.github, label: "GitHub" },
    { icon: Mail, href: `mailto:${COMPANY_INFO.supportEmail}`, label: "Email" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 12
      }
    }
  };

  return (
    <footer className="relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background to-transparent"></div>
      
      <div className="relative border-t border-glass-border/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8"
          >
            {/* Brand Section */}
            <motion.div variants={itemVariants} className="lg:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <img 
                  src="/logo.png" 
                  alt="PeptiSync Logo" 
                  className="w-8 h-8 object-contain"
                />
                <span className="text-xl font-bold text-gradient">PeptiSync</span>
              </div>
              
              <p className="text-muted-foreground mb-6 max-w-sm">
                The most advanced peptide tracking platform. Monitor your protocols, 
                track progress, and optimize results with AI-powered insights.
              </p>

              {/* Social Links */}
              <div className="flex space-x-4">
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-10 h-10 glass-hover rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary transition-colors duration-300"
                    aria-label={social.label}
                  >
                    <social.icon className="w-5 h-5" />
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* Footer Links */}
            {footerSections.map((section, index) => (
              <motion.div
                key={section.title}
                variants={itemVariants}
                className="space-y-4"
              >
                <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
                  {section.title}
                </h3>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <Link to={link.href}>
                        <motion.span
                          whileHover={{ x: 4 }}
                          className="text-sm text-muted-foreground hover:text-primary transition-colors duration-300 inline-block"
                        >
                          {link.name}
                        </motion.span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>

          {/* Newsletter Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="mt-16 pt-8 border-t border-glass-border/30"
          >
            <div className="max-w-2xl mx-auto text-center">
              <h3 className="text-lg font-semibold mb-2">Stay updated</h3>
              <p className="text-muted-foreground mb-6">
                Get the latest updates on new features, peptide insights, and exclusive offers.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-lg bg-input border border-glass-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors duration-300"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="gradient-primary px-6 py-3 rounded-lg text-primary-foreground font-medium shadow-lg hover:shadow-neon transition-all duration-300"
                >
                  Subscribe
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Bottom Bar */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="mt-12 pt-8 border-t border-glass-border/30"
          >
            <div className="flex flex-col md:flex-row justify-between items-center mb-4">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} {COMPANY_INFO.legalName}. All rights reserved.
              </p>
              
              <div className="mt-4 md:mt-0 flex space-x-6">
                <Link 
                  to="/legal/privacy" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors duration-300"
                >
                  Privacy
                </Link>
                <Link 
                  to="/legal/terms" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors duration-300"
                >
                  Terms
                </Link>
                <Link 
                  to="/legal/cookies" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors duration-300"
                >
                  Cookies
                </Link>
              </div>
            </div>
            
            {/* Medical Disclaimer */}
            <div className="mt-4">
              <FooterDisclaimer />
            </div>
          </motion.div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;