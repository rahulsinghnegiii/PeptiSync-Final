import { motion } from "framer-motion";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Zap, Heart, Sparkles, Clock, ArrowRight } from "lucide-react";

const protocolStacks = [
  {
    name: 'Performance Stack',
    peptides: ['BPC-157', 'TB-500', 'Ipamorelin'],
    duration: '8-12 weeks',
    benefit: 'Enhance athletic performance and recovery. Ideal for athletes and fitness enthusiasts.',
    icon: Zap,
    color: 'from-blue-500/20 to-cyan-500/20',
  },
  {
    name: 'Recovery Stack',
    peptides: ['BPC-157', 'GHK-Cu', 'Thymosin Beta-4'],
    duration: '4-8 weeks',
    benefit: 'Accelerate healing and tissue repair. Perfect for injury recovery and post-surgery.',
    icon: Heart,
    color: 'from-red-500/20 to-pink-500/20',
  },
  {
    name: 'Glow Stack',
    peptides: ['GHK-Cu', 'Epitalon', 'NAD+'],
    duration: '12 weeks',
    benefit: 'Skin rejuvenation and anti-aging. Achieve radiant, youthful-looking skin.',
    icon: Sparkles,
    color: 'from-purple-500/20 to-pink-500/20',
  },
  {
    name: 'Longevity Stack',
    peptides: ['NMN', 'Resveratrol', 'NAD+'],
    duration: 'Ongoing',
    benefit: 'Cellular health and longevity support. Optimize healthspan and vitality.',
    icon: Clock,
    color: 'from-green-500/20 to-emerald-500/20',
  },
];

export const ProtocolLibrary = () => {
  return (
    <div className="space-y-8">
      {/* Section Header */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h3 className="text-3xl font-bold mb-4">
          Preset <span className="text-gradient">Protocol Library</span>
        </h3>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Get started quickly with our expertly curated peptide stacks. Each protocol is designed for specific goals and includes detailed dosing guidelines.
        </p>
      </motion.div>

      {/* Protocol Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {protocolStacks.map((stack, index) => {
          const Icon = stack.icon;
          return (
            <motion.div
              key={stack.name}
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <Card className="glass border-glass-border h-full hover:border-primary/30 hover:-translate-y-1 transition-all duration-300 hover:shadow-xl group">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${stack.color} group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-6 h-6 text-primary" aria-hidden="true" />
                    </div>
                    <h4 className="text-xl font-bold group-hover:text-gradient transition-all duration-300">
                      {stack.name}
                    </h4>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Peptide Badges */}
                  <div className="flex flex-wrap gap-2">
                    {stack.peptides.map((peptide) => (
                      <Badge 
                        key={peptide} 
                        variant="secondary" 
                        className="glass bg-primary/10 text-primary border-primary/20"
                      >
                        {peptide}
                      </Badge>
                    ))}
                  </div>

                  {/* Benefit Description */}
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {stack.benefit}
                  </p>

                  {/* Duration */}
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-primary" aria-hidden="true" />
                    <span className="text-primary font-medium">
                      Duration: {stack.duration}
                    </span>
                  </div>
                </CardContent>

                <CardFooter>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                    onClick={() => window.location.href = '/auth'}
                  >
                    View in App
                    <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* CTA */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="text-center"
      >
        <p className="text-muted-foreground mb-4">
          Access our complete library of 20+ proven protocols
        </p>
        <Button variant="hero" size="lg" onClick={() => window.location.href = '/auth'}>
          Explore All Protocols
          <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
        </Button>
      </motion.div>
    </div>
  );
};
