import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';

const billingOptions = [
  { value: 'weekly', label: 'Week', interval: 1, unit: 'Week' },
  { value: 'monthly', label: 'Month', interval: 1, unit: 'Month' },
  { value: 'quarterly', label: 'Quarter', interval: 3, unit: 'Month' },
  { value: 'yearly', label: 'Year', interval: 1, unit: 'Year' },
];

export default function BillingCyclePicker({ value, onChange, isOpen, onClose }) {
  const selectedOption = billingOptions.find(opt => opt.value === value) || billingOptions[1];
  const [selectedIndex, setSelectedIndex] = useState(billingOptions.findIndex(opt => opt.value === value) || 1);

  const handleDone = () => {
    onChange(billingOptions[selectedIndex].value);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 300 }}
            animate={{ y: 0 }}
            exit={{ y: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#1a1325] rounded-t-3xl w-full max-w-lg p-6 pb-8"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Billing Cycle</h3>
              <button
                onClick={handleDone}
                className="text-green-400 font-semibold"
              >
                Done
              </button>
            </div>

            {/* Picker */}
            <div className="relative h-48 overflow-hidden">
              {/* Interval Column */}
              <div className="absolute left-1/4 transform -translate-x-1/2 h-full flex flex-col items-center justify-center">
                <div className="text-gray-600 text-sm mb-2">Day</div>
                {billingOptions.map((option, index) => (
                  <motion.div
                    key={option.value}
                    className={`text-center py-2 ${
                      selectedIndex === index ? 'text-white text-2xl font-semibold' : 'text-gray-600 text-lg'
                    }`}
                    animate={{
                      scale: selectedIndex === index ? 1.2 : 0.8,
                      opacity: selectedIndex === index ? 1 : 0.4,
                    }}
                  >
                    {option.interval}
                  </motion.div>
                ))}
              </div>

              {/* Unit Column */}
              <div className="absolute left-3/4 transform -translate-x-1/2 h-full">
                {billingOptions.map((option, index) => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedIndex(index)}
                    className={`w-full py-3 text-center transition-all ${
                      selectedIndex === index ? 'text-white text-xl font-semibold' : 'text-gray-600 text-base'
                    }`}
                  >
                    {option.unit}
                  </button>
                ))}
              </div>

              {/* Selection Indicator */}
              <div className="absolute inset-0 pointer-events-none flex items-center">
                <div className="w-full h-12 bg-white/5 border-y border-white/10" />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}