'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Dashboard error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="max-w-md w-full bg-slate-900/50 backdrop-blur-sm border-slate-800 p-8">
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-10 w-10 text-red-500" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">Something went wrong!</h2>
              <p className="text-slate-400">
                An error occurred while loading the dashboard. Please try again.
              </p>
              {error.message && (
                <p className="text-sm text-slate-500 mt-2">
                  Error: {error.message}
                </p>
              )}
            </div>
            
            <div className="flex gap-3 w-full">
              <Button
                onClick={reset}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              
              <Button
                onClick={() => window.location.href = '/'}
                variant="outline"
                className="flex-1 border-slate-700 hover:bg-slate-800 text-slate-300"
              >
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}