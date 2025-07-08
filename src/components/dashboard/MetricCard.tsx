'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MetricCardProps } from "@/types/dashboard";
import { formatCurrency, formatNumber, cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, DollarSign, Users, Phone, FileText, HandHeart, Award } from "lucide-react";

const iconMap = {
  dollar: DollarSign,
  users: Users,
  phone: Phone,
  file: FileText,
  heart: HandHeart,
  award: Award,
};

const colorVariants = {
  blue: "from-blue-500/20 to-cyan-500/20 border-blue-500/30 shadow-blue-500/20",
  green: "from-green-500/20 to-emerald-500/20 border-green-500/30 shadow-green-500/20",
  purple: "from-purple-500/20 to-pink-500/20 border-purple-500/30 shadow-purple-500/20",
  orange: "from-orange-500/20 to-yellow-500/20 border-orange-500/30 shadow-orange-500/20",
  red: "from-red-500/20 to-rose-500/20 border-red-500/30 shadow-red-500/20",
};

interface ExtendedMetricCardProps extends MetricCardProps {
  iconName?: keyof typeof iconMap;
  isLoading?: boolean;
  className?: string;
}

export function MetricCard({ 
  title, 
  value, 
  subtitle, 
  trend, 
  color = 'blue', 
  iconName = 'dollar',
  isLoading = false,
  className 
}: ExtendedMetricCardProps) {
  const Icon = iconMap[iconName];
  const isPositiveTrend = trend && trend > 0;
  const TrendIcon = isPositiveTrend ? TrendingUp : TrendingDown;

  if (isLoading) {
    return (
      <Card className={cn(
        "relative overflow-hidden backdrop-blur-lg bg-gradient-to-br border",
        colorVariants[color],
        className
      )}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="h-4 bg-gray-300 rounded animate-pulse w-20"></div>
            <div className="h-6 w-6 bg-gray-300 rounded animate-pulse"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="h-8 bg-gray-300 rounded animate-pulse w-32"></div>
            <div className="h-4 bg-gray-300 rounded animate-pulse w-24"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      whileHover={{ 
        scale: 1.05, 
        y: -5,
        transition: { duration: 0.2 }
      }}
      className={className}
    >
      <Card className={cn(
        "relative overflow-hidden backdrop-blur-xl bg-slate-800/40 border border-slate-700/50 transition-all duration-300 hover:shadow-2xl hover:border-slate-600/50",
        "before:absolute before:inset-0 before:bg-gradient-to-br before:opacity-40",
        colorVariants[color]
      )}>
        {/* Dynamic background pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] via-transparent to-white/[0.03]"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/[0.05] to-transparent rounded-bl-full"></div>
        
        <CardHeader className="pb-3 relative z-10">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-slate-300 tracking-wide">
              {title}
            </CardTitle>
            <motion.div 
              className={cn(
                "p-2.5 rounded-xl backdrop-blur-sm border",
                color === 'blue' && "bg-blue-500/20 border-blue-400/30",
                color === 'green' && "bg-green-500/20 border-green-400/30",
                color === 'purple' && "bg-purple-500/20 border-purple-400/30",
                color === 'orange' && "bg-orange-500/20 border-orange-400/30",
                color === 'red' && "bg-red-500/20 border-red-400/30",
              )}
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.2 }}
            >
              <Icon className="h-5 w-5 text-white drop-shadow-sm" />
            </motion.div>
          </div>
        </CardHeader>
        
        <CardContent className="relative z-10 pb-6">
          <div className="space-y-3">
            <motion.div 
              className="text-3xl font-bold text-white drop-shadow-sm"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              {value}
            </motion.div>
            
            <div className="flex items-center justify-between">
              {subtitle && (
                <p className="text-sm text-slate-400 font-medium">
                  {subtitle}
                </p>
              )}
              
              {trend !== undefined && (
                <Badge 
                  variant="secondary" 
                  className={cn(
                    "text-xs flex items-center gap-1 px-2 py-1 rounded-lg backdrop-blur-sm",
                    isPositiveTrend 
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/30" 
                      : "bg-red-500/20 text-red-300 border-red-400/30"
                  )}
                >
                  <TrendIcon className="h-3 w-3" />
                  {Math.abs(trend)}%
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}