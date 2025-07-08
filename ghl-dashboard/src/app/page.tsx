'use client';

// Temporary debug - remove after testing
if (typeof window !== 'undefined') {
  console.log('Environment check on client - this should be empty:', {
    META: process.env.META_ACCESS_TOKEN,
    GHL: process.env.GHL_API_KEY
  });
}

import { useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, TrendingUp, Calendar, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { FunnelChart } from '@/components/dashboard/FunnelChart';
import { LiveDataProvider, useLiveData } from '@/components/dashboard/LiveDataProvider';
import { DateRangeSelector } from '@/components/dashboard/DateRangeSelector';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { FunnelStage } from '@/types/dashboard';

function DashboardHeader() {
  const { data, isLoading, mutate, error, dateRange, setDateRange } = useLiveData();
  
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-12">
      <div className="space-y-4">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl lg:text-6xl font-extrabold">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Customer Journey
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-green-400 to-emerald-400 bg-clip-text text-transparent">
              Analytics
            </span>
          </h1>
        </motion.div>
        <motion.p 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-xl text-slate-300 font-medium"
        >
          Real-time Meta Ads → GHL conversion tracking
        </motion.p>
      </div>
      
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
        
        <Button 
          onClick={() => mutate()} 
          disabled={isLoading}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </motion.div>
    </div>
  );
}

function ErrorDisplay({ error }: { error: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center justify-center min-h-[400px]"
    >
      <div className="text-center max-w-md">
        <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Data Fetch Error</h3>
        <p className="text-gray-400 mb-4">{error}</p>
        <p className="text-sm text-gray-500">
          Please check your API connections and try refreshing.
        </p>
      </div>
    </motion.div>
  );
}

function DashboardContent() {
  const { data, isLoading, error, dateRange } = useLiveData();

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  // Create funnel stages from data
  const funnelStages: FunnelStage[] = data ? [
    {
      name: 'Applications',
      value: data.totalApplications,
      cost: data.costPerApplication,
    },
    {
      name: 'MQLs',
      value: data.totalMQLs,
      cost: data.costPerMQL,
      conversionRate: data.totalApplications > 0 ? (data.totalMQLs / data.totalApplications) * 100 : 0,
    },
    {
      name: 'Calls Booked',
      value: data.callsBooked,
      cost: data.costPerCallBooked,
      conversionRate: data.totalMQLs > 0 ? (data.callsBooked / data.totalMQLs) * 100 : 0,
    },
    {
      name: 'Intros Taken',
      value: data.introsTaken,
      cost: data.costPerIntroTaken,
      conversionRate: data.callsBooked > 0 ? (data.introsTaken / data.callsBooked) * 100 : 0,
    },
    {
      name: 'Contracts Sent',
      value: data.contractsSent,
      cost: data.costPerContractSent,
      conversionRate: data.introsTaken > 0 ? (data.contractsSent / data.introsTaken) * 100 : 0,
    },
    {
      name: 'Deals Won',
      value: data.dealsWon,
      cost: data.costPerDealWon,
      conversionRate: data.contractsSent > 0 ? (data.dealsWon / data.contractsSent) * 100 : 0,
    },
  ] : [];

  return (
    <div className="space-y-12">
      {/* Key Performance Indicators Section */}
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between"
        >
          <div>
            <h2 className="text-2xl font-bold text-white">Key Performance Indicators</h2>
            <p className="text-sm text-slate-400 mt-1">Track your marketing funnel efficiency</p>
          </div>
          {data && (
            <div className="flex items-center gap-4">
              <div className="px-4 py-2 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-slate-300">
                    Overall Conversion: {((data.dealsWon / data.totalApplications) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Primary Metrics Row */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <MetricCard
            title="Ad Spend"
            value={data ? formatCurrency(data.adSpend) : '---'}
            subtitle={data ? `${dateRange.label}` : 'Selected Period'}
            iconName="dollar"
            color="purple"
            isLoading={isLoading}
          />
          <MetricCard
            title="Applications"
            value={data ? formatNumber(data.totalApplications) : '---'}
            subtitle="Total Leads"
            iconName="users"
            color="blue"
            isLoading={isLoading}
          />
          <MetricCard
            title="Cost per Application"
            value={data ? formatCurrency(data.costPerApplication) : '---'}
            subtitle="Acquisition Cost"
            iconName="dollar"
            color="blue"
            isLoading={isLoading}
          />
          <MetricCard
            title="Total MQLs"
            value={data ? formatNumber(data.totalMQLs) : '---'}
            subtitle="Marketing Qualified Leads"
            iconName="heart"
            color="green"
            isLoading={isLoading}
          />
        </motion.div>
      </div>

      {/* Call & Engagement Metrics */}
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="flex items-center justify-between"
        >
          <div>
            <h2 className="text-2xl font-bold text-white">Call & Engagement Metrics</h2>
            <p className="text-sm text-slate-400 mt-1">Monitor your sales team performance</p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <MetricCard
            title="Cost per MQL"
            value={data ? formatCurrency(data.costPerMQL) : '---'}
            subtitle="MQL Acquisition Cost"
            iconName="dollar"
            color="green"
            isLoading={isLoading}
          />
          <MetricCard
            title="Intro Calls Booked"
            value={data ? formatNumber(data.callsBooked) : '---'}
            subtitle="Scheduled Calls"
            iconName="phone"
            color="blue"
            isLoading={isLoading}
          />
          <MetricCard
            title="Cost per Call Booked"
            value={data ? formatCurrency(data.costPerCallBooked) : '---'}
            subtitle="Call Booking Cost"
            iconName="dollar"
            color="purple"
            isLoading={isLoading}
          />
          <MetricCard
            title="Intros Taken"
            value={data ? formatNumber(data.introsTaken) : '---'}
            subtitle="Completed Introductions"
            iconName="users"
            color="red"
            isLoading={isLoading}
          />
        </motion.div>
      </div>

      {/* Deal Closing Metrics */}
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="flex items-center justify-between"
        >
          <div>
            <h2 className="text-2xl font-bold text-white">Deal Closing Metrics</h2>
            <p className="text-sm text-slate-400 mt-1">Track your conversion to revenue</p>
          </div>
          {data && data.dealsWon > 0 && (
            <div className="px-4 py-2 bg-gradient-to-r from-emerald-600/20 to-green-600/20 backdrop-blur-sm rounded-xl border border-emerald-500/30">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span className="text-sm text-emerald-300 font-medium">
                  Est. Revenue: {formatCurrency(data.dealsWon * 5000)}
                </span>
              </div>
            </div>
          )}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <MetricCard
            title="Cost per Intro Taken"
            value={data ? formatCurrency(data.costPerIntroTaken) : '---'}
            subtitle="Introduction Cost"
            iconName="dollar"
            color="orange"
            isLoading={isLoading}
          />
          <MetricCard
            title="Contracts Sent"
            value={data ? formatNumber(data.contractsSent) : '---'}
            subtitle="Proposals Delivered"
            iconName="file"
            color="purple"
            isLoading={isLoading}
          />
          <MetricCard
            title="Cost per Contract Sent"
            value={data ? formatCurrency(data.costPerContractSent) : '---'}
            subtitle="Contract Cost"
            iconName="dollar"
            color="red"
            isLoading={isLoading}
          />
          <MetricCard
            title="Deals Won"
            value={data ? formatNumber(data.dealsWon) : '---'}
            subtitle={data ? formatCurrency(data.costPerDealWon) + ' cost per deal' : 'Cost per deal won'}
            iconName="award"
            color="green"
            isLoading={isLoading}
          />
        </motion.div>
      </div>

      {/* Funnel Visualization */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.8 }}
        className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-8 shadow-2xl"
      >
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Customer Journey Funnel</h2>
          <p className="text-slate-400">Track conversion rates through each stage of your sales process</p>
        </div>
        <FunnelChart stages={funnelStages} isLoading={isLoading} />
      </motion.div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <LiveDataProvider>
      <div className="relative min-h-screen overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjOTAzN0ZGIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] bg-center"></div>
        </div>
        
        {/* Floating Orbs */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse pointer-events-none"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000 pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-green-500/10 rounded-full blur-3xl animate-pulse delay-2000 pointer-events-none"></div>
        
        {/* Content */}
        <div className="relative z-10 container mx-auto px-6 py-12 max-w-7xl">
          <DashboardHeader />
          <DashboardContent />
        </div>
      </div>
    </LiveDataProvider>
  );
}