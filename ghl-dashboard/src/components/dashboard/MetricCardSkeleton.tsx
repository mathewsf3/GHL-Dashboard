import { cn } from '@/lib/utils';

export function MetricCardSkeleton() {
  return (
    <div className="relative bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-slate-700/50 overflow-hidden">
      {/* Shimmer effect */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite]">
        <div className="h-full w-1/2 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      </div>
      
      <div className="relative space-y-4">
        {/* Icon and title */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-slate-700/50 rounded-lg animate-pulse" />
            <div className="h-5 w-24 bg-slate-700/50 rounded animate-pulse" />
          </div>
        </div>
        
        {/* Value */}
        <div className="h-8 w-32 bg-slate-700/50 rounded animate-pulse" />
        
        {/* Subtitle */}
        <div className="h-4 w-20 bg-slate-700/50 rounded animate-pulse" />
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-12">
      {/* KPI Section */}
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-slate-700/50 rounded animate-pulse" />
          <div className="h-4 w-48 bg-slate-700/50 rounded animate-pulse" />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <MetricCardSkeleton key={i} />
          ))}
        </div>
      </div>
      
      {/* Call Metrics Section */}
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-8 w-56 bg-slate-700/50 rounded animate-pulse" />
          <div className="h-4 w-40 bg-slate-700/50 rounded animate-pulse" />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <MetricCardSkeleton key={i} />
          ))}
        </div>
      </div>
      
      {/* Funnel Chart */}
      <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-slate-700/50">
        <div className="space-y-4">
          <div className="h-8 w-48 bg-slate-700/50 rounded animate-pulse" />
          <div className="h-4 w-64 bg-slate-700/50 rounded animate-pulse" />
          <div className="h-[400px] bg-slate-700/20 rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  );
}