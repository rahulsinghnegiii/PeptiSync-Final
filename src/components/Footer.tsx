import { motion } from "framer-motion";
import { Facebook, Twitter, Instagram, Github, Mail } from "lucide-react";

const Footer = () => {
  const footerSections = [
    {
      title: "Product",
      links: [
        { name: "Features", href: "/features" },
        { name: "Pricing", href: "/#pricing" },
        { name: "Store", href: "/store" },
        { name: "Download", href: "/auth" },
      ]
    },
    {
      title: "Support",
      links: [
        { name: "Help Center", href: "/faq" },
        { name: "Contact Us", href: "#" },
        { name: "Status", href: "#" },
        { name: "Community", href: "#" },
      ]
    },
    {
      title: "Company",
      links: [
        { name: "About", href: "#" },
        { name: "Blog", href: "#" },
        { name: "Careers", href: "#" },
        { name: "Press", href: "#" },
      ]
    },
    {
      title: "Legal",
      links: [
        { name: "Privacy Policy", href: "/legal" },
        { name: "Terms of Service", href: "/legal" },
        { name: "Cookie Policy", href: "/legal" },
        { name: "Disclaimer", href: "/legal" },
      ]
    }
  ];

  const socialLinks = [
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Github, href: "#", label: "GitHub" },
    { icon: Mail, href: "#", label: "Email" },
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
                <div className="w-8 h-8 rounded-lg gradient-accent"></div>
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
                      <motion.a
                        href={link.href}
                        whileHover={{ x: 4 }}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors duration-300"
                      >
                        {link.name}
                      </motion.a>
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
            className="mt-12 pt-8 border-t border-glass-border/30 flex flex-col md:flex-row justify-between items-center"
          >
            <p className="text-sm text-muted-foreground">
              © 2024 PeptiSync. All rights reserved.
            </p>
            
            <div className="mt-4 md:mt-0 flex space-x-6">
              <a 
                href="/legal" 
                className="text-sm text-muted-foreground hover:text-primary transition-colors duration-300"
              >
                Privacy
              </a>
              <a 
                href="/legal" 
                className="text-sm text-muted-foreground hover:text-primary transition-colors duration-300"
              >
                Terms
              </a>
              <a 
                href="/legal" 
                className="text-sm text-muted-foreground hover:text-primary transition-colors duration-300"
              >
                Cookies
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;