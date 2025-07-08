'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import useSWR from 'swr';
import { DashboardMetrics, ApiResponse } from '@/types/dashboard';
import { DateRange, getDateRangePresets } from '@/types/dateRange';

interface LiveDataContextType {
  data: DashboardMetrics | null;
  error: string | null;
  isLoading: boolean;
  mutate: () => void;
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
}

const LiveDataContext = createContext<LiveDataContextType | null>(null);

const fetcher = async (url: string): Promise<DashboardMetrics> => {
  const response = await fetch(url);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP ${response.status}`);
  }
  const result: ApiResponse<DashboardMetrics> = await response.json();
  return result.data;
};

interface LiveDataProviderProps {
  children: ReactNode;
}

export function LiveDataProvider({ children }: LiveDataProviderProps) {
  const [dateRange, setDateRange] = useState<DateRange>(() => getDateRangePresets()[3]); // Default to This Month
  
  // Build URL with date parameters
  // For presets, use the preset parameter for better server-side handling
  // For custom ranges, use explicit start/end dates
  const apiUrl = dateRange.preset && dateRange.preset !== 'custom'
    ? `/api/dashboard?dateRange=${dateRange.preset}`
    : `/api/dashboard?startDate=${dateRange.startDate.toISOString()}&endDate=${dateRange.endDate.toISOString()}`;
  
  const { 
    data, 
    error, 
    isLoading, 
    mutate 
  } = useSWR<DashboardMetrics, Error>(
    apiUrl, 
    fetcher,
    {
      refreshInterval: 5 * 60 * 1000, // 5 minutes
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 2 * 60 * 1000, // 2 minutes
      errorRetryCount: 3,
      errorRetryInterval: 5000,
      onError: (error) => {
        console.error('Dashboard data fetch error:', error);
      }
    }
  );

  const contextValue: LiveDataContextType = {
    data: data || null,
    error: error?.message || null,
    isLoading,
    mutate,
    dateRange,
    setDateRange
  };

  return (
    <LiveDataContext.Provider value={contextValue}>
      {children}
    </LiveDataContext.Provider>
  );
}

export function useLiveData(): LiveDataContextType {
  const context = useContext(LiveDataContext);
  if (!context) {
    throw new Error('useLiveData must be used within a LiveDataProvider');
  }
  return context;
}