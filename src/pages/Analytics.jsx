import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { PieChart, TrendingUp, DollarSign, Tag, Calendar, Clock, AlertCircle } from 'lucide-react';
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, CartesianGrid, Legend, Area, AreaChart } from 'recharts';
import { format, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, differenceInDays, subMonths } from 'date-fns';

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

  const { data: allPriceHistory = [] } = useQuery({
    queryKey: ['all-price-history'],
    queryFn: () => base44.entities.PriceHistory.list(),
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

    // Monthly spending trend (last 6 months + next 6 months)
    const trendData = [];
    for (let i = -5; i <= 6; i++) {
      const month = addMonths(new Date(), i);
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      
      const monthlySpending = active.reduce((sum, sub) => {
        const billingDate = new Date(sub.next_billing_date);
        // Estimate if subscription was active/will be active in this month
        const cycleMonths = { weekly: 0.25, monthly: 1, quarterly: 3, yearly: 12 }[sub.billing_cycle] || 1;
        
        // Simple estimation: if billing date within range or recurring
        if (billingDate >= monthStart && billingDate <= monthEnd) {
          return sum + sub.price;
        } else if (i >= 0) {
          // Future months - estimate based on cycle
          return sum + getMonthlyCost(sub);
        } else {
          // Past months - rough estimate
          return sum + getMonthlyCost(sub);
        }
      }, 0);
      
      trendData.push({
        month: format(month, 'MMM yy'),
        spending: monthlySpending,
        estimated: i > 0,
      });
    }

    // Upcoming payments (next 30 days)
    const today = new Date();
    const next30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    const upcomingPayments = active
      .filter(sub => {
        const billingDate = new Date(sub.next_billing_date);
        return billingDate >= today && billingDate <= next30Days;
      })
      .map(sub => ({
        ...sub,
        daysUntil: differenceInDays(new Date(sub.next_billing_date), today),
      }))
      .sort((a, b) => a.daysUntil - b.daysUntil);

    // Payment calendar for current month
    const currentMonth = new Date();
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    const paymentCalendar = daysInMonth.map(day => {
      const paymentsOnDay = active.filter(sub => 
        isSameDay(new Date(sub.next_billing_date), day)
      );
      return {
        day: format(day, 'd'),
        date: day,
        amount: paymentsOnDay.reduce((sum, s) => sum + s.price, 0),
        count: paymentsOnDay.length,
      };
    });

    // Price history analytics
    const totalSavings = allPriceHistory.reduce((sum, item) => {
      if (item.change_type === 'decrease' || item.change_type === 'switch') {
        return sum + (item.old_price - item.new_price);
      }
      return sum;
    }, 0);

    const priceIncreases = allPriceHistory.filter(h => h.change_type === 'increase').length;
    const priceDecreases = allPriceHistory.filter(h => h.change_type === 'decrease').length;
    const switches = allPriceHistory.filter(h => h.change_type === 'switch').length;

    // Price history trend over time
    const priceHistoryTrend = [...allPriceHistory]
      .sort((a, b) => new Date(a.change_date) - new Date(b.change_date))
      .map(item => ({
        date: format(new Date(item.change_date), 'MMM yy'),
        savings: item.change_type === 'decrease' || item.change_type === 'switch' 
          ? item.old_price - item.new_price 
          : -(item.new_price - item.old_price),
        type: item.change_type,
      }));

    return {
      categoryData,
      byCycle,
      topSubscriptions,
      monthlyTotal,
      yearlyTotal,
      dailyCost,
      totalActive: active.length,
      trendData,
      upcomingPayments,
      paymentCalendar,
      totalSavings,
      priceIncreases,
      priceDecreases,
      switches,
      priceHistoryTrend,
    };
  }, [subscriptions, allPriceHistory]);

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
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-green-900/20 via-transparent to-blue-900/10 pointer-events-none" />
      
      <div className="relative max-w-lg mx-auto px-4 py-6 pb-24">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-6"
        >
          <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
            <PieChart className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Analytics</h1>
            <p className="text-sm text-gray-500">Your spending insights</p>
          </div>
        </motion.div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white/5 rounded-2xl h-32 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Price History Summary */}
            {analytics.totalSavings > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-green-500/20 to-green-500/5 border border-green-500/20 rounded-2xl p-4 mb-4"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                    <TrendingDown className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Total Savings</h3>
                    <p className="text-sm text-gray-400">From price optimizations</p>
                  </div>
                </div>

                <div className="text-3xl font-bold text-green-400 mb-3">
                  ${analytics.totalSavings.toFixed(2)}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-white/5 rounded-lg p-2 text-center">
                    <div className="text-red-400 text-base font-semibold">{analytics.priceIncreases}</div>
                    <div className="text-xs text-gray-500">Increases</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2 text-center">
                    <div className="text-green-400 text-base font-semibold">{analytics.priceDecreases}</div>
                    <div className="text-xs text-gray-500">Decreases</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2 text-center">
                    <div className="text-blue-400 text-base font-semibold">{analytics.switches}</div>
                    <div className="text-xs text-gray-500">Switches</div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-green-500/20 to-green-500/5 border border-green-500/20 rounded-2xl p-4"
              >
                <DollarSign className="w-5 h-5 text-green-400 mb-2" />
                <p className="text-2xl font-bold text-white">${analytics.monthlyTotal.toFixed(2)}</p>
                <p className="text-sm text-gray-400">per month</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/20 rounded-2xl p-4"
              >
                <TrendingUp className="w-5 h-5 text-blue-400 mb-2" />
                <p className="text-2xl font-bold text-white">${analytics.yearlyTotal.toFixed(2)}</p>
                <p className="text-sm text-gray-400">per year</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-purple-500/20 to-purple-500/5 border border-purple-500/20 rounded-2xl p-4"
              >
                <Calendar className="w-5 h-5 text-purple-400 mb-2" />
                <p className="text-2xl font-bold text-white">${analytics.dailyCost.toFixed(2)}</p>
                <p className="text-sm text-gray-400">per day</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-orange-500/20 to-orange-500/5 border border-orange-500/20 rounded-2xl p-4"
              >
                <Tag className="w-5 h-5 text-orange-400 mb-2" />
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
                className="bg-white/5 border border-white/10 rounded-2xl p-4"
              >
                <h3 className="text-lg font-semibold mb-4">Spending by Category</h3>
                
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

            {/* Price History Trend */}
            {analytics.priceHistoryTrend.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-4"
              >
                <h3 className="text-lg font-semibold mb-4">Price Change History</h3>
                
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.priceHistoryTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fill: '#9ca3af', fontSize: 11 }}
                        stroke="#ffffff20"
                      />
                      <YAxis 
                        tick={{ fill: '#9ca3af', fontSize: 11 }}
                        stroke="#ffffff20"
                        tickFormatter={(value) => `$${value}`}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1a1a2e', 
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px'
                        }}
                        formatter={(value, name, props) => [
                          `$${Math.abs(value).toFixed(2)} ${value >= 0 ? 'saved' : 'increased'}`, 
                          props.payload.type === 'switch' ? 'Service Switch' : value >= 0 ? 'Price Decrease' : 'Price Increase'
                        ]}
                      />
                      <Bar 
                        dataKey="savings" 
                        radius={[4, 4, 0, 0]}
                      >
                        {analytics.priceHistoryTrend.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.savings >= 0 ? '#22c55e' : '#ef4444'} 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            )}

            {/* Spending Trend */}
            {analytics.trendData.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-4"
              >
                <h3 className="text-lg font-semibold mb-4">Spending Trend</h3>
                
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics.trendData}>
                      <defs>
                        <linearGradient id="colorSpending" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                      <XAxis 
                        dataKey="month" 
                        tick={{ fill: '#9ca3af', fontSize: 11 }}
                        stroke="#ffffff20"
                      />
                      <YAxis 
                        tick={{ fill: '#9ca3af', fontSize: 11 }}
                        stroke="#ffffff20"
                        tickFormatter={(value) => `$${value}`}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1a1a2e', 
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px'
                        }}
                        formatter={(value, name, props) => [
                          `$${value.toFixed(2)}${props.payload.estimated ? ' (estimated)' : ''}`, 
                          'Spending'
                        ]}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="spending" 
                        stroke="#22c55e" 
                        strokeWidth={2}
                        fill="url(#colorSpending)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            )}

            {/* Upcoming Payments */}
            {analytics.upcomingPayments.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Upcoming Payments</h3>
                  <span className="text-sm text-gray-400">Next 30 days</span>
                </div>
                
                <div className="space-y-3">
                  {analytics.upcomingPayments.slice(0, 5).map((sub, index) => (
                    <div key={sub.id} className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: sub.color || '#22c55e' }}
                      >
                        {sub.icon_url ? (
                          <img 
                            src={sub.icon_url} 
                            alt={sub.name} 
                            className="w-6 h-6 rounded-lg object-cover"
                          />
                        ) : (
                          <span className="text-white font-bold text-sm">
                            {sub.name?.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white">{sub.name}</p>
                        <p className="text-sm text-gray-400">
                          {sub.daysUntil === 0 ? 'Today' : 
                           sub.daysUntil === 1 ? 'Tomorrow' : 
                           `In ${sub.daysUntil} days`} · {format(new Date(sub.next_billing_date), 'd MMM')}
                        </p>
                      </div>
                      
                      <span className="font-semibold text-white">${sub.price.toFixed(2)}</span>
                    </div>
                  ))}
                  
                  {analytics.upcomingPayments.length > 5 && (
                    <p className="text-sm text-gray-500 text-center pt-2">
                      +{analytics.upcomingPayments.length - 5} more payment{analytics.upcomingPayments.length - 5 !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="text-gray-400">Total</span>
                  <span className="text-xl font-bold text-white">
                    ${analytics.upcomingPayments.reduce((sum, s) => sum + s.price, 0).toFixed(2)}
                  </span>
                </div>
              </motion.div>
            )}

            {/* Top Subscriptions */}
            {analytics.topSubscriptions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-4"
              >
                <h3 className="text-lg font-semibold mb-4">Most Expensive</h3>
                
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
              transition={{ delay: 0.8 }}
              className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-white/10 rounded-2xl p-4 text-center"
            >
              <p className="text-gray-400 text-sm">💡 Fun fact</p>
              <p className="text-white mt-1">
                You spend about <span className="text-green-400 font-bold">${(analytics.yearlyTotal / 365).toFixed(2)}</span> on subscriptions every single day!
              </p>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}