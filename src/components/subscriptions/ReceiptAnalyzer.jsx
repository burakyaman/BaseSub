import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, Loader2, CheckCircle2, XCircle, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

export default function ReceiptAnalyzer({ subscriptionId, onPriceDetected }) {
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileUpload = async (file) => {
    if (!file) return;

    setIsUploading(true);
    setError(null);
    setResult(null);

    try {
      // Upload file
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      // Analyze receipt with AI
      const analysis = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this receipt/invoice/billing statement and extract subscription pricing information.
        
Look for:
- Service/subscription name
- Price amount
- Billing date
- Any indication of price changes (old price vs new price)
- Currency

If this shows a price change, identify both old and new prices.
Return the information in a structured format.`,
        file_urls: [file_url],
        response_json_schema: {
          type: 'object',
          properties: {
            service_name: { type: 'string' },
            current_price: { type: 'number' },
            old_price: { type: 'number' },
            billing_date: { type: 'string' },
            currency: { type: 'string' },
            is_price_change: { type: 'boolean' },
            notes: { type: 'string' }
          },
          required: ['service_name', 'current_price']
        }
      });

      setResult(analysis);
      
      // If price change detected, notify parent
      if (analysis.is_price_change && analysis.old_price && onPriceDetected) {
        onPriceDetected({
          old_price: analysis.old_price,
          new_price: analysis.current_price,
          change_date: analysis.billing_date || new Date().toISOString().split('T')[0],
          notes: analysis.notes || 'Detected from receipt',
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to analyze receipt');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-white font-medium text-sm">Smart Price Detection</h4>
          <p className="text-xs text-gray-500">Upload receipt or bill</p>
        </div>
      </div>

      {/* Upload Area */}
      <div className="relative">
        <input
          type="file"
          accept="image/*,.pdf"
          onChange={handleFileChange}
          disabled={isUploading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          id="receipt-upload"
        />
        <label
          htmlFor="receipt-upload"
          className={`block border-2 border-dashed rounded-xl p-4 text-center transition-colors ${
            isUploading 
              ? 'border-gray-600 bg-white/5 cursor-not-allowed' 
              : 'border-white/20 hover:border-white/40 bg-white/5 cursor-pointer'
          }`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-6 h-6 text-green-400 animate-spin" />
              <p className="text-sm text-gray-400">Analyzing receipt...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="flex gap-3">
                <Upload className="w-6 h-6 text-gray-400" />
                <Camera className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-sm text-gray-300">Upload or take a photo</p>
              <p className="text-xs text-gray-500">PDF, PNG, JPG supported</p>
            </div>
          )}
        </label>
      </div>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-green-500/10 border border-green-500/20 rounded-xl p-3"
          >
            <div className="flex items-start gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-white font-medium">Receipt analyzed successfully</p>
                <p className="text-xs text-gray-400 mt-1">
                  Service: {result.service_name}
                </p>
                <p className="text-xs text-gray-400">
                  Price: ${result.current_price?.toFixed(2)} {result.currency || 'USD'}
                </p>
                {result.is_price_change && result.old_price && (
                  <p className="text-xs text-green-400 mt-1">
                    Price change detected: ${result.old_price.toFixed(2)} → ${result.current_price.toFixed(2)}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-red-500/10 border border-red-500/20 rounded-xl p-3"
          >
            <div className="flex items-start gap-2">
              <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-red-400">{error}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}