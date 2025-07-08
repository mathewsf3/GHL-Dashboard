'use client';

import { motion } from 'framer-motion';
import { CampaignOverview as CampaignOverviewType } from '@/types/creativeAnalysis';
import { formatCurrency, formatNumber, formatPercentage, cn } from '@/lib/utils';
import { 
  TrendingUp, 
  DollarSign, 
  MousePointerClick, 
  Users, 
  Phone, 
  FileText, 
  Award,
  ChevronRight,
  Target,
  BarChart3,
  ArrowUpRight,
  Zap,
  Activity,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface CampaignOverviewProps {
  overview: CampaignOverviewType;
  isExpanded?: boolean;
  onToggle?: () => void;
}

export function CampaignOverview({ overview, isExpanded = false, onToggle }: CampaignOverviewProps) {
  const isProspecting = overview.campaignType === 'prospecting';
  const isRemarketingCombined = overview.campaignType === 'remarketing-combined' || overview.campaignName.includes('R1/R2/R3/R4');
  const campaignColor = isProspecting ? 'purple' : 'blue';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
      className={cn(
        "relative overflow-hidden rounded-2xl",
        "bg-gradient-to-br backdrop-blur-xl",
        isProspecting 
          ? "from-purple-950/40 via-purple-900/30 to-slate-900/40" 
          : "from-blue-950/40 via-blue-900/30 to-slate-900/40",
        "border",
        isProspecting ? "border-purple-500/30" : "border-blue-500/30",
        "hover:shadow-2xl transition-all duration-300",
        isProspecting ? "hover:shadow-purple-500/20" : "hover:shadow-blue-500/20"
      )}
    >
      {/* Animated gradient background */}
      <div className={cn(
        "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
        "bg-gradient-to-r",
        isProspecting ? "from-purple-500/10 to-pink-500/10" : "from-blue-500/10 to-cyan-500/10"
      )} />
      
      {/* Header */}
      <div 
        className="relative p-6 cursor-pointer hover:bg-white/5 transition-colors rounded-t-2xl"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              className={cn(
                "p-3 rounded-xl bg-gradient-to-br",
                isProspecting ? "from-purple-500/30 to-purple-600/20" : "from-blue-500/30 to-blue-600/20"
              )}
            >
              <Target className={cn(
                "h-6 w-6",
                isProspecting ? "text-purple-400" : "text-blue-400"
              )} />
            </motion.div>
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
                {overview.campaignName}
              </h3>
              <p className="text-sm text-slate-400 mt-1 flex items-center gap-2">
                <Activity className="h-3 w-3" />
                {overview.creativeCount} Active Creatives
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {overview.dealsWon > 0 && (
              <Badge className="bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 text-emerald-200 border-emerald-500/30 px-4 py-1.5 backdrop-blur-sm">
                <TrendingUp className="h-4 w-4 mr-2" />
                ROAS: {((overview.dealsWon * 5000) / overview.totalSpend).toFixed(1)}x
              </Badge>
            )}
            <motion.div
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronRight className="h-5 w-5 text-slate-400" />
            </motion.div>
          </div>
        </div>
        
        {/* Key Metrics Grid - Enhanced */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <motion.div 
            whileHover={{ y: -2 }}
            className="bg-gradient-to-br from-slate-800/50 to-slate-900/40 rounded-xl p-4 border border-slate-700/30 hover:border-purple-500/30 transition-all duration-300"
          >
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-purple-400" />
              <p className="text-xs text-slate-400">Total Spend</p>
            </div>
            <p className="text-2xl font-bold text-white">{formatCurrency(overview.totalSpend)}</p>
            <p className="text-xs text-slate-500 mt-1">CPM: {formatCurrency(overview.cpm)}</p>
          </motion.div>
          
          <motion.div 
            whileHover={{ y: -2 }}
            className="bg-gradient-to-br from-slate-800/50 to-slate-900/40 rounded-xl p-4 border border-slate-700/30 hover:border-blue-500/30 transition-all duration-300"
          >
            <div className="flex items-center gap-2 mb-2">
              <MousePointerClick className="h-4 w-4 text-blue-400" />
              <p className="text-xs text-slate-400">Clicks</p>
            </div>
            <p className="text-2xl font-bold text-white">{formatNumber(overview.clicks)}</p>
            <p className="text-xs text-slate-500 mt-1">CPC: {formatCurrency(overview.cpc)}</p>
          </motion.div>
          
          <motion.div 
            whileHover={{ y: -2 }}
            className="bg-gradient-to-br from-slate-800/50 to-slate-900/40 rounded-xl p-4 border border-slate-700/30 hover:border-cyan-500/30 transition-all duration-300"
          >
            <div className="flex items-center gap-2 mb-2">
              <Phone className="h-4 w-4 text-cyan-400" />
              <p className="text-xs text-slate-400">Calls Booked</p>
            </div>
            <p className="text-2xl font-bold text-white">{formatNumber(overview.callsBooked)}</p>
            <p className={cn(
              "text-xs mt-1 font-medium",
              overview.costPerCallBooked < 100 ? "text-emerald-400" : 
              overview.costPerCallBooked < 200 ? "text-yellow-400" : "text-red-400"
            )}>
              CPBC: {formatCurrency(overview.costPerCallBooked)}
            </p>
          </motion.div>
          
          <motion.div 
            whileHover={{ y: -2 }}
            className="bg-gradient-to-br from-slate-800/50 to-slate-900/40 rounded-xl p-4 border border-slate-700/30 hover:border-emerald-500/30 transition-all duration-300"
          >
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-emerald-400" />
              <p className="text-xs text-slate-400">Contracts</p>
            </div>
            <p className="text-2xl font-bold text-white">{formatNumber(overview.contractsSent)}</p>
            <p className="text-xs text-slate-500 mt-1">
              CPCS: {overview.costPerContractSent > 0 ? formatCurrency(overview.costPerContractSent) : 'N/A'}
            </p>
          </motion.div>
          
          <motion.div 
            whileHover={{ y: -2 }}
            className="bg-gradient-to-br from-slate-800/50 to-slate-900/40 rounded-xl p-4 border border-slate-700/30 hover:border-pink-500/30 transition-all duration-300"
          >
            <div className="flex items-center gap-2 mb-2">
              <Award className="h-4 w-4 text-pink-400" />
              <p className="text-xs text-slate-400">Deals Won</p>
            </div>
            <p className="text-2xl font-bold text-white">{formatNumber(overview.dealsWon)}</p>
            <p className="text-xs text-slate-500 mt-1">
              CPDW: {overview.costPerDealWon > 0 ? formatCurrency(overview.costPerDealWon) : 'N/A'}
            </p>
          </motion.div>
        </div>
      </div>
      
      {/* Expanded Content */}
      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="border-t border-slate-700/50"
        >
          <div className="p-6 space-y-6 bg-slate-900/20">
            {/* Full Funnel Visualization - Enhanced */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <div className="p-1.5 bg-yellow-500/20 rounded-lg">
                  <Zap className="h-4 w-4 text-yellow-400" />
                </div>
                Full Funnel Performance
              </h4>
              <div className="relative">
                {/* Funnel Flow Line */}
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-emerald-500/20 -translate-y-1/2 hidden lg:block" />
                
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 relative">
                  {[
                    { label: 'Impressions', value: overview.impressions, color: 'purple', icon: Sparkles },
                    { label: 'Clicks', value: overview.clicks, rate: overview.ctr, color: 'blue', icon: MousePointerClick },
                    { label: 'Applications', value: overview.applications, rate: overview.applicationRate, color: 'cyan', icon: Users },
                    { label: 'MQLs', value: overview.mqls, rate: overview.mqlRate, color: 'emerald', icon: Target },
                    { label: 'Calls Booked', value: overview.callsBooked, rate: overview.callBookingRate, color: 'green', icon: Phone },
                    { label: 'Intros Taken', value: overview.callsTaken, rate: overview.callTakenRate, color: 'yellow', icon: Users },
                    { label: 'Contracts', value: overview.contractsSent, rate: overview.contractSentRate, color: 'pink', icon: FileText },
                  ].map((step, index) => {
                    const Icon = step.icon;
                    return (
                      <motion.div 
                        key={step.label} 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="relative"
                      >
                        {index > 0 && (
                          <ArrowRight className="absolute -left-4 top-1/2 transform -translate-y-1/2 text-slate-600 h-4 w-4 hidden lg:block" />
                        )}
                        <div className={cn(
                          "bg-gradient-to-br from-slate-800/50 to-slate-900/40 rounded-lg p-3 text-center",
                          "border hover:shadow-lg transition-all duration-300",
                          `border-${step.color}-500/30 hover:border-${step.color}-500/50`
                        )}>
                          <div className="flex items-center justify-center gap-1 mb-2">
                            <Icon className={`h-3 w-3 text-${step.color}-400`} />
                            <p className="text-xs text-slate-400">{step.label}</p>
                          </div>
                          <p className="text-lg font-bold text-white">{formatNumber(step.value)}</p>
                          {step.rate !== undefined && (
                            <p className={cn(
                              "text-xs mt-1 font-medium",
                              step.rate > 20 ? "text-emerald-400" : 
                              step.rate > 10 ? "text-yellow-400" : "text-red-400"
                            )}>
                              {step.rate.toFixed(1)}%
                            </p>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
            
            {/* Cost Analysis - Enhanced Grid */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <div className="p-1.5 bg-purple-500/20 rounded-lg">
                  <BarChart3 className="h-4 w-4 text-purple-400" />
                </div>
                Cost Analysis & Efficiency Metrics
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 rounded-lg p-4 border border-slate-700/30 hover:border-purple-500/30 transition-all"
                >
                  <p className="text-xs text-slate-400 mb-2">Cost Per Application</p>
                  <p className="text-xl font-bold text-white">
                    {overview.costPerApplication > 0 ? formatCurrency(overview.costPerApplication) : 'N/A'}
                  </p>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 rounded-lg p-4 border border-slate-700/30 hover:border-blue-500/30 transition-all"
                >
                  <p className="text-xs text-slate-400 mb-2">Cost Per MQL</p>
                  <p className="text-xl font-bold text-white">
                    {overview.costPerMQL > 0 ? formatCurrency(overview.costPerMQL) : 'N/A'}
                  </p>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 rounded-lg p-4 border border-slate-700/30 hover:border-emerald-500/30 transition-all"
                >
                  <p className="text-xs text-slate-400 mb-2">Cost Per Intro Taken</p>
                  <p className="text-xl font-bold text-white">
                    {overview.costPerCallTaken > 0 ? formatCurrency(overview.costPerCallTaken) : 'N/A'}
                  </p>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 rounded-lg p-4 border border-slate-700/30 hover:border-pink-500/30 transition-all"
                >
                  <p className="text-xs text-slate-400 mb-2">Overall Conv. Rate</p>
                  <p className="text-xl font-bold text-white">
                    {overview.clicks > 0 ? ((overview.dealsWon / overview.clicks) * 100).toFixed(2) : '0'}%
                  </p>
                </motion.div>
              </div>
            </div>
            
            {/* Performance Summary */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-800/30 to-slate-900/20 rounded-lg border border-slate-700/30">
              <div className="flex items-center gap-3">
                <Activity className="h-5 w-5 text-purple-400" />
                <span className="text-sm text-slate-300">Campaign Efficiency Score</span>
              </div>
              <div className="flex items-center gap-4">
                <Badge className={cn(
                  "px-3 py-1",
                  overview.costPerCallBooked < 100 ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" :
                  overview.costPerCallBooked < 200 ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" :
                  "bg-red-500/20 text-red-300 border-red-500/30"
                )}>
                  {overview.costPerCallBooked < 100 ? 'Excellent' :
                   overview.costPerCallBooked < 200 ? 'Good' : 'Needs Optimization'}
                </Badge>
                <span className="text-sm font-bold text-white">
                  {overview.dealsWon > 0 
                    ? `${((overview.dealsWon / overview.clicks) * 100).toFixed(3)}% CTD`
                    : '0% CTD'
                  }
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}