import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Calendar, MapPin, Clock, Syringe } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

export const TrackerDemo = () => {
  const { theme } = useTheme();

  return (
    <div className="grid md:grid-cols-2 gap-8 items-center">
      {/* Text Content */}
      <motion.div
        initial={{ x: -50, opacity: 0 }}
        whileInView={{ x: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h3 className="text-3xl font-bold mb-4">
          Track Every <span className="text-gradient">Detail</span>
        </h3>
        <p className="text-lg text-muted-foreground mb-6">
          Log your peptide doses with precision. Track dose amount, injection time, site location, and notes all in one place. Never miss a dose with smart reminders and detailed history.
        </p>
        <ul className="space-y-3 mb-6">
          <li className="flex items-start gap-3">
            <Syringe className="w-5 h-5 text-primary flex-shrink-0 mt-1" aria-hidden="true" />
            <span className="text-muted-foreground">
              Log multiple peptides simultaneously with custom dosing schedules
            </span>
          </li>
          <li className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-1" aria-hidden="true" />
            <span className="text-muted-foreground">
              Track injection sites to rotate properly and avoid tissue damage
            </span>
          </li>
          <li className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-primary flex-shrink-0 mt-1" aria-hidden="true" />
            <span className="text-muted-foreground">
              Set reminders and get notifications so you never miss a dose
            </span>
          </li>
        </ul>
        <Button variant="hero" size="lg" onClick={() => window.location.href = '/auth'}>
          View in App
          <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
        </Button>
      </motion.div>

      {/* Mockup/Screenshot */}
      <motion.div
        initial={{ x: 50, opacity: 0 }}
        whileInView={{ x: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="relative"
      >
        <Card className="glass border-glass-border p-6 rounded-2xl shadow-2xl">
          {/* Mockup Header */}
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-semibold">Recent Entries</h4>
            <Calendar className="w-5 h-5 text-primary" aria-hidden="true" />
          </div>

          {/* Sample Entry */}
          <div className="space-y-4">
            <div className="glass border-glass-border rounded-lg p-4 hover:border-primary/30 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h5 className="font-semibold text-primary mb-1">Semaglutide</h5>
                  <p className="text-sm text-muted-foreground">GLP-1 Receptor Agonist</p>
                </div>
                <span className="text-xs text-muted-foreground">Today</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Syringe className="w-4 h-4 text-primary" aria-hidden="true" />
                  <span className="text-muted-foreground">0.5mg</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" aria-hidden="true" />
                  <span className="text-muted-foreground">9:00 AM</span>
                </div>
                <div className="flex items-center gap-2 col-span-2">
                  <MapPin className="w-4 h-4 text-primary" aria-hidden="true" />
                  <span className="text-muted-foreground">Left Abdomen</span>
                </div>
              </div>
            </div>

            {/* Additional Sample Entries */}
            <div className="glass border-glass-border rounded-lg p-4 opacity-60">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h5 className="font-semibold">BPC-157</h5>
                  <p className="text-sm text-muted-foreground">Body Protection Compound</p>
                </div>
                <span className="text-xs text-muted-foreground">Yesterday</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Syringe className="w-4 h-4 text-primary" aria-hidden="true" />
                  <span className="text-muted-foreground">250mcg</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" aria-hidden="true" />
                  <span className="text-muted-foreground">8:00 PM</span>
                </div>
              </div>
            </div>

            <div className="glass border-glass-border rounded-lg p-4 opacity-40">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h5 className="font-semibold">TB-500</h5>
                  <p className="text-sm text-muted-foreground">Thymosin Beta-4</p>
                </div>
                <span className="text-xs text-muted-foreground">2 days ago</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Syringe className="w-4 h-4 text-primary" aria-hidden="true" />
                  <span className="text-muted-foreground">2mg</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" aria-hidden="true" />
                  <span className="text-muted-foreground">7:30 AM</span>
                </div>
              </div>
            </div>
          </div>

          {/* View All Button */}
          <Button variant="outline" className="w-full mt-4" size="sm">
            View All Entries
          </Button>
        </Card>

        {/* Decorative Elements */}
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/10 rounded-full blur-3xl" aria-hidden="true" />
        <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-primary/5 rounded-full blur-3xl" aria-hidden="true" />
      </motion.div>
    </div>
  );
};
