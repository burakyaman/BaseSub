import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Delete } from 'lucide-react';

const numpadButtons = [
  { value: '1', label: '1', sublabel: '' },
  { value: '2', label: '2', sublabel: 'ABC' },
  { value: '3', label: '3', sublabel: 'DEF' },
  { value: '4', label: '4', sublabel: 'GHI' },
  { value: '5', label: '5', sublabel: 'JKL' },
  { value: '6', label: '6', sublabel: 'MNO' },
  { value: '7', label: '7', sublabel: 'PQRS' },
  { value: '8', label: '8', sublabel: 'TUV' },
  { value: '9', label: '9', sublabel: 'WXYZ' },
  { value: '.', label: '.', sublabel: '' },
  { value: '0', label: '0', sublabel: '' },
  { value: 'delete', label: 'delete', sublabel: '' },
];

export default function NumpadInput({ value, onChange, isOpen, onClose, currency = '$' }) {
  const [localValue, setLocalValue] = useState(value?.toString() || '');

  useEffect(() => {
    setLocalValue(value?.toString() || '');
  }, [value]);

  const handleButtonClick = (buttonValue) => {
    if (buttonValue === 'delete') {
      const newValue = localValue.slice(0, -1);
      setLocalValue(newValue);
      onChange(newValue);
    } else if (buttonValue === '.') {
      if (!localValue.includes('.')) {
        const newValue = localValue + '.';
        setLocalValue(newValue);
        onChange(newValue);
      }
    } else {
      const newValue = localValue + buttonValue;
      setLocalValue(newValue);
      onChange(newValue);
    }
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
            initial={{ y: 400 }}
            animate={{ y: 0 }}
            exit={{ y: 400 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#0a0a0f] w-full max-w-lg pb-8"
          >
            {/* Value Display */}
            <div className="bg-[#1a1325] border-b border-white/10 p-6">
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-gray-500 text-2xl">{currency}</span>
                <span className="text-white text-4xl font-bold">
                  {localValue || '0'}
                </span>
              </div>
            </div>

            {/* Numpad Grid */}
            <div className="grid grid-cols-3 gap-3 p-4">
              {numpadButtons.map((button) => (
                <button
                  key={button.value}
                  onClick={() => handleButtonClick(button.value)}
                  className={`
                    h-16 rounded-xl flex flex-col items-center justify-center
                    transition-all active:scale-95
                    ${button.value === 'delete' 
                      ? 'bg-transparent' 
                      : 'bg-white/10 hover:bg-white/15'
                    }
                  `}
                >
                  {button.value === 'delete' ? (
                    <Delete className="w-6 h-6 text-gray-400" />
                  ) : (
                    <>
                      <span className="text-white text-2xl font-semibold">
                        {button.label}
                      </span>
                      {button.sublabel && (
                        <span className="text-gray-600 text-xs">
                          {button.sublabel}
                        </span>
                      )}
                    </>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}