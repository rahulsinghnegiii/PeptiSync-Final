import { motion } from "framer-motion";
import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  badge?: string;
  className?: string;
}

export const PageHeader = ({ 
  title, 
  subtitle, 
  icon, 
  badge,
  className = "" 
}: PageHeaderProps) => {
  return (
    <section className={`relative py-20 overflow-hidden ${className}`}>
      {/* Background particles */}
      <div className="absolute inset-0" aria-hidden="true">
        {Array.from({ length: 10 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary rounded-full"
            initial={{ 
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
              y: Math.random() * 200,
              opacity: 0 
            }}
            animate={{
              y: [null, -50, -100],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          {badge && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-6"
            >
              {icon}
              <span className="text-sm font-medium">{badge}</span>
            </motion.div>
          )}
          
          <h1 className="text-4xl lg:text-6xl font-bold mb-6">
            {title.split(' ').map((word, i) => {
              const isGradient = word.toLowerCase().includes('peptisync') || 
                                 word.toLowerCase().includes('sync') ||
                                 i === title.split(' ').length - 1;
              return isGradient ? (
                <span key={i} className="text-gradient">{word} </span>
              ) : (
                <span key={i}>{word} </span>
              );
            })}
          </h1>
          
          {subtitle && (
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {subtitle}
            </p>
          )}
        </motion.div>
      </div>
    </section>
  );
};

