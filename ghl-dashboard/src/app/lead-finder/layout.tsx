import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function LeadFinderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}