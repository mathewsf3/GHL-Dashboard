export interface DashboardMetrics {
  adSpend: number;
  totalApplications: number;
  costPerApplication: number;
  totalMQLs: number;
  costPerMQL: number;
  callsBooked: number;
  costPerCallBooked: number;
  introsTaken: number;
  costPerIntroTaken: number;
  contractsSent: number;
  costPerContractSent: number;
  dealsWon: number;
  costPerDealWon: number;
  lastUpdated: string;
}

export interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: number;
  icon?: React.ComponentType<{ className?: string }>;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
}

export interface FunnelStage {
  name: string;
  value: number;
  cost: number;
  conversionRate?: number;
}

export interface ApiResponse<T> {
  data: T;
  error?: string;
  lastUpdated: string;
}