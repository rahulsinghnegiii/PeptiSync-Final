import { motion } from "framer-motion";
import { useState } from "react";
import { Zap, Heart, Sparkles, ChevronRight } from "lucide-react";

interface Protocol {
  id: number;
  name: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  peptides: string[];
  description: string;
}

const protocols: Protocol[] = [
  {
    id: 1,
    name: "Performance",
    icon: <Zap className="w-6 h-6" />,
    color: "text-wellness-green-600",
    bgColor: "bg-wellness-green-50",
    peptides: ["BPC-157", "TB-500", "Ipamorelin"],
    description: "Optimize athletic performance and recovery",
  },
  {
    id: 2,
    name: "Recovery",
    icon: <Heart className="w-6 h-6" />,
    color: "text-wellness-blue-600",
    bgColor: "bg-wellness-blue-50",
    peptides: ["BPC-157", "TB-500", "GHK-Cu"],
    description: "Accelerate healing and tissue repair",
  },
  {
    id: 3,
    name: "Glow",
    icon: <Sparkles className="w-6 h-6" />,
    color: "text-wellness-coral-600",
    bgColor: "bg-wellness-coral-50",
    peptides: ["GHK-Cu", "Epithalon", "Thymosin Alpha-1"],
    description: "Enhance skin health and anti-aging",
  },
];

const ProtocolLibraryDemo = () => {
  const [selectedProtocol, setSelectedProtocol] = useState<Protocol | null>(protocols[0]);

  return (
    <div className="wellness-card p-6 max-w-2xl mx-auto">
      <h3 className="text-xl font-semibold text-foreground mb-6">Protocol Library</h3>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        {protocols.map((protocol) => (
          <motion.div
            key={protocol.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedProtocol(protocol)}
            className={`wellness-card-hover p-4 cursor-pointer transition-all ${
              selectedProtocol?.id === protocol.id
                ? 'ring-2 ring-wellness-green-500 shadow-medium'
                : ''
            }`}
          >
            <div className={`w-12 h-12 rounded-xl ${protocol.bgColor} ${protocol.color} flex items-center justify-center mb-3`}>
              {protocol.icon}
            </div>
            <h4 className="font-semibold text-foreground mb-1">{protocol.name}</h4>
            <p className="text-xs text-muted-foreground">{protocol.peptides.length} peptides</p>
          </motion.div>
        ))}
      </div>

      {/* Selected Protocol Details */}
      {selectedProtocol && (
        <motion.div
          key={selectedProtocol.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={`${selectedProtocol.bgColor} rounded-xl p-6`}
        >
          <div className="flex items-start gap-4 mb-4">
            <div className={`w-14 h-14 rounded-xl bg-white ${selectedProtocol.color} flex items-center justify-center shadow-soft`}>
              {selectedProtocol.icon}
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-foreground mb-1">
                {selectedProtocol.name} Stack
              </h4>
              <p className="text-sm text-muted-foreground">
                {selectedProtocol.description}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium text-foreground mb-2">Included Peptides:</div>
            {selectedProtocol.peptides.map((peptide, index) => (
              <motion.div
                key={peptide}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-2 bg-white rounded-lg p-3"
              >
                <div className="w-2 h-2 rounded-full bg-wellness-green-500" />
                <span className="text-sm font-medium text-foreground">{peptide}</span>
                <ChevronRight className="w-4 h-4 ml-auto text-muted-foreground" />
              </motion.div>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="mt-4 w-full bg-wellness-green-500 hover:bg-wellness-green-600 text-white font-medium py-3 rounded-lg transition-colors"
          >
            Use This Protocol
          </motion.button>
        </motion.div>
      )}
    </div>
  );
};

export default ProtocolLibraryDemo;
