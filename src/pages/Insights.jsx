import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Sparkles, TrendingDown, AlertTriangle, DollarSign, Lightbulb, RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function Insights() {
  const [insights, setInsights] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: () => base44.entities.Subscription.list(),
  });

  const analyzeSubscriptions = async () => {
    if (subscriptions.length === 0) return;
    
    setIsAnalyzing(true);
    try {
      const activeSubscriptions = subscriptions.filter(s => s.status === 'active' || s.status === 'trial');
      
      const prompt = `You are a personal finance AI assistant specializing in subscription management. Analyze the following subscriptions and provide actionable insights.

Subscriptions:
${activeSubscriptions.map(sub => `
- ${sub.name}: $${sub.price}/${sub.billing_cycle} (Category: ${sub.category}, Next billing: ${sub.next_billing_date})
`).join('')}

Provide insights in these categories:
1. Underutilized subscriptions: Identify which subscriptions might not be worth the cost
2. Cheaper alternatives: Suggest more affordable options for expensive subscriptions
3. Spending forecast: Predict monthly and yearly spending trends
4. Price increase alerts: Warn about subscriptions that commonly increase prices

Be specific, practical, and concise. Focus on actionable recommendations.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            underutilized: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  reason: { type: "string" },
                  recommendation: { type: "string" }
                }
              }
            },
            cheaper_alternatives: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  current: { type: "string" },
                  alternative: { type: "string" },
                  savings: { type: "string" },
                  notes: { type: "string" }
                }
              }
            },
            spending_forecast: {
              type: "object",
              properties: {
                monthly_trend: { type: "string" },
                yearly_projection: { type: "string" },
                recommendations: { type: "string" }
              }
            },
            price_alerts: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  service: { type: "string" },
                  risk: { type: "string" },
                  details: { type: "string" }
                }
              }
            }
          }
        }
      });

      setInsights(result);
    } catch (error) {
      console.error('Error analyzing subscriptions:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (subscriptions.length > 0 && !insights) {
      analyzeSubscriptions();
    }
  }, [subscriptions]);

  const InsightCard = ({ icon: Icon, title, color, children }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 border border-white/10 rounded-2xl p-4"
    >
      <div className="flex items-center gap-3 mb-4">
        <div 
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>
      {children}
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-[#1a1325] text-white">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-blue-900/10 pointer-events-none" />
      
      <div className="relative max-w-lg mx-auto px-5 py-6 pb-24">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">AI Insights</h1>
              <p className="text-sm text-gray-500">Personalized recommendations</p>
            </div>
          </div>
          <Button
            onClick={analyzeSubscriptions}
            disabled={isAnalyzing}
            variant="outline"
            size="icon"
            className="bg-white/5 border-white/10 hover:bg-white/10"
          >
            <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
          </Button>
        </motion.div>

        {isAnalyzing && !insights ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-purple-400 animate-pulse" />
                </div>
                <p className="text-gray-400">Analyzing your subscriptions...</p>
              </div>
            </div>
          </div>
        ) : insights ? (
          <div className="space-y-4">
            {/* Underutilized Subscriptions */}
            {insights.underutilized && insights.underutilized.length > 0 && (
              <InsightCard icon={TrendingDown} title="Underutilized" color="#f97316">
                <div className="space-y-3">
                  {insights.underutilized.map((item, idx) => (
                    <div key={idx} className="bg-orange-500/10 rounded-xl p-3 border border-orange-500/20">
                      <h4 className="font-medium text-white mb-1">{item.name}</h4>
                      <p className="text-sm text-gray-400 mb-2">{item.reason}</p>
                      <p className="text-sm text-orange-400">💡 {item.recommendation}</p>
                    </div>
                  ))}
                </div>
              </InsightCard>
            )}

            {/* Cheaper Alternatives */}
            {insights.cheaper_alternatives && insights.cheaper_alternatives.length > 0 && (
              <InsightCard icon={DollarSign} title="Cheaper Alternatives" color="#22c55e">
                <div className="space-y-3">
                  {insights.cheaper_alternatives.map((item, idx) => (
                    <div key={idx} className="bg-green-500/10 rounded-xl p-3 border border-green-500/20">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium">{item.current}</span>
                        <span className="text-green-400 text-sm font-semibold">{item.savings}</span>
                      </div>
                      <p className="text-sm text-gray-400 mb-1">→ {item.alternative}</p>
                      <p className="text-sm text-gray-500">{item.notes}</p>
                    </div>
                  ))}
                </div>
              </InsightCard>
            )}

            {/* Spending Forecast */}
            {insights.spending_forecast && (
              <InsightCard icon={TrendingDown} title="Spending Forecast" color="#3b82f6">
                <div className="space-y-3">
                  <div className="bg-blue-500/10 rounded-xl p-3 border border-blue-500/20">
                    <h4 className="text-sm text-gray-400 mb-1">Monthly Trend</h4>
                    <p className="text-white">{insights.spending_forecast.monthly_trend}</p>
                  </div>
                  <div className="bg-blue-500/10 rounded-xl p-3 border border-blue-500/20">
                    <h4 className="text-sm text-gray-400 mb-1">Yearly Projection</h4>
                    <p className="text-white">{insights.spending_forecast.yearly_projection}</p>
                  </div>
                  <div className="bg-blue-500/10 rounded-xl p-3 border border-blue-500/20">
                    <h4 className="text-sm text-gray-400 mb-1">Recommendations</h4>
                    <p className="text-blue-400">{insights.spending_forecast.recommendations}</p>
                  </div>
                </div>
              </InsightCard>
            )}

            {/* Price Alerts */}
            {insights.price_alerts && insights.price_alerts.length > 0 && (
              <InsightCard icon={AlertTriangle} title="Price Increase Alerts" color="#eab308">
                <div className="space-y-3">
                  {insights.price_alerts.map((item, idx) => (
                    <div key={idx} className="bg-yellow-500/10 rounded-xl p-3 border border-yellow-500/20">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-white">{item.service}</h4>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          item.risk === 'high' ? 'bg-red-500/20 text-red-400' :
                          item.risk === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {item.risk} risk
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">{item.details}</p>
                    </div>
                  ))}
                </div>
              </InsightCard>
            )}

            {/* Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-white/10 rounded-2xl p-4 text-center"
            >
              <Lightbulb className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
              <p className="text-sm text-gray-400">
                AI analysis powered by real-time market data
              </p>
            </motion.div>
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-gray-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-400 mb-2">No subscriptions yet</h3>
            <p className="text-sm text-gray-600">Add subscriptions to get AI-powered insights</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}