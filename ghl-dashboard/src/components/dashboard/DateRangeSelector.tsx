'use client';

import { useState, useMemo } from 'react';
import { Calendar, ChevronDown, CalendarDays } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { DateRange, getDateRangePresets } from '@/types/dateRange';
import { cn } from '@/lib/utils';

interface DateRangeSelectorProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  disabled?: boolean;
}

export function DateRangeSelector({ value, onChange, disabled }: DateRangeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const dateRangePresets = useMemo(() => getDateRangePresets(), []);

  const handlePresetSelect = (preset: DateRange) => {
    onChange(preset);
    setIsOpen(false);
    setShowCustom(false);
  };

  const handleCustomDateSubmit = () => {
    if (customStart && customEnd) {
      const startDate = new Date(customStart);
      const endDate = new Date(customEnd);
      
      // Set end date to end of day
      endDate.setHours(23, 59, 59, 999);
      
      const customRange: DateRange = {
        startDate,
        endDate,
        label: `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
        preset: 'custom'
      };
      
      onChange(customRange);
      setIsOpen(false);
      setShowCustom(false);
    }
  };

  // Format date for input value (YYYY-MM-DD)
  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="relative">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "flex items-center gap-2 px-4 py-2",
          "bg-slate-800/50 backdrop-blur-sm",
          "border border-slate-700/50",
          "text-slate-300 hover:text-white",
          "hover:bg-slate-800/70 hover:border-slate-600/50",
          "transition-all duration-300",
          "rounded-xl shadow-lg"
        )}
      >
        <Calendar className="h-4 w-4" />
        <span className="font-medium">{value.label}</span>
        <ChevronDown className={cn(
          "h-4 w-4 transition-transform duration-200",
          isOpen && "rotate-180"
        )} />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className={cn(
                "absolute right-0 mt-2 z-50",
                showCustom ? "w-[300px]" : "min-w-[200px]",
                "p-2",
                "bg-slate-800/90 backdrop-blur-xl",
                "border border-slate-700/50",
                "rounded-xl shadow-2xl",
                "ring-1 ring-black/5"
              )}
            >
              {!showCustom ? (
                <div className="space-y-1">
                  {dateRangePresets.map((preset) => (
                    <button
                      key={preset.preset}
                      onClick={() => handlePresetSelect(preset)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg",
                        "text-sm font-medium",
                        "transition-all duration-200",
                        "hover:bg-slate-700/50",
                        value.preset === preset.preset
                          ? "bg-gradient-to-r from-purple-600/20 to-blue-600/20 text-white"
                          : "text-slate-300 hover:text-white"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span>{preset.label}</span>
                        {value.preset === preset.preset && (
                          <motion.div
                            layoutId="activeIndicator"
                            className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-400 to-blue-400"
                          />
                        )}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {preset.startDate.toLocaleDateString()} - {preset.endDate.toLocaleDateString()}
                      </div>
                    </button>
                  ))}

                  {/* Custom Date Range */}
                  <div className="pt-2 mt-2 border-t border-slate-700/50">
                    <button
                      onClick={() => setShowCustom(true)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg",
                        "text-sm font-medium",
                        "transition-all duration-200",
                        "hover:bg-slate-700/50",
                        "text-slate-300 hover:text-white",
                        value.preset === 'custom' && "bg-gradient-to-r from-purple-600/20 to-blue-600/20 text-white"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4" />
                          <span>Custom Range</span>
                        </div>
                        {value.preset === 'custom' && (
                          <motion.div
                            layoutId="activeIndicator"
                            className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-400 to-blue-400"
                          />
                        )}
                      </div>
                    </button>
                  </div>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-700/50">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                      <CalendarDays className="h-4 w-4" />
                      Custom Date Range
                    </h3>
                    <button
                      onClick={() => setShowCustom(false)}
                      className="text-xs text-slate-400 hover:text-white transition-colors"
                    >
                      ← Back
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Start Date</label>
                      <input
                        type="date"
                        value={customStart}
                        onChange={(e) => setCustomStart(e.target.value)}
                        max={formatDateForInput(new Date())}
                        className={cn(
                          "w-full px-3 py-2 rounded-lg",
                          "bg-slate-700/50 border border-slate-600/50",
                          "text-white text-sm",
                          "focus:outline-none focus:border-purple-500/50",
                          "transition-colors"
                        )}
                      />
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 block mb-1">End Date</label>
                      <input
                        type="date"
                        value={customEnd}
                        onChange={(e) => setCustomEnd(e.target.value)}
                        min={customStart}
                        max={formatDateForInput(new Date())}
                        className={cn(
                          "w-full px-3 py-2 rounded-lg",
                          "bg-slate-700/50 border border-slate-600/50",
                          "text-white text-sm",
                          "focus:outline-none focus:border-purple-500/50",
                          "transition-colors"
                        )}
                      />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => {
                          setShowCustom(false);
                          setCustomStart('');
                          setCustomEnd('');
                        }}
                        className={cn(
                          "flex-1 px-3 py-2 rounded-lg",
                          "bg-slate-700/30 text-slate-300",
                          "hover:bg-slate-700/50 hover:text-white",
                          "text-sm font-medium",
                          "transition-all duration-200"
                        )}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleCustomDateSubmit}
                        disabled={!customStart || !customEnd}
                        className={cn(
                          "flex-1 px-3 py-2 rounded-lg",
                          "bg-gradient-to-r from-purple-600 to-blue-600",
                          "text-white text-sm font-medium",
                          "hover:from-purple-700 hover:to-blue-700",
                          "transition-all duration-200",
                          "disabled:opacity-50 disabled:cursor-not-allowed"
                        )}
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}