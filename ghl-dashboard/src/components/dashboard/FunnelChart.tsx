'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { FunnelStage } from "@/types/dashboard";
import { formatNumber, formatCurrency, formatPercentage } from "@/lib/utils";
import { TrendingDown, Users, DollarSign, ChevronDown } from "lucide-react";

interface FunnelChartProps {
  stages: FunnelStage[];
  isLoading?: boolean;
}

export function FunnelChart({ stages, isLoading }: FunnelChartProps) {
  // Calculate width percentages using a logarithmic scale for better visibility
  const getBarWidth = (value: number, maxValue: number): number => {
    if (value === 0 || maxValue === 0) return 0;
    // Minimum width of 25% to ensure visibility, max of 100%
    const logValue = Math.log(value + 1);
    const logMax = Math.log(maxValue + 1);
    const percentage = (logValue / logMax) * 75 + 25;
    return Math.min(percentage, 100);
  };

  const maxValue = Math.max(...stages.map(stage => stage.value));

  const stageColors = [
    { gradient: 'from-purple-600 to-pink-600', glow: 'purple', icon: 'bg-purple-500/20 border-purple-400/50', shadow: 'shadow-purple-500/30' },
    { gradient: 'from-blue-600 to-cyan-600', glow: 'blue', icon: 'bg-blue-500/20 border-blue-400/50', shadow: 'shadow-blue-500/30' },
    { gradient: 'from-emerald-600 to-teal-600', glow: 'emerald', icon: 'bg-emerald-500/20 border-emerald-400/50', shadow: 'shadow-emerald-500/30' },
    { gradient: 'from-amber-600 to-orange-600', glow: 'amber', icon: 'bg-amber-500/20 border-amber-400/50', shadow: 'shadow-amber-500/30' },
    { gradient: 'from-rose-600 to-pink-600', glow: 'rose', icon: 'bg-rose-500/20 border-rose-400/50', shadow: 'shadow-rose-500/30' },
    { gradient: 'from-violet-600 to-purple-600', glow: 'violet', icon: 'bg-violet-500/20 border-violet-400/50', shadow: 'shadow-violet-500/30' },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-14 h-14 bg-slate-700 rounded-2xl"></div>
              <div className="flex-1">
                <div className="h-5 bg-slate-700 rounded w-36 mb-2"></div>
                <div className="h-4 bg-slate-700 rounded w-28"></div>
              </div>
            </div>
            <div className="h-20 bg-slate-700 rounded-2xl"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {stages.map((stage, index) => {
        const widthPercentage = getBarWidth(stage.value, maxValue);
        const conversionRate = stage.conversionRate || 0;
        const colors = stageColors[index] || stageColors[0];
        const nextStage = stages[index + 1];
        
        return (
          <motion.div
            key={stage.name}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="relative"
          >
            {/* Stage Card */}
            <div className="relative group">
              {/* Glow effect on hover */}
              <div className={`absolute inset-0 bg-gradient-to-r ${colors.gradient} opacity-0 group-hover:opacity-10 rounded-2xl blur-xl transition-opacity duration-500`}></div>
              
              <div className="relative bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 hover:border-slate-600/50 transition-all duration-300">
                {/* Stage Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <motion.div 
                      className={`
                        w-14 h-14 rounded-2xl flex items-center justify-center backdrop-blur-sm border-2
                        ${colors.icon} text-white font-bold text-xl ${colors.shadow} shadow-lg
                      `}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      {index + 1}
                    </motion.div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">{stage.name}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-slate-400 text-sm">
                          <Users className="w-4 h-4" />
                          {formatNumber(stage.value)} contacts
                        </span>
                        <span className="flex items-center gap-1 text-slate-400 text-sm">
                          <DollarSign className="w-4 h-4" />
                          {formatCurrency(stage.cost)} per contact
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Funnel Bar */}
                <div className="relative h-20 bg-slate-900/50 rounded-xl overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${widthPercentage}%` }}
                    transition={{ 
                      delay: index * 0.1 + 0.3, 
                      duration: 1, 
                      ease: [0.25, 0.46, 0.45, 0.94] 
                    }}
                    className={`
                      h-full bg-gradient-to-r ${colors.gradient} relative overflow-hidden
                      ${colors.shadow} shadow-2xl
                    `}
                  >
                    {/* Animated shimmer effect */}
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                      initial={{ x: '-100%' }}
                      animate={{ x: '200%' }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 3, 
                        delay: index * 0.2,
                        ease: "linear"
                      }}
                    />
                    
                    {/* Value display inside bar */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.1 + 0.8, type: "spring" }}
                        className="bg-black/20 backdrop-blur-sm rounded-lg px-4 py-2"
                      >
                        <span className="text-white font-bold text-2xl drop-shadow-lg">
                          {formatNumber(stage.value)}
                        </span>
                      </motion.div>
                    </div>
                  </motion.div>
                  
                  {/* Background pattern */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="h-full w-full bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,0.05)_10px,rgba(255,255,255,0.05)_20px)]"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Connector with Conversion Rate */}
            {index < stages.length - 1 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 + 0.5 }}
                className="relative flex justify-center -my-2 z-10"
              >
                <div className="flex flex-col items-center">
                  {/* Arrow */}
                  <div className="bg-slate-800/50 backdrop-blur-sm rounded-full p-2 border border-slate-700/50">
                    <ChevronDown className="w-6 h-6 text-slate-400" />
                  </div>
                  
                  {/* Conversion Rate Badge */}
                  {nextStage && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 + 0.7 }}
                      className={`
                        mt-2 px-4 py-2 rounded-full backdrop-blur-sm border text-sm font-bold
                        ${(nextStage.conversionRate || 0) >= 50 ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300' : 
                          (nextStage.conversionRate || 0) >= 20 ? 'bg-amber-500/20 border-amber-400/50 text-amber-300' :
                          (nextStage.conversionRate || 0) >= 10 ? 'bg-orange-500/20 border-orange-400/50 text-orange-300' :
                          'bg-red-500/20 border-red-400/50 text-red-300'}
                      `}
                    >
                      <div className="flex items-center gap-2">
                        <TrendingDown className="w-4 h-4" />
                        <span>{formatPercentage(nextStage.conversionRate || 0)} conversion</span>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}