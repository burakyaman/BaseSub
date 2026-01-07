import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { PieChart, TrendingUp, DollarSign, Tag, Calendar } from 'lucide-react';
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

const categoryLabels = {
  entertainment: 'Entertainment',
  productivity: 'Productivity',
  utilities: 'Utilities',
  health: 'Health & Fitness',
  education: 'Education',
  gaming: 'Gaming',
  news: 'News & Media',
  social: 'Social',
  finance: 'Finance',
  other: 'Other',
};

const categoryColors = {
  entertainment: '#E50914',
  productivity: '#3b82f6',
  utilities: '#22c55e',
  health: '#f97316',
  education: '#a855f7',
  gaming: '#ec4899',
  news: '#eab308',
  social: '#06b6d4',
  finance: '#10b981',
  other: '#6b7280',
};

export default function Analytics() {
  const { data: subscriptions = [], isLoading } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: () => base44.entities.Subscription.list(),
  });

  const analytics = useMemo(() => {
    const active = subscriptions.filter(s => s.status === 'active' || s.status === 'trial');
    
    // Monthly cost per subscription (normalized)
    const getMonthlyCost = (sub) => {
      const multiplier = {
        weekly: 4,
        monthly: 1,
        quarterly: 1/3,
        yearly: 1/12,
      };
      return sub.price * (multiplier[sub.billing_cycle] || 1);
    };

    // Category breakdown
    const byCategory = {};
    active.forEach(sub => {
      const category = sub.category || 'other';
      if (!byCategory[category]) {
        byCategory[category] = { count: 0, monthlyTotal: 0 };
      }
      byCategory[category].count++;
      byCategory[category].monthlyTotal += getMonthlyCost(sub);
    });

    const categoryData = Object.entries(byCategory)
      .map(([category, data]) => ({
        name: categoryLabels[category] || category,
        value: data.monthlyTotal,
        count: data.count,
        color: categoryColors[category] || '#6b7280',
      }))
      .sort((a, b) => b.value - a.value);

    // Billing cycle breakdown
    const byCycle = {};
    active.forEach(sub => {
      const cycle = sub.billing_cycle || 'monthly';
      if (!byCycle[cycle]) {
        byCycle[cycle] = { count: 0, total: 0 };
      }
      byCycle[cycle].count++;
      byCycle[cycle].total += sub.price;
    });

    // Top subscriptions by cost
    const topSubscriptions = [...active]
      .map(sub => ({ ...sub, monthlyCost: getMonthlyCost(sub) }))
      .sort((a, b) => b.monthlyCost - a.monthlyCost)
      .slice(0, 5);

    // Total calculations
    const monthlyTotal = active.reduce((sum, sub) => sum + getMonthlyCost(sub), 0);
    const yearlyTotal = monthlyTotal * 12;
    const dailyCost = monthlyTotal / 30;

    return {
      categoryData,
      byCycle,
      topSubscriptions,
      monthlyTotal,
      yearlyTotal,
      dailyCost,
      totalActive: active.length,
    };
  }, [subscriptions]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#1a1a2e] border border-white/10 rounded-lg p-3 shadow-xl">
          <p className="text-white font-medium">{data.name}</p>
          <p className="text-green-400">${data.value.toFixed(2)}/mo</p>
          <p className="text-gray-400 text-sm">{data.count} subscription{data.count !== 1 ? 's' : ''}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#0d2847] to-[#0f3460] text-white">
      {/* Underwater background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-cyan-400/15 via-cyan-400/5 to-transparent transform -skew-x-12" />
        <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-cyan-400/15 via-cyan-400/5 to-transparent transform skew-x-12" />
      </div>
      
      <div className="relative max-w-lg mx-auto px-4 py-6 pb-24">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-6"
        >
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 backdrop-blur-xl border border-cyan-500/30 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <PieChart className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Analytics</h1>
            <p className="text-sm text-gray-500">Your spending insights</p>
          </div>
        </motion.div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl h-32 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-4 shadow-lg shadow-cyan-500/10"
              >
                <DollarSign className="w-5 h-5 text-cyan-400 mb-2" />
                <p className="text-2xl font-bold text-white">${analytics.monthlyTotal.toFixed(2)}</p>
                <p className="text-sm text-gray-400">per month</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-blue-500/20 to-blue-500/5 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-4 shadow-lg shadow-blue-500/10"
              >
                <TrendingUp className="w-5 h-5 text-cyan-300 mb-2" />
                <p className="text-2xl font-bold text-white">${analytics.yearlyTotal.toFixed(2)}</p>
                <p className="text-sm text-gray-400">per year</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-purple-500/20 to-purple-500/5 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-4 shadow-lg shadow-purple-500/10"
              >
                <Calendar className="w-5 h-5 text-purple-400 mb-2" />
                <p className="text-2xl font-bold text-white">${analytics.dailyCost.toFixed(2)}</p>
                <p className="text-sm text-gray-400">per day</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-teal-500/20 to-teal-500/5 backdrop-blur-xl border border-teal-500/30 rounded-2xl p-4 shadow-lg shadow-teal-500/10"
              >
                <Tag className="w-5 h-5 text-teal-400 mb-2" />
                <p className="text-2xl font-bold text-white">{analytics.totalActive}</p>
                <p className="text-sm text-gray-400">active subscriptions</p>
              </motion.div>
            </div>

            {/* Category Breakdown */}
            {analytics.categoryData.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white/5 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-4 shadow-xl shadow-cyan-500/10"
              >
                <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">Spending by Category</h3>
                
                <div className="h-48 mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPie>
                      <Pie
                        data={analytics.categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {analytics.categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </RechartsPie>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-2">
                  {analytics.categoryData.map((category, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="text-sm text-gray-300">{category.name}</span>
                        <span className="text-xs text-gray-500">({category.count})</span>
                      </div>
                      <span className="text-sm font-medium text-white">
                        ${category.value.toFixed(2)}/mo
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Top Subscriptions */}
            {analytics.topSubscriptions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white/5 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-4 shadow-xl shadow-cyan-500/10"
              >
                <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">Top Subscriptions</h3>
                
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={analytics.topSubscriptions} 
                      layout="vertical"
                      margin={{ left: 0, right: 10 }}
                    >
                      <XAxis type="number" hide />
                      <YAxis 
                        type="category" 
                        dataKey="name" 
                        width={100}
                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1a1a2e', 
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px'
                        }}
                        formatter={(value) => [`$${value.toFixed(2)}/mo`, 'Cost']}
                      />
                      <Bar 
                        dataKey="monthlyCost" 
                        radius={[0, 4, 4, 0]}
                      >
                        {analytics.topSubscriptions.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color || '#22c55e'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            )}

            {/* Fun fact */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-4 text-center shadow-lg shadow-cyan-500/10"
              >
              <p className="text-cyan-400 text-sm">💡 Fun fact</p>
              <p className="text-white mt-1">
                You spend about <span className="text-cyan-400 font-bold">${(analytics.yearlyTotal / 365).toFixed(2)}</span> on subscriptions every single day!
              </p>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}