'use client';

import { motion } from 'framer-motion';
import { ArrowRight, BarChart3, TrendingUp, Activity, DollarSign, Users, Clock, Calendar } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function LandingPage() {
  const [greeting, setGreeting] = useState('Welcome Back');
  const [currentDate, setCurrentDate] = useState('');
  
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
    
    // Format current date
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    setCurrentDate(new Date().toLocaleDateString('en-US', options));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjOTAzN0ZGIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] bg-center"></div>
      </div>
      
      {/* Floating Orbs */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="container mx-auto px-6 py-8"
        >
          <div className="flex justify-between items-center">
            <img 
              src="/logo.png" 
              alt="Funding Accelerator" 
              className="h-14 w-auto"
            />
            <div className="text-sm text-gray-400">
              <Clock className="inline-block w-4 h-4 mr-2" />
              {currentDate}
            </div>
          </div>
        </motion.header>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h1 className="text-4xl lg:text-6xl font-bold mb-4">
                  <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                    {greeting}
                  </span>
                </h1>
                <p className="text-2xl text-gray-300 mb-2">
                  to your Funding Accelerator Dashboard
                </p>
                <p className="text-lg text-gray-400">
                  Track your marketing performance and customer journey in real-time
                </p>
              </motion.div>

              {/* Login CTA */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="mt-10"
              >
                <Link
                  href="/login"
                  className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold text-lg rounded-xl shadow-2xl hover:shadow-purple-500/25 transform hover:scale-105 transition-all duration-300"
                >
                  Access Your Dashboard
                  <ArrowRight className="h-6 w-6" />
                </Link>
              </motion.div>
            </div>

            {/* Quick Stats Preview */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16"
            >
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-600/20 rounded-xl mb-4">
                  <BarChart3 className="h-6 w-6 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Real-Time Analytics</h3>
                <p className="text-gray-400 text-sm">Monitor your campaigns with live data updates</p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600/20 rounded-xl mb-4">
                  <TrendingUp className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Conversion Tracking</h3>
                <p className="text-gray-400 text-sm">Follow your leads through every stage</p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-600/20 rounded-xl mb-4">
                  <DollarSign className="h-6 w-6 text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">ROI Insights</h3>
                <p className="text-gray-400 text-sm">Understand your cost per acquisition</p>
              </div>
            </motion.div>

            {/* Support Info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="text-center mt-16 text-gray-400"
            >
              <p className="text-sm">
                Need assistance? Contact your account manager or{' '}
                <a href="mailto:support@fundingaccelerator.com" className="text-purple-400 hover:text-purple-300 transition-colors">
                  support@fundingaccelerator.com
                </a>
              </p>
            </motion.div>
          </div>
        </div>

        {/* Footer */}
        <footer className="container mx-auto px-6 py-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">
              © 2025 Funding Accelerator. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-gray-400">
              <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
              <Link href="#" className="hover:text-white transition-colors">Support</Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}