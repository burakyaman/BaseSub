import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Sparkles, ChevronRight, ChevronDown, ArrowDown, ArrowUp, Download } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { Button } from "@/components/ui/button";

import OrbitVisualization from '@/components/subscriptions/OrbitVisualization';
import AddSubscriptionModal from '@/components/subscriptions/AddSubscriptionModal';
import SubscriptionDetail from '@/components/subscriptions/SubscriptionDetail';
import MagicImport from '@/components/import/MagicImport';

export default function Home() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState(null);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [sortOrder, setSortOrder] = useState('next'); // 'next' | 'name' | 'price'
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedListId, setSelectedListId] = useState('all'); // 'all' or specific list id

  const queryClient = useQueryClient();

  const { data: subscriptions = [], isLoading } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: () => base44.entities.Subscription.list('-next_billing_date'),
  });

  const { data: lists = [] } = useQuery({
    queryKey: ['lists'],
    queryFn: () => base44.entities.List.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Subscription.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      setShowAddModal(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Subscription.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      setEditingSubscription(null);
      setShowAddModal(false);
      setSelectedSubscription(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Subscription.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      setSelectedSubscription(null);
    },
  });

  // Calculate statistics
  const stats = useMemo(() => {
    const active = subscriptions.filter(s => s.status === 'active' || s.status === 'trial');
    
    const monthlyTotal = active.reduce((sum, sub) => {
      const multiplier = {
        weekly: 4,
        monthly: 1,
        quarterly: 1/3,
        yearly: 1/12,
      };
      return sum + (sub.price * (multiplier[sub.billing_cycle] || 1));
    }, 0);

    const yearlyTotal = monthlyTotal * 12;

    const upcoming = active.filter(sub => {
      const days = Math.ceil((new Date(sub.next_billing_date) - new Date()) / (1000 * 60 * 60 * 24));
      return days <= 7 && days >= 0;
    });

    const trials = subscriptions.filter(s => s.status === 'trial' || s.is_free_trial);

    return {
      total: active.length,
      monthlyTotal,
      yearlyTotal,
      upcoming: upcoming.length,
      upcomingAmount: upcoming.reduce((sum, s) => sum + s.price, 0),
      trials: trials.length,
    };
  }, [subscriptions]);

  // Filter and group subscriptions by list
  const filteredSubscriptions = useMemo(() => {
    if (selectedListId === 'all') return subscriptions;
    return subscriptions.filter(s => s.list_id === selectedListId);
  }, [subscriptions, selectedListId]);

  // Group and sort subscriptions
  const { freeTrials, activeSubscriptions, groupedByList } = useMemo(() => {
    const trials = filteredSubscriptions.filter(s => s.status === 'trial' || s.is_free_trial);
    const active = filteredSubscriptions.filter(s => s.status === 'active');
    
    const sortFn = (a, b) => {
      if (sortOrder === 'next') {
        return new Date(a.next_billing_date) - new Date(b.next_billing_date);
      } else if (sortOrder === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortOrder === 'price') {
        return b.price - a.price;
      }
      return 0;
    };

    // Group by list
    const grouped = {};
    if (selectedListId === 'all' && lists.length > 0) {
      lists.forEach(list => {
        const listSubs = active.filter(s => s.list_id === list.id);
        if (listSubs.length > 0) {
          grouped[list.id] = {
            list,
            subscriptions: listSubs.sort(sortFn)
          };
        }
      });
      // Add unassigned subscriptions
      const unassigned = active.filter(s => !s.list_id);
      if (unassigned.length > 0) {
        grouped['unassigned'] = {
          list: { name: 'Other', icon: '📦', color: '#6b7280' },
          subscriptions: unassigned.sort(sortFn)
        };
      }
    }
    
    return {
      freeTrials: trials.sort(sortFn),
      activeSubscriptions: active.sort(sortFn),
      groupedByList: grouped,
    };
  }, [filteredSubscriptions, sortOrder, lists, selectedListId]);

  const handleSave = (data) => {
    if (editingSubscription) {
      updateMutation.mutate({ id: editingSubscription.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (subscription) => {
    setEditingSubscription(subscription);
    setShowAddModal(true);
    setSelectedSubscription(null);
  };

  const handleDelete = (subscription) => {
    if (window.confirm(`Are you sure you want to delete ${subscription.name}?`)) {
      deleteMutation.mutate(subscription.id);
    }
  };

  const handleTogglePause = (subscription) => {
    const newStatus = subscription.status === 'paused' ? 'active' : 'paused';
    updateMutation.mutate({ 
      id: subscription.id, 
      data: { ...subscription, status: newStatus } 
    });
  };

  const SubscriptionItem = ({ subscription }) => {
    const daysUntilRenewal = differenceInDays(
      new Date(subscription.next_billing_date),
      new Date()
    );

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => setSelectedSubscription(subscription)}
        className="flex items-center gap-4 py-4 cursor-pointer hover:bg-white/5 rounded-xl px-3 transition-colors"
      >
        {/* Icon */}
        <div 
          className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: subscription.color || '#22c55e' }}
        >
          {subscription.icon_url ? (
            <img 
              src={subscription.icon_url} 
              alt={subscription.name} 
              className="w-9 h-9 rounded-xl object-cover"
            />
          ) : (
            <span className="text-white font-bold text-xl">
              {subscription.name?.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-white text-base mb-0.5">{subscription.name}</h3>
          <p className="text-sm text-gray-500">
            Renews in {daysUntilRenewal} day{daysUntilRenewal !== 1 ? 's' : ''} · {format(new Date(subscription.next_billing_date), 'd MMM')}
          </p>
        </div>

        {/* Price */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="font-medium text-white text-base">${subscription.price.toFixed(2)}</span>
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0f0a1f] text-white">
      {/* Gradient background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a0f2e] via-[#0f0a1f] to-[#0f0a1f]" />
      </div>
      
      <div className="relative max-w-lg mx-auto px-4 py-6 pb-24">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <button className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 rounded-full transition-all shadow-lg shadow-purple-500/20">
            <Sparkles className="w-4 h-4" />
            <span className="font-semibold">Upgrade</span>
          </button>
          <button
            onClick={() => {
              setEditingSubscription(null);
              setShowAddModal(true);
            }}
            className="w-12 h-12 rounded-full bg-[#1a1425] hover:bg-[#252030] flex items-center justify-center transition-colors"
          >
            <Plus className="w-6 h-6" />
          </button>
        </motion.div>

        {/* Orbit Visualization */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8"
        >
          <OrbitVisualization 
            subscriptions={subscriptions} 
            totalYearly={stats.yearlyTotal}
          />
        </motion.div>

        {/* Stats Below Orbit */}
        <div className="flex items-center justify-between mb-6 px-2">
          <div>
            <div className="text-5xl font-bold mb-1">{stats.total}</div>
            <div className="relative">
              <select
                value={selectedListId}
                onChange={(e) => setSelectedListId(e.target.value)}
                className="flex items-center gap-1 text-gray-400 text-sm hover:text-white transition-colors bg-transparent border-none outline-none cursor-pointer appearance-none pr-5"
              >
                <option value="all" className="bg-[#0f0a1f]">Personal ◇</option>
                {lists.map(list => (
                  <option key={list.id} value={list.id} className="bg-[#0f0a1f]">
                    {list.icon} {list.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold mb-1">${stats.yearlyTotal.toFixed(2)}</div>
            <div className="text-gray-400 text-sm">Total yearly</div>
          </div>
        </div>

        {/* Import Guide */}
        {subscriptions.length === 0 && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => setShowImportModal(true)}
            className="w-full flex items-center gap-3 bg-gradient-to-br from-purple-500/20 to-purple-500/5 border border-purple-500/20 rounded-2xl p-4 mb-6 transition-all hover:from-purple-500/30 hover:to-purple-500/10"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Download className="w-5 h-5 text-purple-400" />
            </div>
            <div className="flex-1 text-left">
              <div className="font-medium text-white">Import subscriptions</div>
              <div className="text-sm text-gray-400">Quick start with Magic Import</div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-500" />
          </motion.button>
        )}

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white/5 rounded-2xl h-16 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Free Trials Section */}
            {freeTrials.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3 px-2">
                  <span className="text-gray-400">Free Trials</span>
                  <span className="text-gray-400">${freeTrials.reduce((sum, s) => sum + s.price, 0).toFixed(2)}</span>
                </div>
                <div className="space-y-1">
                  {freeTrials.map((sub) => (
                    <SubscriptionItem key={sub.id} subscription={sub} />
                  ))}
                </div>
              </div>
            )}

            {/* Active Section - Grouped by List or Flat */}
            {activeSubscriptions.length > 0 && (
              <>
                {selectedListId === 'all' && Object.keys(groupedByList).length > 0 ? (
                  // Show grouped by lists
                  Object.entries(groupedByList).map(([key, { list, subscriptions }]) => (
                    <div key={key} className="mb-6 last:mb-0">
                      <div className="flex items-center justify-between mb-3 px-2">
                        <div className="flex items-center gap-2">
                          <span 
                            className="w-6 h-6 rounded-lg flex items-center justify-center text-sm"
                            style={{ backgroundColor: `${list.color}20` }}
                          >
                            {list.icon}
                          </span>
                          <span className="text-gray-400">{list.name}</span>
                          <span className="text-gray-600 text-sm">
                            ${subscriptions.reduce((sum, s) => sum + s.price, 0).toFixed(2)}
                          </span>
                        </div>
                        <span className="text-gray-600 text-sm">{subscriptions.length}</span>
                      </div>
                      <div className="space-y-1">
                        {subscriptions.map((sub) => (
                          <SubscriptionItem key={sub.id} subscription={sub} />
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  // Show flat list
                  <div>
                    <div className="flex items-center justify-between mb-3 px-2">
                      <span className="text-gray-400">Active</span>
                      <button 
                        onClick={() => setSortOrder(sortOrder === 'next' ? 'price' : 'next')}
                        className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors"
                      >
                        <span>Next</span>
                        {sortOrder === 'next' ? <ArrowDown className="w-3 h-3" /> : <ArrowUp className="w-3 h-3" />}
                      </button>
                    </div>
                    <div className="space-y-1">
                      {activeSubscriptions.map((sub) => (
                        <SubscriptionItem key={sub.id} subscription={sub} />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Empty State */}
            {freeTrials.length === 0 && activeSubscriptions.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                  <Plus className="w-8 h-8 text-gray-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-400 mb-2">No subscriptions yet</h3>
                <p className="text-sm text-gray-600 mb-4">Add your first subscription to start tracking</p>
                <Button
                  onClick={() => setShowAddModal(true)}
                  className="bg-green-500 hover:bg-green-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Subscription
                </Button>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <AddSubscriptionModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingSubscription(null);
        }}
        onSave={handleSave}
        editingSubscription={editingSubscription}
      />

      {/* Detail Modal */}
      <SubscriptionDetail
        subscription={selectedSubscription}
        isOpen={!!selectedSubscription}
        onClose={() => setSelectedSubscription(null)}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onTogglePause={handleTogglePause}
      />

      {/* Import Modal */}
      <MagicImport
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImportComplete={() => {
          queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
          setShowImportModal(false);
        }}
      />
    </div>
  );
}