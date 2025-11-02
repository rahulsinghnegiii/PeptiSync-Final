import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Check, Clock } from "lucide-react";

interface PeptideEntry {
  id: number;
  name: string;
  dosage: string;
  time: string;
  taken: boolean;
}

const sampleEntries: PeptideEntry[] = [
  { id: 1, name: "BPC-157", dosage: "250mcg", time: "8:00 AM", taken: true },
  { id: 2, name: "TB-500", dosage: "2mg", time: "12:00 PM", taken: true },
  { id: 3, name: "GHK-Cu", dosage: "1mg", time: "4:00 PM", taken: false },
  { id: 4, name: "Thymosin Alpha-1", dosage: "1.6mg", time: "8:00 PM", taken: false },
];

const PeptideTrackerDemo = () => {
  const [entries, setEntries] = useState(sampleEntries);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % entries.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [entries.length]);

  const toggleEntry = (id: number) => {
    setEntries(prev =>
      prev.map(entry =>
        entry.id === id ? { ...entry, taken: !entry.taken } : entry
      )
    );
  };

  return (
    <div className="wellness-card p-6 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-foreground">Today's Protocol</h3>
        <div className="text-sm text-wellness-green-600 font-medium">
          {entries.filter(e => e.taken).length}/{entries.length} Complete
        </div>
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {entries.map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ 
                opacity: 1, 
                x: 0,
                scale: currentIndex === index ? 1.02 : 1,
              }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className={`wellness-card p-4 cursor-pointer transition-all ${
                currentIndex === index ? 'ring-2 ring-wellness-green-500' : ''
              }`}
              onClick={() => toggleEntry(entry.id)}
            >
              <div className="flex items-center gap-4">
                {/* Checkbox */}
                <motion.div
                  animate={{ scale: entry.taken ? [1, 1.2, 1] : 1 }}
                  transition={{ duration: 0.3 }}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    entry.taken
                      ? 'bg-wellness-green-500 border-wellness-green-500'
                      : 'border-gray-300'
                  }`}
                >
                  {entry.taken && <Check className="w-4 h-4 text-white" />}
                </motion.div>

                {/* Content */}
                <div className="flex-1">
                  <div className={`font-medium ${entry.taken ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                    {entry.name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {entry.dosage}
                  </div>
                </div>

                {/* Time */}
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  {entry.time}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Progress Bar */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: entries.filter(e => e.taken).length / entries.length }}
        className="mt-6 h-2 bg-wellness-green-500 rounded-full origin-left"
      />
    </div>
  );
};

export default PeptideTrackerDemo;
