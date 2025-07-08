'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import useSWR from 'swr';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Phone, 
  FileText, 
  Award,
  RefreshCw,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Image as ImageIcon,
  Filter,
  Download,
  Search,
  SortDesc,
  Target,
  ChevronDown,
  MousePointerClick,
  Zap,
  Activity,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { DateRangeSelector } from '@/components/dashboard/DateRangeSelector';
import { DateRange, getDateRangePresets } from '@/types/dateRange';
import { CreativeAnalysisData, CreativeMetrics, getCampaignTypeDisplayName } from '@/types/creativeAnalysis';
import { formatCurrency, formatNumber, formatPercentage, cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PerformanceChart } from '@/components/creative-analysis/PerformanceChart';
import { CampaignOverview } from '@/components/creative-analysis/CampaignOverview';

const fetcher = async (url: string): Promise<CreativeAnalysisData> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch creative analysis data');
  }
  return response.json();
};

function MetricPill({ label, value, trend, format = 'number' }: {
  label: string;
  value: number;
  trend?: number;
  format?: 'number' | 'currency' | 'percentage';
}) {
  const formattedValue = format === 'currency' 
    ? formatCurrency(value) 
    : format === 'percentage' 
    ? formatPercentage(value) 
    : formatNumber(value);
  
  return (
    <div className="px-4 py-2 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50">
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-400">{label}:</span>
        <span className="text-sm font-semibold text-white">{formattedValue}</span>
        {trend !== undefined && (
          <span className={cn(
            "text-xs flex items-center gap-0.5",
            trend > 0 ? "text-emerald-400" : "text-red-400"
          )}>
            {trend > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
    </div>
  );
}

function CreativeCard({ creative }: { creative: CreativeMetrics }) {
  // Lower CPBC is better
  const isHighPerformer = creative.costPerCallBooked > 0 && creative.costPerCallBooked < 100;
  const hasNoMatch = !creative.applications && !creative.callsBooked && !creative.dealsWon && creative.spend > 0;
  const isNoUTM = creative.adName === 'No UTMs';
  
  // Truncate long ad names for display
  const displayName = creative.adName.length > 80 
    ? creative.adName.slice(0, 77) + '...' 
    : creative.adName;
    
  // Extract ad set details if available
  const adSetDisplay = creative.adSetName && creative.adSetName.length > 120
    ? creative.adSetName.slice(0, 117) + '...'
    : creative.adSetName;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group relative overflow-hidden bg-gradient-to-b from-slate-900/95 to-slate-950/95 backdrop-blur-xl rounded-2xl border border-slate-800/60 hover:border-slate-700/80 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10"
    >
      {/* Subtle glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/[0.03] via-transparent to-blue-600/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      {/* Content */}
      <div className="relative">
        {/* Header Section */}
        <div className="p-6 pb-4">
          {/* Creative Name - Full Display */}
          <div className="mb-4">
            <h3 className="font-bold text-white/95 text-base leading-relaxed break-words group-hover:text-white transition-colors" title={creative.adName}>
              {displayName}
            </h3>
            {creative.adSetName && !isNoUTM && (
              <p className="text-xs text-slate-500 mt-2 leading-relaxed break-words" title={creative.adSetName}>
                {adSetDisplay}
              </p>
            )}
          </div>
          
          {/* Status Badges */}
          <div className="flex items-center gap-2 mb-5">
            <Badge 
              variant="outline" 
              className="text-xs bg-slate-800/50 border-slate-700/50 text-slate-400 px-2 py-0.5"
            >
              {getCampaignTypeDisplayName(creative.campaignType)}
            </Badge>
            {isNoUTM && (
              <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/20 text-xs px-2 py-0.5">
                No UTMs
              </Badge>
            )}
            {!isNoUTM && isHighPerformer && (
              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs px-2 py-0.5">
                <Sparkles className="h-3 w-3 mr-1" />
                Top Performer
              </Badge>
            )}
            {!isNoUTM && hasNoMatch && (
              <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20 text-xs px-2 py-0.5">
                No Match
              </Badge>
            )}
          </div>
          
          {/* Primary Stats Row */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-slate-800/20 rounded-xl border border-slate-800/50">
            <div>
              <p className="text-xs text-slate-500 mb-1.5 font-medium uppercase tracking-wider">Total Spend</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(creative.spend)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1.5 font-medium uppercase tracking-wider">CPBC</p>
              <p className={cn(
                "text-2xl font-bold",
                creative.costPerCallBooked === 0 ? "text-slate-400" :
                creative.costPerCallBooked < 100 ? "text-emerald-400" : 
                creative.costPerCallBooked < 200 ? "text-yellow-400" : "text-red-400"
              )}>
                {creative.costPerCallBooked === 0 ? 'N/A' : formatCurrency(creative.costPerCallBooked)}
              </p>
            </div>
          </div>
        </div>
        
        {/* Metrics Grid Section */}
        <div className="px-6 pb-6">
          <div className="grid grid-cols-2 gap-3">
            {/* Impressions */}
            <div className="group/metric relative overflow-hidden bg-gradient-to-br from-slate-800/30 to-slate-900/20 rounded-xl p-4 border border-slate-800/40 hover:border-slate-700/60 transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover/metric:opacity-100 transition-opacity" />
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium mb-1">Impressions</p>
                  <p className="text-lg font-bold text-white">{formatNumber(creative.impressions)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-600">CPM</p>
                  <p className="text-sm font-semibold text-slate-400">{formatCurrency(creative.cpm)}</p>
                </div>
              </div>
            </div>
            
            {/* Clicks */}
            <div className="group/metric relative overflow-hidden bg-gradient-to-br from-slate-800/30 to-slate-900/20 rounded-xl p-4 border border-slate-800/40 hover:border-slate-700/60 transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover/metric:opacity-100 transition-opacity" />
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium mb-1">Clicks</p>
                  <p className="text-lg font-bold text-white">{formatNumber(creative.clicks)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-600">CPC</p>
                  <p className="text-sm font-semibold text-slate-400">{formatCurrency(creative.cpc)}</p>
                </div>
              </div>
            </div>
            
            {/* Applications */}
            <div className="group/metric relative overflow-hidden bg-gradient-to-br from-slate-800/30 to-slate-900/20 rounded-xl p-4 border border-slate-800/40 hover:border-slate-700/60 transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover/metric:opacity-100 transition-opacity" />
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium mb-1">Apps</p>
                  <p className="text-lg font-bold text-white">{formatNumber(creative.applications)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-600">CPA</p>
                  <p className="text-sm font-semibold text-slate-400">
                    {creative.costPerApplication > 0 ? formatCurrency(creative.costPerApplication) : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
            
            {/* MQLs */}
            <div className="group/metric relative overflow-hidden bg-gradient-to-br from-slate-800/30 to-slate-900/20 rounded-xl p-4 border border-slate-800/40 hover:border-slate-700/60 transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover/metric:opacity-100 transition-opacity" />
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium mb-1">MQLs</p>
                  <p className="text-lg font-bold text-white">{formatNumber(creative.mqls)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-600">CPMQL</p>
                  <p className="text-sm font-semibold text-slate-400">
                    {creative.costPerMQL > 0 ? formatCurrency(creative.costPerMQL) : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Calls Booked - Highlighted */}
            <div className={cn(
              "group/metric relative overflow-hidden rounded-xl p-4 border transition-all",
              creative.callsBooked > 0 
                ? "bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/30" 
                : "bg-gradient-to-br from-slate-800/30 to-slate-900/20 border-slate-800/40 hover:border-slate-700/60"
            )}>
              <div className="relative flex items-center justify-between">
                <div>
                  <p className={cn(
                    "text-xs font-medium mb-1",
                    creative.callsBooked > 0 ? "text-emerald-400" : "text-slate-500"
                  )}>Calls</p>
                  <p className={cn(
                    "text-lg font-bold",
                    creative.callsBooked > 0 ? "text-emerald-400" : "text-white"
                  )}>{formatNumber(creative.callsBooked)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-600">CPBC</p>
                  <p className={cn(
                    "text-sm font-semibold",
                    creative.costPerCallBooked > 0 && creative.costPerCallBooked < 100 ? "text-emerald-400" :
                    creative.costPerCallBooked >= 100 && creative.costPerCallBooked < 200 ? "text-yellow-400" :
                    creative.costPerCallBooked >= 200 ? "text-red-400" : "text-slate-400"
                  )}>
                    {creative.costPerCallBooked > 0 ? formatCurrency(creative.costPerCallBooked) : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Intros */}
            <div className="group/metric relative overflow-hidden bg-gradient-to-br from-slate-800/30 to-slate-900/20 rounded-xl p-4 border border-slate-800/40 hover:border-slate-700/60 transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover/metric:opacity-100 transition-opacity" />
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium mb-1">Intros</p>
                  <p className="text-lg font-bold text-white">{formatNumber(creative.callsTaken)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-600">CPICT</p>
                  <p className="text-sm font-semibold text-slate-400">
                    {creative.costPerCallTaken > 0 ? formatCurrency(creative.costPerCallTaken) : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Contracts */}
            <div className="group/metric relative overflow-hidden bg-gradient-to-br from-slate-800/30 to-slate-900/20 rounded-xl p-4 border border-slate-800/40 hover:border-slate-700/60 transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-hover/metric:opacity-100 transition-opacity" />
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium mb-1">Contracts</p>
                  <p className="text-lg font-bold text-white">{formatNumber(creative.contractsSent)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-600">CPCS</p>
                  <p className="text-sm font-semibold text-slate-400">
                    {creative.costPerContractSent > 0 ? formatCurrency(creative.costPerContractSent) : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Deals Won - Highlighted */}
            <div className={cn(
              "group/metric relative overflow-hidden rounded-xl p-4 border transition-all",
              creative.dealsWon > 0 
                ? "bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/30" 
                : "bg-gradient-to-br from-slate-800/30 to-slate-900/20 border-slate-800/40 hover:border-slate-700/60"
            )}>
              <div className="relative flex items-center justify-between">
                <div>
                  <p className={cn(
                    "text-xs font-medium mb-1",
                    creative.dealsWon > 0 ? "text-purple-400" : "text-slate-500"
                  )}>Deals</p>
                  <p className={cn(
                    "text-lg font-bold",
                    creative.dealsWon > 0 ? "text-purple-400" : "text-white"
                  )}>{formatNumber(creative.dealsWon)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-600">CPDW</p>
                  <p className="text-sm font-semibold text-slate-400">
                    {creative.costPerDealWon > 0 ? formatCurrency(creative.costPerDealWon) : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bottom Summary Bar */}
          <div className="mt-5 p-3 bg-gradient-to-r from-slate-800/30 to-slate-900/20 rounded-xl border border-slate-800/40">
            <div className="grid grid-cols-4 gap-3 text-center">
              <div>
                <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-0.5">Conv</p>
                <p className="text-sm font-bold text-white">
                  {creative.clicks > 0 ? ((creative.dealsWon / creative.clicks) * 100).toFixed(1) : '0.0'}%
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-0.5">CTR</p>
                <p className="text-sm font-bold text-white">
                  {creative.ctr ? creative.ctr.toFixed(2) : '0.00'}%
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-0.5">Revenue</p>
                <p className="text-sm font-bold text-white">
                  {formatCurrency(creative.dealsWon * 5000)}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-0.5">ROAS</p>
                <p className={cn(
                  "text-sm font-bold",
                  creative.dealsWon > 0 && creative.spend > 0 ? "text-emerald-400" : "text-slate-500"
                )}>
                  {creative.dealsWon > 0 && creative.spend > 0 
                    ? `${((creative.dealsWon * 5000) / creative.spend).toFixed(1)}x`
                    : '-'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function CreativeAnalysis() {
  const [dateRange, setDateRange] = useState<DateRange>(() => getDateRangePresets()[1]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'cpbc' | 'calls' | 'intros' | 'contracts' | 'deals'>('cpbc');
  const [filterCPBC, setFilterCPBC] = useState<'all' | 'excellent' | 'good' | 'poor'>('all');
  const [expandedCampaigns, setExpandedCampaigns] = useState<Set<string>>(new Set());
  
  const apiUrl = `/api/creative-analysis?startDate=${dateRange.startDate.toISOString()}&endDate=${dateRange.endDate.toISOString()}`;
  const { data, error, isLoading, mutate } = useSWR<CreativeAnalysisData>(apiUrl, fetcher, {
    refreshInterval: 5 * 60 * 1000, // 5 minutes
    revalidateOnFocus: true,
  });
  
  const toggleCampaignExpanded = (campaignType: string) => {
    setExpandedCampaigns(prev => {
      const newSet = new Set(prev);
      if (newSet.has(campaignType)) {
        newSet.delete(campaignType);
      } else {
        newSet.add(campaignType);
      }
      return newSet;
    });
  };
  
  // Filter and sort creatives
  const filteredAndSortedCreatives = data?.creatives
    ?.filter(creative => {
      // Search filter
      const matchesSearch = searchTerm === '' || 
        creative.adName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        creative.creativeTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        creative.utmContent.toLowerCase().includes(searchTerm.toLowerCase());
      
      // CPBC filter (lower is better)
      const matchesCPBC = filterCPBC === 'all' || 
        (filterCPBC === 'excellent' && creative.costPerCallBooked > 0 && creative.costPerCallBooked < 100) ||
        (filterCPBC === 'good' && creative.costPerCallBooked >= 100 && creative.costPerCallBooked < 200) ||
        (filterCPBC === 'poor' && creative.costPerCallBooked >= 200);
      
      return matchesSearch && matchesCPBC;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'cpbc':
          // Lower CPBC is better, but handle 0 values
          if (a.costPerCallBooked === 0) return 1;
          if (b.costPerCallBooked === 0) return -1;
          return a.costPerCallBooked - b.costPerCallBooked;
        case 'calls':
          return b.callsBooked - a.callsBooked;
        case 'intros':
          return b.callsTaken - a.callsTaken;
        case 'contracts':
          return b.contractsSent - a.contractsSent;
        case 'deals':
          return b.dealsWon - a.dealsWon;
        default:
          return (b.performanceScore || 0) - (a.performanceScore || 0);
      }
    }) || [];
  
  // Export to CSV function
  const exportToCSV = () => {
    if (!data) return;
    
    const headers = [
      'Creative Name',
      'UTM Content',
      'Ad Set ID',
      'Spend',
      'CPBC',
      'Impressions',
      'Clicks',
      'CTR',
      'Applications',
      'MQLs',
      'Calls Booked',
      'Intros Taken',
      'Contracts Sent',
      'Deals Won',
      'CPC',
      'CPA',
      'Cost Per Intro',
      'Cost Per Contract',
      'Cost Per Deal'
    ];
    
    const rows = filteredAndSortedCreatives.map(creative => [
      creative.adName,
      creative.utmContent,
      creative.adSetId || '',
      (creative.spend || 0).toFixed(2),
      creative.costPerCallBooked > 0 ? creative.costPerCallBooked.toFixed(2) : 'N/A',
      creative.impressions || 0,
      creative.clicks || 0,
      (creative.ctr || 0).toFixed(2),
      creative.applications || 0,
      creative.mqls || 0,
      creative.callsBooked || 0,
      creative.callsTaken || 0,
      creative.contractsSent || 0,
      creative.dealsWon || 0,
      (creative.cpc || 0).toFixed(2),
      creative.costPerApplication > 0 ? creative.costPerApplication.toFixed(2) : 'N/A',
      creative.costPerCallTaken > 0 ? creative.costPerCallTaken.toFixed(2) : 'N/A',
      creative.costPerContractSent > 0 ? creative.costPerContractSent.toFixed(2) : 'N/A',
      creative.costPerDealWon > 0 ? creative.costPerDealWon.toFixed(2) : 'N/A'
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `creative-analysis-${dateRange.startDate.toISOString().split('T')[0]}-to-${dateRange.endDate.toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjOTAzN0ZGIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] bg-center"></div>
      </div>
      
      {/* Floating Orbs */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000 pointer-events-none"></div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 py-12 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <h1 className="text-5xl lg:text-6xl font-extrabold">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Creative
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-green-400 to-emerald-400 bg-clip-text text-transparent">
                Analysis
              </span>
            </h1>
            <p className="text-xl text-slate-300 font-medium">
              Track performance from ad spend to deals won by creative
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-4"
          >
            <DateRangeSelector
              value={dateRange}
              onChange={setDateRange}
              disabled={isLoading}
            />
            
            <div className="flex items-center gap-3 px-4 py-2 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50">
              <div className={`h-3 w-3 rounded-full ${error ? 'bg-red-500' : 'bg-emerald-500'} ${!error ? 'animate-pulse' : ''} shadow-lg`}></div>
              <span className="text-sm font-medium text-slate-300">
                {error ? 'Connection Error' : 'Live Data'}
              </span>
            </div>
            
            {data && (
              <Badge variant="outline" className="text-xs bg-slate-800/50 border-slate-700/50 text-slate-300 px-3 py-1">
                <Calendar className="h-3 w-3 mr-1" />
                Updated {new Date(data.lastUpdated).toLocaleTimeString()}
              </Badge>
            )}
            
            <div className="flex items-center gap-3">
              <Button 
                onClick={() => mutate()} 
                disabled={isLoading}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              
              {data && (
                <Button
                  onClick={exportToCSV}
                  variant="outline"
                  className="bg-slate-800/50 border-slate-700/50 hover:bg-slate-700/50 text-white"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              )}
            </div>
          </motion.div>
        </div>
        
        {/* Campaign Performance Section - Moved to Top */}
        {data && (
          <>
            {/* Campaign Overviews */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl backdrop-blur-sm">
                  <Target className="h-6 w-6 text-purple-400" />
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
                  Campaign Performance
                </h2>
              </div>
              
              {/* Prospecting Campaign Overview */}
              {data.campaignOverviews?.find(o => o.campaignType === 'prospecting') && (
                <div className="mb-4">
                  <CampaignOverview
                    overview={data.campaignOverviews.find(o => o.campaignType === 'prospecting')!}
                    isExpanded={expandedCampaigns.has('prospecting')}
                    onToggle={() => toggleCampaignExpanded('prospecting')}
                  />
                </div>
              )}
              
              {/* Remarketing Combined Overview */}
              {(() => {
                // Combine all remarketing data for the specific campaign
                const remarketingCreatives = data.creatives.filter(c => 
                  c.campaignName?.includes('B0 | FA | Matt | R1/R2/R3/R4') ||
                  ['retargeting-r1', 'retargeting-r2', 'retargeting-r3', 'retargeting-r4'].includes(c.campaignType)
                );
                
                if (remarketingCreatives.length > 0) {
                  const remarketingOverview = {
                    campaignType: 'remarketing-combined',
                    campaignName: 'Remarketing (R1/R2/R3/R4)',
                    creativeCount: remarketingCreatives.length,
                    totalSpend: remarketingCreatives.reduce((sum, c) => sum + c.spend, 0),
                    impressions: remarketingCreatives.reduce((sum, c) => sum + c.impressions, 0),
                    clicks: remarketingCreatives.reduce((sum, c) => sum + c.clicks, 0),
                    applications: remarketingCreatives.reduce((sum, c) => sum + c.applications, 0),
                    mqls: remarketingCreatives.reduce((sum, c) => sum + c.mqls, 0),
                    callsBooked: remarketingCreatives.reduce((sum, c) => sum + c.callsBooked, 0),
                    callsTaken: remarketingCreatives.reduce((sum, c) => sum + c.callsTaken, 0),
                    contractsSent: remarketingCreatives.reduce((sum, c) => sum + c.contractsSent, 0),
                    dealsWon: remarketingCreatives.reduce((sum, c) => sum + c.dealsWon, 0),
                    ctr: 0,
                    cpc: 0,
                    cpm: 0,
                    costPerCallBooked: 0,
                    costPerCallTaken: 0,
                    costPerContractSent: 0,
                    costPerDealWon: 0,
                    costPerApplication: 0,
                    costPerMQL: 0,
                    applicationRate: 0,
                    mqlRate: 0,
                    callBookingRate: 0,
                    callTakenRate: 0,
                    contractSentRate: 0,
                    dealWonRate: 0,
                  };
                  
                  // Calculate rates and costs
                  remarketingOverview.ctr = remarketingOverview.impressions > 0 ? (remarketingOverview.clicks / remarketingOverview.impressions) * 100 : 0;
                  remarketingOverview.cpc = remarketingOverview.clicks > 0 ? remarketingOverview.totalSpend / remarketingOverview.clicks : 0;
                  remarketingOverview.cpm = remarketingOverview.impressions > 0 ? (remarketingOverview.totalSpend / remarketingOverview.impressions) * 1000 : 0;
                  remarketingOverview.costPerCallBooked = remarketingOverview.callsBooked > 0 ? remarketingOverview.totalSpend / remarketingOverview.callsBooked : 0;
                  remarketingOverview.costPerCallTaken = remarketingOverview.callsTaken > 0 ? remarketingOverview.totalSpend / remarketingOverview.callsTaken : 0;
                  remarketingOverview.costPerContractSent = remarketingOverview.contractsSent > 0 ? remarketingOverview.totalSpend / remarketingOverview.contractsSent : 0;
                  remarketingOverview.costPerDealWon = remarketingOverview.dealsWon > 0 ? remarketingOverview.totalSpend / remarketingOverview.dealsWon : 0;
                  remarketingOverview.costPerApplication = remarketingOverview.applications > 0 ? remarketingOverview.totalSpend / remarketingOverview.applications : 0;
                  remarketingOverview.costPerMQL = remarketingOverview.mqls > 0 ? remarketingOverview.totalSpend / remarketingOverview.mqls : 0;
                  
                  // Calculate conversion rates
                  remarketingOverview.applicationRate = remarketingOverview.clicks > 0 ? (remarketingOverview.applications / remarketingOverview.clicks) * 100 : 0;
                  remarketingOverview.mqlRate = remarketingOverview.applications > 0 ? (remarketingOverview.mqls / remarketingOverview.applications) * 100 : 0;
                  remarketingOverview.callBookingRate = remarketingOverview.mqls > 0 ? (remarketingOverview.callsBooked / remarketingOverview.mqls) * 100 : 0;
                  remarketingOverview.callTakenRate = remarketingOverview.callsBooked > 0 ? (remarketingOverview.callsTaken / remarketingOverview.callsBooked) * 100 : 0;
                  remarketingOverview.contractSentRate = remarketingOverview.callsTaken > 0 ? (remarketingOverview.contractsSent / remarketingOverview.callsTaken) * 100 : 0;
                  remarketingOverview.dealWonRate = remarketingOverview.contractsSent > 0 ? (remarketingOverview.dealsWon / remarketingOverview.contractsSent) * 100 : 0;
                  
                  return (
                    <div className="mb-4">
                      <CampaignOverview
                        overview={remarketingOverview as any}
                        isExpanded={expandedCampaigns.has('remarketing-combined')}
                        onToggle={() => toggleCampaignExpanded('remarketing-combined')}
                      />
                    </div>
                  );
                }
                return null;
              })()}
            </motion.div>
            
            {/* Summary Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
              <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/40 backdrop-blur-sm border-slate-700/50 p-6 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Total Spend</p>
                    <p className="text-2xl font-bold text-white group-hover:text-purple-200 transition-colors">{formatCurrency(data.summary.totalSpend)}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-purple-400 opacity-50 group-hover:opacity-70 transition-opacity" />
                </div>
              </Card>
              
              <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/40 backdrop-blur-sm border-slate-700/50 p-6 hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-300 group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Calls Booked</p>
                    <p className="text-2xl font-bold text-white group-hover:text-cyan-200 transition-colors">{formatNumber(data.summary.totalCallsBooked)}</p>
                  </div>
                  <Phone className="h-8 w-8 text-cyan-400 opacity-50 group-hover:opacity-70 transition-opacity" />
                </div>
              </Card>
              
              <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/40 backdrop-blur-sm border-slate-700/50 p-6 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300 group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Intros Taken</p>
                    <p className="text-2xl font-bold text-white group-hover:text-emerald-200 transition-colors">{formatNumber(data.summary.totalCallsTaken)}</p>
                  </div>
                  <Phone className="h-8 w-8 text-emerald-400 opacity-50 group-hover:opacity-70 transition-opacity" />
                </div>
              </Card>
              
              <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/40 backdrop-blur-sm border-slate-700/50 p-6 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Contracts Sent</p>
                    <p className="text-2xl font-bold text-white group-hover:text-blue-200 transition-colors">{formatNumber(data.summary.totalContractsSent)}</p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-400 opacity-50 group-hover:opacity-70 transition-opacity" />
                </div>
              </Card>
              
              <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/40 backdrop-blur-sm border-slate-700/50 p-6 hover:shadow-lg hover:shadow-pink-500/10 transition-all duration-300 group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Deals Won</p>
                    <p className="text-2xl font-bold text-white group-hover:text-pink-200 transition-colors">{formatNumber(data.summary.totalDealsWon)}</p>
                  </div>
                  <Award className="h-8 w-8 text-pink-400 opacity-50 group-hover:opacity-70 transition-opacity" />
                </div>
              </Card>
              
              <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/40 backdrop-blur-sm border-slate-700/50 p-6 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Avg CPBC</p>
                    <p className={cn(
                      "text-2xl font-bold transition-colors",
                      data.summary.avgCPBC < 100 ? "text-emerald-400 group-hover:text-emerald-300" : 
                      data.summary.avgCPBC < 200 ? "text-yellow-400 group-hover:text-yellow-300" : "text-red-400 group-hover:text-red-300"
                    )}>
                      {formatCurrency(data.summary.avgCPBC)}
                    </p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-purple-400 opacity-50 group-hover:opacity-70 transition-opacity" />
                </div>
              </Card>
            </motion.div>
          </>
        )}
        
        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <RefreshCw className="h-12 w-12 text-purple-400 animate-spin mx-auto mb-4" />
              <p className="text-lg text-slate-300">Loading creative performance data...</p>
            </div>
          </div>
        )}
        
        {/* Error State */}
        {error && !isLoading && (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-red-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Failed to Load Data</h3>
              <p className="text-gray-400 mb-4">{error.message}</p>
              <Button onClick={() => mutate()} className="bg-red-600 hover:bg-red-700">
                Try Again
              </Button>
            </div>
          </div>
        )}
        
        {/* Creative Cards Grid */}
        {data && !isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            {/* Performance Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mb-12"
            >
              <PerformanceChart creatives={data.creatives.filter(c => !c.isUnmatched)} />
            </motion.div>
            
            {/* Prospecting Section */}
            {(() => {
              const prospectingCreatives = data.creatives
                .filter(c => c.campaignType === 'prospecting')
                .sort((a, b) => {
                  // Sort by CPBC (lower is better), but put 0 CPBC at the end
                  if (a.costPerCallBooked === 0) return 1;
                  if (b.costPerCallBooked === 0) return -1;
                  return a.costPerCallBooked - b.costPerCallBooked;
                });
              
              if (prospectingCreatives.length === 0) return null;
              
              return (
                <div className="mb-12">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl backdrop-blur-sm">
                      <Target className="h-5 w-5 text-purple-400" />
                    </div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">Prospecting Campaign</h2>
                    <Badge className="bg-gradient-to-r from-purple-500/20 to-purple-600/20 text-purple-200 border-purple-500/30 backdrop-blur-sm">
                      {prospectingCreatives.length} Creatives
                    </Badge>
                  </div>
                  
                  {/* Prospecting Creatives Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {prospectingCreatives.map((creative, index) => (
                      <motion.div
                        key={creative.adId}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <CreativeCard creative={creative} />
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            })()}
            
            {/* Remarketing Combined Section */}
            {(() => {
              const remarketingCreatives = data.creatives
                .filter(c => 
                  c.campaignName?.includes('B0 | FA | Matt | R1/R2/R3/R4') ||
                  ['retargeting-r1', 'retargeting-r2', 'retargeting-r3', 'retargeting-r4'].includes(c.campaignType)
                )
                .sort((a, b) => {
                  // Sort by CPBC (lower is better), but put 0 CPBC at the end
                  if (a.costPerCallBooked === 0) return 1;
                  if (b.costPerCallBooked === 0) return -1;
                  return a.costPerCallBooked - b.costPerCallBooked;
                });
              
              if (remarketingCreatives.length === 0) return null;
              
              return (
                <div className="mb-12">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl backdrop-blur-sm">
                      <Target className="h-5 w-5 text-blue-400" />
                    </div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">Remarketing Campaign</h2>
                    <Badge className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-200 border-blue-500/30 backdrop-blur-sm">
                      {remarketingCreatives.length} Creatives
                    </Badge>
                  </div>
                  
                  {/* Remarketing Creatives Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {remarketingCreatives.map((creative, index) => (
                      <motion.div
                        key={creative.adId}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <CreativeCard creative={creative} />
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </motion.div>
        )}
      </div>
    </div>
  );
}
