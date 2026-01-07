import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

export default function ImportConflicts({ conflicts, importedData, onResolve, onCancel }) {
  const [resolutions, setResolutions] = useState(conflicts);

  const handleResolutionChange = (index, resolution) => {
    const updated = [...resolutions];
    updated[index] = { ...updated[index], resolution };
    setResolutions(updated);
  };

  const handleContinue = () => {
    onResolve(resolutions, importedData);
  };

  return (
    <div className="space-y-4">
      <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="text-white font-semibold mb-1">Duplicate subscriptions found</h3>
          <p className="text-sm text-gray-400">
            Choose how to handle {conflicts.length} conflicting subscription{conflicts.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {resolutions.map((conflict, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-4"
          >
            <div className="flex items-start gap-3 mb-4">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: conflict.existing.color || '#22c55e' }}
              >
                {conflict.existing.icon_url ? (
                  <img 
                    src={conflict.existing.icon_url} 
                    alt={conflict.existing.name} 
                    className="w-6 h-6 rounded-lg object-cover"
                  />
                ) : (
                  <span className="text-white font-bold text-sm">
                    {conflict.existing.name?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <h4 className="text-white font-semibold">{conflict.existing.name}</h4>
                <p className="text-sm text-gray-400">Already exists in your subscriptions</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-white/5 rounded-xl p-3">
                <p className="text-xs text-gray-500 mb-1">Current</p>
                <p className="text-white font-medium">${conflict.existing.price}</p>
                <p className="text-xs text-gray-400">{format(new Date(conflict.existing.next_billing_date), 'd MMM yyyy')}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3">
                <p className="text-xs text-gray-500 mb-1">Incoming</p>
                <p className="text-white font-medium">${conflict.incoming.price}</p>
                <p className="text-xs text-gray-400">{conflict.incoming.next_billing_date || 'No date'}</p>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => handleResolutionChange(index, 'skip')}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  conflict.resolution === 'skip' 
                    ? 'bg-white/10 border border-white/20' 
                    : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Skip (keep current)</span>
                  {conflict.resolution === 'skip' && <Check className="w-4 h-4 text-green-400" />}
                </div>
              </button>

              <button
                onClick={() => handleResolutionChange(index, 'replace')}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  conflict.resolution === 'replace' 
                    ? 'bg-white/10 border border-white/20' 
                    : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Replace with new</span>
                  {conflict.resolution === 'replace' && <Check className="w-4 h-4 text-green-400" />}
                </div>
              </button>

              <button
                onClick={() => handleResolutionChange(index, 'keep_both')}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  conflict.resolution === 'keep_both' 
                    ? 'bg-white/10 border border-white/20' 
                    : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Keep both</span>
                  {conflict.resolution === 'keep_both' && <Check className="w-4 h-4 text-green-400" />}
                </div>
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          onClick={onCancel}
          variant="outline"
          className="flex-1 border-white/10"
        >
          Cancel
        </Button>
        <Button
          onClick={handleContinue}
          className="flex-1 bg-green-500 hover:bg-green-600"
        >
          Continue Import
        </Button>
      </div>
    </div>
  );
}