'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  Cell,
  LineChart,
  Line,
  ComposedChart
} from 'recharts';
import { CreativeMetrics } from '@/types/creativeAnalysis';
import { formatCurrency, formatNumber, cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Activity,
  Zap,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  ChartBar
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PerformanceChartProps {
  creatives: CreativeMetrics[];
}

type ChartType = 'cpbc' | 'funnel' | 'kpi' | 'trends';
type Metric = 'cpbc' | 'calls' | 'intros' | 'contracts' | 'deals';

export function PerformanceChart({ creatives }: PerformanceChartProps) {
  const [chartType, setChartType] = useState<ChartType>('cpbc');
  const [selectedMetric, setSelectedMetric] = useState<Metric>('cpbc');
  
  // Prepare data for different chart types
  const topCreatives = creatives.slice(0, 10);
  
  // Helper to truncate names for display
  const truncateName = (name: string, maxLength: number = 25) => {
    if (name.length <= maxLength) return name;
    return name.slice(0, maxLength) + '...';
  };
  
  // CPBC Analysis Data (lower is better)
  const cpbcData = topCreatives
    .filter(c => c.costPerCallBooked > 0) // Only show creatives with calls booked
    .map(c => ({
      name: truncateName(c.adName),
      fullName: c.adName,
      cpbc: c.costPerCallBooked,
      callsBooked: c.callsBooked,
      spend: c.spend,
      performance: c.costPerCallBooked < 100 ? 'excellent' : c.costPerCallBooked < 200 ? 'good' : 'poor'
    }))
    .sort((a, b) => a.cpbc - b.cpbc) // Sort by CPBC ascending (lower is better)
    .slice(0, 10);
  
  // Main KPIs Funnel Data
  const funnelData = topCreatives.map(c => ({
    name: truncateName(c.adName),
    fullName: c.adName,
    clicks: c.clicks,
    applications: c.applications,
    callsBooked: c.callsBooked,
    callsTaken: c.callsTaken,
    contractsSent: c.contractsSent,
    dealsWon: c.dealsWon,
  }));
  
  // KPI Performance Data
  const kpiData = topCreatives.map(c => ({
    name: truncateName(c.adName),
    fullName: c.adName,
    callsBooked: c.callsBooked,
    callsTaken: c.callsTaken,
    contractsSent: c.contractsSent,
    dealsWon: c.dealsWon,
    conversionRate: c.callsBooked > 0 ? (c.dealsWon / c.callsBooked) * 100 : 0,
  }));
  
  // Trends Data - Combined metrics
  const trendsData = topCreatives.map(c => ({
    name: truncateName(c.adName),
    fullName: c.adName,
    spend: c.spend,
    cpbc: c.costPerCallBooked,
    roas: c.dealsWon > 0 && c.spend > 0 ? (c.dealsWon * 5000) / c.spend : 0,
    efficiency: c.callsBooked > 0 ? (c.callsBooked / c.spend) * 1000 : 0 // Calls per $1000 spent
  }));
  
  const getBarColor = (value: number, metric: string) => {
    if (metric === 'cpbc') {
      // Lower CPBC is better
      if (value < 100) return '#10b981'; // Emerald for excellent CPBC
      if (value < 200) return '#f59e0b'; // Amber for good CPBC
      return '#ef4444'; // Red for poor CPBC
    }
    return '#8b5cf6'; // Purple default
  };
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload;
      return (
        <div className="bg-slate-900/95 backdrop-blur-xl p-4 rounded-xl border border-slate-700/50 shadow-2xl max-w-sm">
          <p className="text-white font-semibold mb-3 text-sm break-words">{data?.fullName || label}</p>
          <div className="space-y-2">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center justify-between gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-2 h-2 rounded-full ring-2 ring-offset-1 ring-offset-slate-900" 
                    style={{ 
                      backgroundColor: entry.color,
                      ringColor: entry.color 
                    }}
                  />
                  <span className="text-slate-400">{entry.name}:</span>
                </div>
                <span className="text-white font-semibold">
                  {entry.name.includes('$') || ['spend', 'cpbc', 'cpc', 'cpa'].includes(entry.dataKey)
                    ? formatCurrency(entry.value)
                    : entry.dataKey === 'conversionRate'
                    ? `${entry.value.toFixed(1)}%`
                    : entry.dataKey === 'roas'
                    ? `${entry.value.toFixed(1)}x`
                    : entry.dataKey === 'efficiency'
                    ? `${entry.value.toFixed(1)}`
                    : formatNumber(entry.value)
                  }
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };
  
  const chartOptions = [
    { value: 'cpbc', label: 'CPBC Analysis', icon: DollarSign, color: 'text-emerald-400' },
    { value: 'funnel', label: 'Funnel Overview', icon: BarChart3, color: 'text-purple-400' },
    { value: 'kpi', label: 'KPI Comparison', icon: Activity, color: 'text-blue-400' },
    { value: 'trends', label: 'Performance Trends', icon: TrendingUp, color: 'text-pink-400' }
  ];
  
  return (
    <Card className="bg-gradient-to-br from-slate-900/60 via-slate-800/40 to-slate-900/60 backdrop-blur-xl border-slate-700/50 p-8 shadow-2xl">
      {/* Enhanced Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8">
        <div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent mb-2">
            Performance Comparison
          </h3>
          <p className="text-sm text-slate-400">Analyzing top performing creatives across key metrics</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Chart Type Pills */}
          <div className="flex flex-wrap gap-2">
            {chartOptions.map((option) => {
              const Icon = option.icon;
              const isActive = chartType === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => setChartType(option.value as ChartType)}
                  className={cn(
                    "px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all duration-300",
                    isActive
                      ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/25"
                      : "bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-white border border-slate-700/50"
                  )}
                >
                  <Icon className={cn("h-4 w-4", isActive ? "text-white" : option.color)} />
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Chart Container with Enhanced Styling */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-t from-purple-500/5 to-transparent rounded-xl pointer-events-none" />
        <div className="h-[450px] w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'cpbc' ? (
              <BarChart 
                data={cpbcData} 
                margin={{ top: 20, right: 30, left: 50, bottom: 120 }}
              >
                <defs>
                  <linearGradient id="cpbcGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="50%" stopColor="#3b82f6" stopOpacity={0.6}/>
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" strokeOpacity={0.3} />
                <XAxis 
                  dataKey="name" 
                  stroke="#64748b"
                  angle={-45}
                  textAnchor="end"
                  interval={0}
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                />
                <YAxis 
                  stroke="#64748b" 
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  label={{ value: 'Cost Per Call Booked ($)', angle: -90, position: 'insideLeft', style: { fill: '#64748b', fontSize: 12 } }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="cpbc" name="Cost Per Call Booked" radius={[12, 12, 0, 0]}>
                  {cpbcData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={getBarColor(entry.cpbc, 'cpbc')}
                      fillOpacity={0.8}
                    />
                  ))}
                </Bar>
              </BarChart>
            ) : chartType === 'funnel' ? (
              <AreaChart 
                data={funnelData} 
                margin={{ top: 20, right: 30, left: 50, bottom: 120 }}
              >
                <defs>
                  <linearGradient id="clicksGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="applicationsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="callsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="dealsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" strokeOpacity={0.3} />
                <XAxis 
                  dataKey="name" 
                  stroke="#64748b"
                  angle={-45}
                  textAnchor="end"
                  interval={0}
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                />
                <YAxis 
                  stroke="#64748b" 
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="circle"
                  formatter={(value) => <span style={{ color: '#e2e8f0', fontSize: '12px' }}>{value}</span>}
                />
                <Area type="monotone" dataKey="clicks" stackId="1" stroke="#8b5cf6" fill="url(#clicksGradient)" strokeWidth={2} />
                <Area type="monotone" dataKey="applications" stackId="1" stroke="#6366f1" fill="url(#applicationsGradient)" strokeWidth={2} />
                <Area type="monotone" dataKey="callsBooked" stackId="1" stroke="#3b82f6" fill="url(#callsGradient)" strokeWidth={2} />
                <Area type="monotone" dataKey="callsTaken" stackId="1" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.6} strokeWidth={2} name="Intros Taken" />
                <Area type="monotone" dataKey="contractsSent" stackId="1" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.6} strokeWidth={2} />
                <Area type="monotone" dataKey="dealsWon" stackId="1" stroke="#10b981" fill="url(#dealsGradient)" strokeWidth={3} />
              </AreaChart>
            ) : chartType === 'kpi' ? (
              <BarChart 
                data={kpiData} 
                margin={{ top: 20, right: 30, left: 50, bottom: 120 }}
              >
                <defs>
                  <linearGradient id="callsBookedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.9}/>
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                  </linearGradient>
                  <linearGradient id="introsTakenGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.9}/>
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0.3}/>
                  </linearGradient>
                  <linearGradient id="contractsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9}/>
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  </linearGradient>
                  <linearGradient id="dealsWonGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.9}/>
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.3}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" strokeOpacity={0.3} />
                <XAxis 
                  dataKey="name" 
                  stroke="#64748b"
                  angle={-45}
                  textAnchor="end"
                  interval={0}
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                />
                <YAxis 
                  stroke="#64748b" 
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="circle"
                  formatter={(value) => <span style={{ color: '#e2e8f0', fontSize: '12px' }}>{value}</span>}
                />
                <Bar dataKey="callsBooked" name="Calls Booked" fill="url(#callsBookedGradient)" radius={[8, 8, 0, 0]} />
                <Bar dataKey="callsTaken" name="Intros Taken" fill="url(#introsTakenGradient)" radius={[8, 8, 0, 0]} />
                <Bar dataKey="contractsSent" name="Contracts Sent" fill="url(#contractsGradient)" radius={[8, 8, 0, 0]} />
                <Bar dataKey="dealsWon" name="Deals Won" fill="url(#dealsWonGradient)" radius={[8, 8, 0, 0]} />
              </BarChart>
            ) : (
              <ComposedChart 
                data={trendsData} 
                margin={{ top: 20, right: 30, left: 50, bottom: 120 }}
              >
                <defs>
                  <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" strokeOpacity={0.3} />
                <XAxis 
                  dataKey="name" 
                  stroke="#64748b"
                  angle={-45}
                  textAnchor="end"
                  interval={0}
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                />
                <YAxis 
                  yAxisId="left"
                  stroke="#64748b" 
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  label={{ value: 'Spend ($)', angle: -90, position: 'insideLeft', style: { fill: '#64748b', fontSize: 12 } }}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  stroke="#64748b" 
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  label={{ value: 'ROAS (x)', angle: 90, position: 'insideRight', style: { fill: '#64748b', fontSize: 12 } }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="circle"
                  formatter={(value) => <span style={{ color: '#e2e8f0', fontSize: '12px' }}>{value}</span>}
                />
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="spend" 
                  stroke="#8b5cf6" 
                  fill="url(#spendGradient)" 
                  strokeWidth={2}
                  name="Ad Spend"
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="roas" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8 }}
                  name="ROAS"
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="efficiency" 
                  stroke="#f59e0b" 
                  strokeWidth={3}
                  strokeDasharray="5 5"
                  dot={{ fill: '#f59e0b', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8 }}
                  name="Efficiency (Calls/$1k)"
                />
              </ComposedChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Enhanced Insights Section */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300" />
          <div className="relative p-5 bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-xl border border-purple-500/20 backdrop-blur-sm">
            <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <div className="p-1.5 bg-purple-500/20 rounded-lg">
                <Sparkles className="h-4 w-4 text-purple-400" />
              </div>
              Performance Highlights
            </h4>
            <div className="space-y-3">
              {chartType === 'cpbc' && cpbcData.length > 0 && (
                <>
                  <div className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0 ring-4 ring-emerald-400/20" />
                    <p className="text-xs text-slate-300 leading-relaxed">
                      <span className="font-semibold text-emerald-400">{cpbcData[0]?.fullName}</span> leads with the best CPBC at{' '}
                      <span className="font-bold text-white bg-emerald-500/10 px-1.5 py-0.5 rounded">{formatCurrency(cpbcData[0]?.cpbc || 0)}</span>
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-purple-400 mt-1.5 flex-shrink-0 ring-4 ring-purple-400/20" />
                    <p className="text-xs text-slate-300 leading-relaxed">
                      <span className="font-bold text-white bg-purple-500/10 px-1.5 py-0.5 rounded">{cpbcData.filter(d => d.cpbc < 100).length}</span>{' '}
                      creatives achieving excellent CPBC performance (&lt;$100)
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-blue-400 mt-1.5 flex-shrink-0 ring-4 ring-blue-400/20" />
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Average CPBC across top performers:{' '}
                      <span className="font-bold text-white bg-blue-500/10 px-1.5 py-0.5 rounded">
                        {formatCurrency(cpbcData.reduce((sum, d) => sum + d.cpbc, 0) / cpbcData.length)}
                      </span>
                    </p>
                  </div>
                </>
              )}
              {chartType === 'funnel' && funnelData.length > 0 && (
                <>
                  <div className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0 ring-4 ring-emerald-400/20" />
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Top converter: <span className="font-semibold text-emerald-400">{funnelData.sort((a, b) => b.dealsWon - a.dealsWon)[0]?.fullName}</span>{' '}
                      with <span className="font-bold text-white bg-emerald-500/10 px-1.5 py-0.5 rounded">{funnelData.sort((a, b) => b.dealsWon - a.dealsWon)[0]?.dealsWon} deals</span>
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-purple-400 mt-1.5 flex-shrink-0 ring-4 ring-purple-400/20" />
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Average funnel conversion:{' '}
                      <span className="font-bold text-white bg-purple-500/10 px-1.5 py-0.5 rounded">{
                        funnelData.length > 0 
                          ? ((funnelData.reduce((sum, d) => sum + (d.dealsWon / Math.max(d.clicks, 1)), 0) / funnelData.length) * 100).toFixed(2)
                          : 0
                      }%</span> from clicks to deals
                    </p>
                  </div>
                </>
              )}
              {chartType === 'kpi' && kpiData.length > 0 && (
                <>
                  <div className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0 ring-4 ring-emerald-400/20" />
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Top deal closer: <span className="font-semibold text-emerald-400">{kpiData.sort((a, b) => b.dealsWon - a.dealsWon)[0]?.fullName}</span>{' '}
                      with <span className="font-bold text-white bg-emerald-500/10 px-1.5 py-0.5 rounded">{kpiData.sort((a, b) => b.dealsWon - a.dealsWon)[0]?.dealsWon} deals</span>
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-purple-400 mt-1.5 flex-shrink-0 ring-4 ring-purple-400/20" />
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Call-to-deal conversion:{' '}
                      <span className="font-bold text-white bg-purple-500/10 px-1.5 py-0.5 rounded">{
                        kpiData.length > 0 
                          ? ((kpiData.reduce((sum, d) => sum + d.conversionRate, 0) / kpiData.length)).toFixed(1)
                          : 0
                      }%</span> average
                    </p>
                  </div>
                </>
              )}
              {chartType === 'trends' && trendsData.length > 0 && (
                <>
                  <div className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0 ring-4 ring-emerald-400/20" />
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Highest ROAS: <span className="font-semibold text-emerald-400">{trendsData.sort((a, b) => b.roas - a.roas)[0]?.fullName}</span>{' '}
                      at <span className="font-bold text-white bg-emerald-500/10 px-1.5 py-0.5 rounded">{trendsData.sort((a, b) => b.roas - a.roas)[0]?.roas.toFixed(1)}x</span>
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-purple-400 mt-1.5 flex-shrink-0 ring-4 ring-purple-400/20" />
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Most efficient: <span className="font-semibold text-purple-400">{trendsData.sort((a, b) => b.efficiency - a.efficiency)[0]?.fullName}</span>{' '}
                      with <span className="font-bold text-white bg-purple-500/10 px-1.5 py-0.5 rounded">{trendsData.sort((a, b) => b.efficiency - a.efficiency)[0]?.efficiency.toFixed(1)} calls/$1k</span>
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300" />
          <div className="relative p-5 bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-xl border border-blue-500/20 backdrop-blur-sm">
            <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <div className="p-1.5 bg-blue-500/20 rounded-lg">
                <ChartBar className="h-4 w-4 text-blue-400" />
              </div>
              Key Metrics
            </h4>
            <div className="space-y-3">
              {chartType === 'cpbc' && (
                <>
                  <div className="flex justify-between items-center p-2 bg-slate-800/30 rounded-lg">
                    <span className="text-xs text-slate-400">Average CPBC</span>
                    <span className="text-xs font-bold text-white">
                      {cpbcData.length > 0 
                        ? formatCurrency(cpbcData.reduce((sum, d) => sum + d.cpbc, 0) / cpbcData.length)
                        : 'N/A'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-slate-800/30 rounded-lg">
                    <span className="text-xs text-slate-400">Total Calls Booked</span>
                    <span className="text-xs font-bold text-white">
                      {cpbcData.reduce((sum, d) => sum + d.callsBooked, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-slate-800/30 rounded-lg">
                    <span className="text-xs text-slate-400">Total Spend</span>
                    <span className="text-xs font-bold text-white">
                      {formatCurrency(cpbcData.reduce((sum, d) => sum + d.spend, 0))}
                    </span>
                  </div>
                </>
              )}
              {chartType === 'funnel' && (
                <>
                  <div className="flex justify-between items-center p-2 bg-slate-800/30 rounded-lg">
                    <span className="text-xs text-slate-400">Total Clicks</span>
                    <span className="text-xs font-bold text-white">
                      {formatNumber(funnelData.reduce((sum, d) => sum + d.clicks, 0))}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-slate-800/30 rounded-lg">
                    <span className="text-xs text-slate-400">Total Deals Won</span>
                    <span className="text-xs font-bold text-white">
                      {funnelData.reduce((sum, d) => sum + d.dealsWon, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-slate-800/30 rounded-lg">
                    <span className="text-xs text-slate-400">Funnel Efficiency</span>
                    <span className="text-xs font-bold text-white">
                      {funnelData.length > 0 && funnelData.reduce((sum, d) => sum + d.clicks, 0) > 0
                        ? ((funnelData.reduce((sum, d) => sum + d.dealsWon, 0) / funnelData.reduce((sum, d) => sum + d.clicks, 0)) * 100).toFixed(3)
                        : 0
                      }%
                    </span>
                  </div>
                </>
              )}
              {chartType === 'kpi' && (
                <>
                  <div className="flex justify-between items-center p-2 bg-slate-800/30 rounded-lg">
                    <span className="text-xs text-slate-400">Total Intros</span>
                    <span className="text-xs font-bold text-white">
                      {kpiData.reduce((sum, d) => sum + d.callsTaken, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-slate-800/30 rounded-lg">
                    <span className="text-xs text-slate-400">Contract Rate</span>
                    <span className="text-xs font-bold text-white">
                      {kpiData.length > 0 && kpiData.reduce((sum, d) => sum + d.callsTaken, 0) > 0
                        ? ((kpiData.reduce((sum, d) => sum + d.contractsSent, 0) / kpiData.reduce((sum, d) => sum + d.callsTaken, 0)) * 100).toFixed(1)
                        : 0
                      }%
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-slate-800/30 rounded-lg">
                    <span className="text-xs text-slate-400">Close Rate</span>
                    <span className="text-xs font-bold text-white">
                      {kpiData.length > 0 && kpiData.reduce((sum, d) => sum + d.contractsSent, 0) > 0
                        ? ((kpiData.reduce((sum, d) => sum + d.dealsWon, 0) / kpiData.reduce((sum, d) => sum + d.contractsSent, 0)) * 100).toFixed(1)
                        : 0
                      }%
                    </span>
                  </div>
                </>
              )}
              {chartType === 'trends' && (
                <>
                  <div className="flex justify-between items-center p-2 bg-slate-800/30 rounded-lg">
                    <span className="text-xs text-slate-400">Average ROAS</span>
                    <span className="text-xs font-bold text-white">
                      {trendsData.length > 0 
                        ? (trendsData.reduce((sum, d) => sum + d.roas, 0) / trendsData.length).toFixed(1)
                        : 0
                      }x
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-slate-800/30 rounded-lg">
                    <span className="text-xs text-slate-400">Total Spend</span>
                    <span className="text-xs font-bold text-white">
                      {formatCurrency(trendsData.reduce((sum, d) => sum + d.spend, 0))}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-slate-800/30 rounded-lg">
                    <span className="text-xs text-slate-400">Avg Efficiency</span>
                    <span className="text-xs font-bold text-white">
                      {trendsData.length > 0 
                        ? (trendsData.reduce((sum, d) => sum + d.efficiency, 0) / trendsData.length).toFixed(1)
                        : 0
                      } calls/$1k
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </Card>
  );
}