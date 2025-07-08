import { RefreshCw } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <RefreshCw className="h-12 w-12 text-blue-500 animate-spin mx-auto mb-4" />
        <p className="text-lg text-slate-300">Loading dashboard...</p>
      </div>
    </div>
  );
}