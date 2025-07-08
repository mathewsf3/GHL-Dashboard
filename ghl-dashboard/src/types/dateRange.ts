export interface DateRange {
  startDate: Date;
  endDate: Date;
  label: string;
  preset?: 'last7d' | 'last30d' | 'last90d' | 'thisMonth' | 'lastMonth' | 'custom';
}

export function getDateRangePresets(): DateRange[] {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  
  return [
    {
      label: 'Last 7 Days',
      preset: 'last7d',
      startDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      endDate: new Date(now)
    },
    {
      label: 'Last 30 Days',
      preset: 'last30d',
      startDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      endDate: new Date(now)
    },
    {
      label: 'Last 90 Days',
      preset: 'last90d',
      startDate: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
      endDate: new Date(now)
    },
    {
      label: 'This Month',
      preset: 'thisMonth',
      startDate: (() => {
        const start = new Date(currentYear, currentMonth, 1);
        start.setHours(0, 0, 0, 0);
        return start;
      })(),
      endDate: (() => {
        const end = new Date(currentYear, currentMonth, now.getDate());
        end.setHours(23, 59, 59, 999);
        return end;
      })()
    },
    {
      label: 'Last Month',
      preset: 'lastMonth',
      startDate: new Date(currentYear, currentMonth - 1, 1),
      endDate: new Date(currentYear, currentMonth, 0)
    }
  ];
}

// For backwards compatibility
export const DATE_RANGE_PRESETS = getDateRangePresets();

export function formatDateForAPI(date: Date): string {
  return date.toISOString().split('T')[0]; // YYYY-MM-DD format
}

export function getDateRangeForMeta(range: DateRange) {
  return {
    since: formatDateForAPI(range.startDate),
    until: formatDateForAPI(range.endDate)
  };
}