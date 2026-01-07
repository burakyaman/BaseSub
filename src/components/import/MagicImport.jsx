import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Upload, FileText, Lock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import ImportConflicts from './ImportConflicts';

export default function MagicImport({ isOpen, onClose, onImportComplete }) {
  const [step, setStep] = useState('select'); // select, uploading, processing, conflicts, success
  const [importMethod, setImportMethod] = useState(null);
  const [importedData, setImportedData] = useState([]);
  const [conflicts, setConflicts] = useState([]);
  const [error, setError] = useState(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setStep('uploading');
    setError(null);

    try {
      // Upload file
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      setStep('processing');

      // Extract data from file
      const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: {
          type: 'object',
          properties: {
            subscriptions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  price: { type: 'number' },
                  billing_cycle: { type: 'string' },
                  next_billing_date: { type: 'string' },
                  category: { type: 'string' },
                  status: { type: 'string' }
                }
              }
            }
          }
        }
      });

      if (result.status === 'success' && result.output) {
        const subs = result.output.subscriptions || [];
        await processImportedData(subs);
      } else {
        throw new Error(result.details || 'Failed to extract data from file');
      }
    } catch (err) {
      setError(err.message || 'Failed to import file');
      setStep('select');
    }
  };

  const processImportedData = async (newSubs) => {
    try {
      // Get existing subscriptions
      const existing = await base44.entities.Subscription.list();
      
      // Find conflicts (same name or similar)
      const foundConflicts = [];
      const toImport = [];

      newSubs.forEach(newSub => {
        const conflict = existing.find(ex => 
          ex.name.toLowerCase() === newSub.name.toLowerCase()
        );

        if (conflict) {
          foundConflicts.push({
            existing: conflict,
            incoming: newSub,
            resolution: 'skip' // default
          });
        } else {
          toImport.push(newSub);
        }
      });

      setImportedData(toImport);
      setConflicts(foundConflicts);

      if (foundConflicts.length > 0) {
        setStep('conflicts');
      } else {
        await finalizeImport(toImport);
      }
    } catch (err) {
      setError('Failed to process imported data');
      setStep('select');
    }
  };

  const finalizeImport = async (subsToImport) => {
    try {
      // Normalize data
      const normalized = subsToImport.map(sub => ({
        name: sub.name,
        price: parseFloat(sub.price) || 0,
        billing_cycle: sub.billing_cycle || 'monthly',
        next_billing_date: sub.next_billing_date || new Date().toISOString().split('T')[0],
        category: sub.category || 'other',
        status: sub.status || 'active',
        color: sub.color || '#22c55e',
      }));

      await base44.entities.Subscription.bulkCreate(normalized);
      setStep('success');
      
      setTimeout(() => {
        onImportComplete?.();
        onClose();
      }, 2000);
    } catch (err) {
      setError('Failed to import subscriptions');
      setStep('select');
    }
  };

  const handleConflictsResolved = async (resolvedConflicts, importData) => {
    const toImport = [...importData];
    
    for (const conflict of resolvedConflicts) {
      if (conflict.resolution === 'replace') {
        await base44.entities.Subscription.update(conflict.existing.id, conflict.incoming);
      } else if (conflict.resolution === 'keep_both') {
        toImport.push(conflict.incoming);
      }
      // 'skip' means do nothing
    }

    await finalizeImport(toImport);
  };

  const resetImport = () => {
    setStep('select');
    setImportMethod(null);
    setImportedData([]);
    setConflicts([]);
    setError(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-[#0a0a0f] z-50 overflow-y-auto"
        >
          <div className="min-h-full max-w-lg mx-auto px-4 py-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <button 
                onClick={onClose}
                className="px-5 py-2 bg-white/5 hover:bg-white/10 rounded-full text-white transition-colors"
              >
                Cancel
              </button>
              <h1 className="text-lg font-semibold text-white">Import Subscriptions</h1>
              <div className="w-20" />
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mb-4 flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-400 font-medium">Import failed</p>
                  <p className="text-sm text-red-300/70 mt-1">{error}</p>
                </div>
              </motion.div>
            )}

            {/* Content based on step */}
            <AnimatePresence mode="wait">
              {step === 'select' && (
                <motion.div
                  key="select"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  {/* Magic Import (Premium) */}
                  <button className="w-full bg-gradient-to-br from-purple-500/20 to-purple-500/5 border border-purple-500/30 rounded-2xl p-6 text-left relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-6 h-6 text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-white font-semibold">Magic Import</h3>
                          <Lock className="w-4 h-4 text-purple-400" />
                        </div>
                        <p className="text-sm text-gray-400">
                          Automatically detect App Store subscriptions from your Apple account
                        </p>
                        <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-purple-500/20 rounded-full">
                          <Sparkles className="w-3 h-3 text-purple-400" />
                          <span className="text-xs text-purple-300 font-medium">Premium Feature</span>
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* File Upload */}
                  <div className="relative">
                    <input
                      type="file"
                      accept=".csv,.json,.pdf"
                      onChange={handleFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="block w-full bg-white/5 border border-white/10 rounded-2xl p-6 cursor-pointer hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
                          <Upload className="w-6 h-6 text-green-400" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-white font-semibold mb-2">Upload a file</h3>
                          <p className="text-sm text-gray-400">
                            Import from CSV, JSON, or bank statement (PDF)
                          </p>
                        </div>
                      </div>
                    </label>
                  </div>

                  {/* Manual Entry */}
                  <button 
                    onClick={onClose}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-left hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-6 h-6 text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-semibold mb-2">Add manually</h3>
                        <p className="text-sm text-gray-400">
                          Enter subscription details one by one
                        </p>
                      </div>
                    </div>
                  </button>

                  {/* Info */}
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4">
                    <p className="text-sm text-gray-300 leading-relaxed">
                      <strong className="text-white">Tip:</strong> For CSV files, include columns: name, price, billing_cycle, next_billing_date, category
                    </p>
                  </div>
                </motion.div>
              )}

              {(step === 'uploading' || step === 'processing') && (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-20"
                >
                  <Loader2 className="w-12 h-12 text-green-400 animate-spin mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {step === 'uploading' ? 'Uploading...' : 'Processing your data...'}
                  </h3>
                  <p className="text-gray-400">This may take a moment</p>
                </motion.div>
              )}

              {step === 'conflicts' && (
                <motion.div
                  key="conflicts"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <ImportConflicts
                    conflicts={conflicts}
                    importedData={importedData}
                    onResolve={handleConflictsResolved}
                    onCancel={resetImport}
                  />
                </motion.div>
              )}

              {step === 'success' && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-20"
                >
                  <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Import successful!</h3>
                  <p className="text-gray-400">Your subscriptions have been added</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}