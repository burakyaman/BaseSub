import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, ArrowRightLeft, Plus, X, Check } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function PriceHistory({ subscriptionId, currentPrice }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    old_price: currentPrice,
    new_price: '',
    change_date: new Date().toISOString().split('T')[0],
    change_type: 'increase',
    notes: '',
    from_service: '',
  });

  const queryClient = useQueryClient();

  const { data: history = [] } = useQuery({
    queryKey: ['price-history', subscriptionId],
    queryFn: async () => {
      const all = await base44.entities.PriceHistory.list();
      return all.filter(h => h.subscription_id === subscriptionId)
        .sort((a, b) => new Date(b.change_date) - new Date(a.change_date));
    },
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.PriceHistory.create({
      ...data,
      subscription_id: subscriptionId,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['price-history', subscriptionId] });
      setShowAddForm(false);
      setFormData({
        old_price: currentPrice,
        new_price: '',
        change_date: new Date().toISOString().split('T')[0],
        change_type: 'increase',
        notes: '',
        from_service: '',
      });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate({
      ...formData,
      old_price: parseFloat(formData.old_price),
      new_price: parseFloat(formData.new_price),
    });
  };

  // Calculate total savings
  const totalSavings = history.reduce((sum, item) => {
    if (item.change_type === 'decrease' || item.change_type === 'switch') {
      return sum + (item.old_price - item.new_price);
    }
    return sum;
  }, 0);

  const getChangeIcon = (type) => {
    if (type === 'increase') return <TrendingUp className="w-4 h-4 text-red-400" />;
    if (type === 'decrease') return <TrendingDown className="w-4 h-4 text-green-400" />;
    return <ArrowRightLeft className="w-4 h-4 text-blue-400" />;
  };

  const getChangeColor = (type) => {
    if (type === 'increase') return 'text-red-400';
    if (type === 'decrease') return 'text-green-400';
    return 'text-blue-400';
  };

  return (
    <div className="space-y-4">
      {/* Header with total savings */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-white font-semibold">Price History</h3>
          {totalSavings > 0 && (
            <p className="text-sm text-green-400">
              Total saved: ${totalSavings.toFixed(2)}
            </p>
          )}
        </div>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/15 flex items-center justify-center transition-colors"
          >
            <Plus className="w-4 h-4 text-white" />
          </button>
        )}
      </div>

      {/* Add Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3"
          >
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, change_type: 'decrease' })}
                className={`flex-1 py-2 px-3 rounded-lg text-sm transition-colors ${
                  formData.change_type === 'decrease'
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-white/5 text-gray-400'
                }`}
              >
                <TrendingDown className="w-4 h-4 inline mr-1" />
                Decrease
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, change_type: 'increase' })}
                className={`flex-1 py-2 px-3 rounded-lg text-sm transition-colors ${
                  formData.change_type === 'increase'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'bg-white/5 text-gray-400'
                }`}
              >
                <TrendingUp className="w-4 h-4 inline mr-1" />
                Increase
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, change_type: 'switch' })}
                className={`flex-1 py-2 px-3 rounded-lg text-sm transition-colors ${
                  formData.change_type === 'switch'
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'bg-white/5 text-gray-400'
                }`}
              >
                <ArrowRightLeft className="w-4 h-4 inline mr-1" />
                Switch
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Old Price</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.old_price}
                  onChange={(e) => setFormData({ ...formData, old_price: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">New Price</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.new_price}
                  onChange={(e) => setFormData({ ...formData, new_price: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1 block">Date</label>
              <Input
                type="date"
                value={formData.change_date}
                onChange={(e) => setFormData({ ...formData, change_date: e.target.value })}
                className="bg-white/5 border-white/10 text-white"
                required
              />
            </div>

            {formData.change_type === 'switch' && (
              <div>
                <label className="text-xs text-gray-400 mb-1 block">From Service</label>
                <Input
                  value={formData.from_service}
                  onChange={(e) => setFormData({ ...formData, from_service: e.target.value })}
                  placeholder="e.g., Netflix → Disney+"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            )}

            <div>
              <label className="text-xs text-gray-400 mb-1 block">Notes (optional)</label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Why did the price change?"
                className="bg-white/5 border-white/10 text-white h-20"
              />
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                className="flex-1 bg-green-500 hover:bg-green-600"
              >
                <Check className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button
                type="button"
                onClick={() => setShowAddForm(false)}
                variant="outline"
                className="border-white/10"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* History List */}
      <div className="space-y-2">
        {history.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <p className="text-sm">No price changes recorded yet</p>
          </div>
        ) : (
          history.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white/5 border border-white/10 rounded-xl p-3"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                  {getChangeIcon(item.change_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-white font-medium">
                      ${item.old_price.toFixed(2)}
                    </span>
                    <span className="text-gray-500">→</span>
                    <span className={`font-semibold ${getChangeColor(item.change_type)}`}>
                      ${item.new_price.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    {format(new Date(item.change_date), 'MMM d, yyyy')}
                  </p>
                  {item.change_type === 'switch' && item.from_service && (
                    <p className="text-xs text-blue-400 mt-1">{item.from_service}</p>
                  )}
                  {item.notes && (
                    <p className="text-xs text-gray-500 mt-1">{item.notes}</p>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  {item.change_type === 'decrease' || item.change_type === 'switch' ? (
                    <span className="text-sm font-medium text-green-400">
                      -${(item.old_price - item.new_price).toFixed(2)}
                    </span>
                  ) : (
                    <span className="text-sm font-medium text-red-400">
                      +${(item.new_price - item.old_price).toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}