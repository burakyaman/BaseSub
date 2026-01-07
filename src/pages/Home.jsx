import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Calendar, TrendingUp, CreditCard, Bell, Filter, List, LayoutGrid } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import OrbitVisualization from '@/components/subscriptions/OrbitVisualization';
import SubscriptionCard from '@/components/subscriptions/SubscriptionCard';
import StatsCard from '@/components/subscriptions/StatsCard';
import AddSubscriptionModal from '@/components/subscriptions/AddSubscriptionModal';
import SubscriptionDetail from '@/components/subscriptions/SubscriptionDetail';

export default function Home() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState(null);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [viewMode, setViewMode] = useState('orbit'); // 'orbit' | 'list'
  const [filter, setFilter] = useState('all'); // 'all' | 'active' | 'upcoming' | 'trial'

  const queryClient = useQueryClient();

  const { data: subscriptions = [], isLoading } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: () => base44.entities.Subscription.list('-next_billing_date'),
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

  // Filter subscriptions
  const filteredSubscriptions = useMemo(() => {
    const active = subscriptions.filter(s => s.status !== 'cancelled');
    
    switch (filter) {
      case 'active':
        return active.filter(s => s.status === 'active');
      case 'upcoming':
        return active.filter(sub => {
          const days = Math.ceil((new Date(sub.next_billing_date) - new Date()) / (1000 * 60 * 60 * 24));
          return days <= 7 && days >= 0;
        });
      case 'trial':
        return subscriptions.filter(s => s.status === 'trial' || s.is_free_trial);
      default:
        return active;
    }
  }, [subscriptions, filter]);

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#0d2847] to-[#0f3460] text-white">
      {/* Underwater background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Light rays from surface */}
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-cyan-400/20 via-cyan-400/5 to-transparent transform -skew-x-12" />
        <div className="absolute top-0 left-2/4 w-px h-full bg-gradient-to-b from-cyan-400/10 via-cyan-400/3 to-transparent transform skew-x-12" />
        <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-cyan-400/15 via-cyan-400/5 to-transparent transform -skew-x-6" />
        
        {/* Animated bubbles */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={`bubble-${i}`}
            className="absolute w-2 h-2 rounded-full bg-cyan-400/30 backdrop-blur-sm"
            style={{
              left: `${Math.random() * 100}%`,
              bottom: `-20px`,
            }}
            animate={{
              y: [-20, -window.innerHeight - 100],
              x: [0, (Math.random() - 0.5) * 100],
              opacity: [0, 0.6, 0],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 8 + Math.random() * 10,
              repeat: Infinity,
              delay: i * 1.5,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      
      <div className="relative max-w-lg mx-auto px-4 py-6 pb-24">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div>
            <h1 className="text-2xl font-bold">Orbit</h1>
            <p className="text-sm text-gray-500">Track your subscriptions</p>
          </div>
          <Button
            onClick={() => {
              setEditingSubscription(null);
              setShowAddModal(true);
            }}
            className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 rounded-full w-10 h-10 p-0 shadow-lg shadow-cyan-500/50"
          >
            <Plus className="w-5 h-5" />
          </Button>
        </motion.div>

        {/* View Toggle */}
        <div className="flex items-center justify-between mb-6">
          <Tabs value={viewMode} onValueChange={setViewMode}>
            <TabsList className="bg-white/5 backdrop-blur-xl border border-white/10">
              <TabsTrigger value="orbit" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
                <LayoutGrid className="w-4 h-4" />
              </TabsTrigger>
              <TabsTrigger value="list" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
                <List className="w-4 h-4" />
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Tabs value={filter} onValueChange={setFilter}>
            <TabsList className="bg-white/5 backdrop-blur-xl border border-white/10">
              <TabsTrigger value="all" className="text-xs data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">All</TabsTrigger>
              <TabsTrigger value="upcoming" className="text-xs data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
                Upcoming {stats.upcoming > 0 && <span className="ml-1 text-cyan-400">({stats.upcoming})</span>}
              </TabsTrigger>
              <TabsTrigger value="trial" className="text-xs data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
                Trials {stats.trials > 0 && <span className="ml-1 text-purple-400">({stats.trials})</span>}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Orbit Visualization */}
        <AnimatePresence mode="wait">
          {viewMode === 'orbit' && (
            <motion.div
              key="orbit"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="mb-8"
            >
              <OrbitVisualization 
                subscriptions={subscriptions} 
                totalYearly={stats.yearlyTotal}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <StatsCard
            title="Monthly"
            value={`$${stats.monthlyTotal.toFixed(2)}`}
            icon={CreditCard}
            color="#06b6d4"
            delay={0.1}
          />
          <StatsCard
            title="Yearly"
            value={`$${stats.yearlyTotal.toFixed(2)}`}
            icon={TrendingUp}
            color="#22d3ee"
            delay={0.2}
          />
          <StatsCard
            title="Active"
            value={stats.total}
            subtitle="subscriptions"
            icon={Calendar}
            color="#a855f7"
            delay={0.3}
          />
          <StatsCard
            title="Due This Week"
            value={`$${stats.upcomingAmount.toFixed(2)}`}
            subtitle={`${stats.upcoming} subs`}
            icon={Bell}
            color="#06b6d4"
            delay={0.4}
          />
        </div>

        {/* Subscription List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {filter === 'all' ? 'All Subscriptions' : 
               filter === 'upcoming' ? 'Upcoming Renewals' : 
               'Free Trials'}
            </h2>
            <span className="text-sm text-gray-500">{filteredSubscriptions.length} items</span>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl h-20 animate-pulse" />
              ))}
            </div>
          ) : filteredSubscriptions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 backdrop-blur-xl border border-cyan-500/20 flex items-center justify-center">
                <Plus className="w-8 h-8 text-cyan-400/60" />
              </div>
              <h3 className="text-lg font-medium text-white/70 mb-2">No subscriptions yet</h3>
              <p className="text-sm text-white/50 mb-4">Add your first subscription to start tracking</p>
              <Button
                onClick={() => setShowAddModal(true)}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 shadow-lg shadow-cyan-500/30"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Subscription
              </Button>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {filteredSubscriptions.map((subscription, index) => (
                <motion.div
                  key={subscription.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <SubscriptionCard
                    subscription={subscription}
                    onClick={() => setSelectedSubscription(subscription)}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>
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
    </div>
  );
}