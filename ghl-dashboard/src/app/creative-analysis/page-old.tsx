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
  MousePointerClick
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
  const isUnmatched = creative.isUnmatched === true;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className={cn(
        "group relative overflow-hidden h-full",
        "bg-gradient-to-br from-slate-800/60 to-slate-900/40 backdrop-blur-sm rounded-2xl border",
        isUnmatched ? "border-purple-500/30" :
        hasNoMatch ? "border-orange-500/30" :
        isHighPerformer 
          ? "border-emerald-500/30 shadow-emerald-500/10" 
          : "border-slate-700/50",
        "hover:border-slate-600/50 transition-all duration-300 hover:shadow-xl"
      )}
    >
      <div className="p-5">
        {/* Header Section with Performance Badge */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-white text-sm truncate mb-1" title={creative.adName}>
              {creative.adName || 'Untitled Creative'}
            </h3>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs bg-slate-700/30 shrink-0">
                <Target className="h-3 w-3 mr-1" />
                {getCampaignTypeDisplayName(creative.campaignType)}
              </Badge>
              {creative.adSetName && (
                <span className="text-xs text-slate-400 truncate" title={creative.adSetName}>
                  {creative.adSetName}
                </span>
              )}
            </div>
          </div>
          
          {/* Performance Badge */}
          {isUnmatched && (
            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 shrink-0">
              No UTM
            </Badge>
          )}
          {!isUnmatched && isHighPerformer && (
            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 shrink-0">
              <Sparkles className="h-3 w-3 mr-1" />
              Top
            </Badge>
          )}
          {!isUnmatched && hasNoMatch && (
            <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30 shrink-0">
              No Match
            </Badge>
          )}
        </div>
        
        {/* Primary Metrics - Highlighted */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gradient-to-br from-purple-900/20 to-transparent rounded-xl p-3 border border-purple-500/10">
            <p className="text-xs text-purple-300 mb-1">Total Spend</p>
            <p className="text-lg font-bold text-white">{formatCurrency(creative.spend)}</p>
          </div>
          <div className={cn(
            "rounded-xl p-3 border",
            creative.costPerCallBooked === 0 
              ? "bg-slate-900/30 border-slate-700/30" 
              : creative.costPerCallBooked < 100 
              ? "bg-gradient-to-br from-emerald-900/20 to-transparent border-emerald-500/10" 
              : creative.costPerCallBooked < 200
              ? "bg-gradient-to-br from-yellow-900/20 to-transparent border-yellow-500/10"
              : "bg-gradient-to-br from-red-900/20 to-transparent border-red-500/10"
          )}>
            <p className={cn(
              "text-xs mb-1",
              creative.costPerCallBooked === 0 ? "text-slate-400" :
              creative.costPerCallBooked < 100 ? "text-emerald-300" : 
              creative.costPerCallBooked < 200 ? "text-yellow-300" : "text-red-300"
            )}>CPBC</p>
            <p className={cn(
              "text-lg font-bold",
              creative.costPerCallBooked === 0 ? "text-slate-400" :
              creative.costPerCallBooked < 100 ? "text-emerald-400" : 
              creative.costPerCallBooked < 200 ? "text-yellow-400" : "text-red-400"
            )}>
              {creative.costPerCallBooked === 0 ? 'N/A' : formatCurrency(creative.costPerCallBooked)}
            </p>
          </div>
        </div>
        
        {/* Funnel Metrics - Compact Grid */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Funnel Performance</div>
          
          <div className="grid grid-cols-2 gap-1.5 text-xs">
            {/* Row 1: Traffic */}
            <div className="bg-slate-900/30 rounded-lg p-2">
              <div className="flex justify-between items-baseline">
                <span className="text-slate-500">Impressions</span>
                <span className="font-medium text-slate-200">{formatNumber(creative.impressions)}</span>
              </div>
              <p className="text-slate-600 text-xs mt-0.5">CPM: {formatCurrency(creative.cpm)}</p>
            </div>
            <div className="bg-slate-900/30 rounded-lg p-2">
              <div className="flex justify-between items-baseline">
                <span className="text-slate-500">Clicks</span>
                <span className="font-medium text-slate-200">{formatNumber(creative.clicks)}</span>
              </div>
              <p className="text-slate-600 text-xs mt-0.5">{(creative.ctr || 0).toFixed(2)}% • {formatCurrency(creative.cpc)}</p>
            </div>
            
            {/* Row 2: Leads */}
            <div className="bg-slate-900/30 rounded-lg p-2">
              <div className="flex justify-between items-baseline">
                <span className="text-slate-500">Apps</span>
                <span className="font-medium text-slate-200">{formatNumber(creative.applications)}</span>
              </div>
              <p className="text-slate-600 text-xs mt-0.5">
                {(creative.conversionRate || 0).toFixed(1)}% • {creative.costPerApplication > 0 ? formatCurrency(creative.costPerApplication) : 'N/A'}
              </p>
            </div>
            <div className="bg-slate-900/30 rounded-lg p-2">
              <div className="flex justify-between items-baseline">
                <span className="text-slate-500">MQLs</span>
                <span className="font-medium text-slate-200">{formatNumber(creative.mqls)}</span>
              </div>
              <p className="text-slate-600 text-xs mt-0.5">
                {(creative.mqlRate || 0).toFixed(1)}% • {creative.costPerMQL > 0 ? formatCurrency(creative.costPerMQL) : 'N/A'}
              </p>
            </div>
            
            {/* Row 3: Sales */}
            <div className="bg-emerald-900/10 rounded-lg p-2 border border-emerald-500/10">
              <div className="flex justify-between items-baseline">
                <span className="text-emerald-400">Calls</span>
                <span className="font-bold text-emerald-400">{formatNumber(creative.callsBooked)}</span>
              </div>
              <p className="text-emerald-300/60 text-xs mt-0.5">
                {(creative.callBookingRate || 0).toFixed(1)}% • {creative.costPerCallBooked > 0 ? formatCurrency(creative.costPerCallBooked) : 'N/A'}
              </p>
            </div>
            <div className="bg-slate-900/30 rounded-lg p-2">
              <div className="flex justify-between items-baseline">
                <span className="text-slate-500">Intros</span>
                <span className="font-medium text-slate-200">{formatNumber(creative.callsTaken)}</span>
              </div>
              <p className="text-slate-600 text-xs mt-0.5">
                {(creative.callTakenRate || 0).toFixed(1)}% • {creative.costPerCallTaken > 0 ? formatCurrency(creative.costPerCallTaken) : 'N/A'}
              </p>
            </div>
            
            {/* Row 4: Closing */}
            <div className="bg-slate-900/30 rounded-lg p-2">
              <div className="flex justify-between items-baseline">
                <span className="text-slate-500">Contracts</span>
                <span className="font-medium text-slate-200">{formatNumber(creative.contractsSent)}</span>
              </div>
              <p className="text-slate-600 text-xs mt-0.5">
                {(creative.contractSentRate || 0).toFixed(1)}% • {creative.costPerContractSent > 0 ? formatCurrency(creative.costPerContractSent) : 'N/A'}
              </p>
            </div>
            <div className="bg-purple-900/10 rounded-lg p-2 border border-purple-500/10">
              <div className="flex justify-between items-baseline">
                <span className="text-purple-400">Deals</span>
                <span className="font-bold text-purple-400">{formatNumber(creative.dealsWon)}</span>
              </div>
              <p className="text-purple-300/60 text-xs mt-0.5">
                {(creative.dealWonRate || 0).toFixed(1)}% • {creative.costPerDealWon > 0 ? formatCurrency(creative.costPerDealWon) : 'N/A'}
              </p>
            </div>
          </div>
        </div>
        
        {/* ROAS if deals exist */}
        {creative.dealsWon > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-700/50">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">ROAS</span>
              <span className="text-sm font-bold bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent">
                {((creative.dealsWon * 5000) / creative.spend).toFixed(1)}x
              </span>
            </div>
          </div>
        )}
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
      // Don't show unmatched creatives separately - they'll be counted in overview
      if (creative.isUnmatched) return false;
      
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
          if (a.costPerCallBooked === 0 && b.costPerCallBooked === 0) return 0;
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
  
  // Get unmatched data for counts
  const unmatchedData = data?.creatives?.find(c => c.isUnmatched);
  
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
        
        {/* Summary Stats */}
        {data && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8"
          >
            <Card className="bg-slate-800/40 backdrop-blur-sm border-slate-700/50 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Total Spend</p>
                  <p className="text-2xl font-bold text-white">{formatCurrency(data.summary.totalSpend)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-400 opacity-50" />
              </div>
            </Card>
            
            <Card className="bg-slate-800/40 backdrop-blur-sm border-slate-700/50 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Calls Booked</p>
                  <p className="text-2xl font-bold text-white">{formatNumber(data.summary.totalCallsBooked)}</p>
                </div>
                <Phone className="h-8 w-8 text-cyan-400 opacity-50" />
              </div>
            </Card>
            
            <Card className="bg-slate-800/40 backdrop-blur-sm border-slate-700/50 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Intros Taken</p>
                  <p className="text-2xl font-bold text-white">{formatNumber(data.summary.totalCallsTaken)}</p>
                </div>
                <Phone className="h-8 w-8 text-emerald-400 opacity-50" />
              </div>
            </Card>
            
            <Card className="bg-slate-800/40 backdrop-blur-sm border-slate-700/50 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Contracts Sent</p>
                  <p className="text-2xl font-bold text-white">{formatNumber(data.summary.totalContractsSent)}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-400 opacity-50" />
              </div>
            </Card>
            
            <Card className="bg-slate-800/40 backdrop-blur-sm border-slate-700/50 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Deals Won</p>
                  <p className="text-2xl font-bold text-white">{formatNumber(data.summary.totalDealsWon)}</p>
                </div>
                <Award className="h-8 w-8 text-pink-400 opacity-50" />
              </div>
            </Card>
            
            <Card className="bg-slate-800/40 backdrop-blur-sm border-slate-700/50 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Avg CPBC</p>
                  <p className={cn(
                    "text-2xl font-bold",
                    data.summary.avgCPBC < 100 ? "text-emerald-400" : 
                    data.summary.avgCPBC < 200 ? "text-yellow-400" : "text-red-400"
                  )}>
                    {formatCurrency(data.summary.avgCPBC)}
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-400 opacity-50" />
              </div>
            </Card>
          </motion.div>
        )}
        
        {/* Campaign Overviews */}
        {data?.campaignOverviews && data.campaignOverviews.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mb-12"
          >
            <div className="flex items-center gap-2 mb-6">
              <Target className="h-6 w-6 text-purple-400" />
              <h2 className="text-2xl font-bold text-white">Campaign Performance</h2>
            </div>
            <div className="space-y-4">
              {data.campaignOverviews.map((overview, index) => (
                <motion.div
                  key={overview.campaignType}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <CampaignOverview
                    overview={overview}
                    isExpanded={expandedCampaigns.has(overview.campaignType)}
                    onToggle={() => toggleCampaignExpanded(overview.campaignType)}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
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
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <Target className="h-5 w-5 text-purple-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Prospecting Campaign</h2>
                    <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                      {prospectingCreatives.length} Creatives
                    </Badge>
                  </div>
                  
                  {/* Prospecting Overview */}
                  {data.campaignOverviews?.find(o => o.campaignType === 'prospecting') && (
                    <CampaignOverview
                      overview={data.campaignOverviews.find(o => o.campaignType === 'prospecting')!}
                      isExpanded={expandedCampaigns.has('prospecting')}
                      onToggle={() => toggleCampaignExpanded('prospecting')}
                    />
                  )}
                  
                  {/* Prospecting Creatives Grid */}
                  <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
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
            
            {/* Remarketing Sections */}
            {['retargeting-r1', 'retargeting-r2', 'retargeting-r3', 'retargeting-r4'].map(retargetingType => {
              const retargetingCreatives = data.creatives
                .filter(c => c.campaignType === retargetingType)
                .sort((a, b) => {
                  // Sort by CPBC (lower is better), but put 0 CPBC at the end
                  if (a.costPerCallBooked === 0) return 1;
                  if (b.costPerCallBooked === 0) return -1;
                  return a.costPerCallBooked - b.costPerCallBooked;
                });
              
              if (retargetingCreatives.length === 0) return null;
              
              const levelNumber = retargetingType.split('-')[1].toUpperCase();
              
              return (
                <div key={retargetingType} className="mb-12">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <Target className="h-5 w-5 text-blue-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Remarketing {levelNumber} Campaign</h2>
                    <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                      {retargetingCreatives.length} Creatives
                    </Badge>
                  </div>
                  
                  {/* Remarketing Overview */}
                  {data.campaignOverviews?.find(o => o.campaignType === retargetingType) && (
                    <CampaignOverview
                      overview={data.campaignOverviews.find(o => o.campaignType === retargetingType)!}
                      isExpanded={expandedCampaigns.has(retargetingType)}
                      onToggle={() => toggleCampaignExpanded(retargetingType)}
                    />
                  )}
                  
                  {/* Remarketing Creatives Grid */}
                  <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {retargetingCreatives.map((creative, index) => (
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
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}