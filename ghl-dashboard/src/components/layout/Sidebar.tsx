'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  BarChart3, 
  Menu, 
  X, 
  TrendingUp,
  Sparkles,
  ChevronRight,
  Settings,
  HelpCircle,
  Search
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useSidebar } from './DashboardLayout';

const navigation = [
  {
    name: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
    description: 'Overview & metrics'
  },
  {
    name: 'Creative Analysis',
    href: '/creative-analysis',
    icon: BarChart3,
    description: 'Ad performance insights'
  },
  {
    name: 'Lead Finder',
    href: '/lead-finder',
    icon: Search,
    description: 'Search & view leads'
  }
];

const bottomNavigation = [
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    description: 'Configuration'
  },
  {
    name: 'Help',
    href: '/help',
    icon: HelpCircle,
    description: 'Support & docs'
  }
];

export function Sidebar() {
  const { isOpen, setIsOpen } = useSidebar();
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden bg-slate-800/50 backdrop-blur-sm border border-slate-700/50"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar Content */}
      <motion.aside
        initial={false}
        animate={{ x: isOpen ? 0 : -280 }}
        transition={{ type: "tween", duration: 0.2, ease: "easeOut" }}
        className={cn(
          "fixed top-0 left-0 z-40 h-screen w-72",
          "bg-slate-900 border-r border-slate-800/50",
          "flex flex-col"
        )}
      >
              {/* Logo Section */}
              <div className="p-6 border-b border-slate-800/50">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">GHL Dashboard</h2>
                    <p className="text-xs text-slate-400">Analytics Platform</p>
                  </div>
                </motion.div>
              </div>

              {/* Main Navigation */}
              <nav className="flex-1 p-4 space-y-2">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="block"
                    >
                      <motion.div
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        className={cn(
                          "relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300",
                          "hover:bg-slate-800/50",
                          isActive && "bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30"
                        )}
                      >
                        {/* Active Indicator */}
                        {isActive && (
                          <motion.div
                            layoutId="activeNav"
                            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-purple-500 to-blue-500 rounded-r-full"
                          />
                        )}

                        {/* Icon */}
                        <div className={cn(
                          "p-2 rounded-lg",
                          isActive 
                            ? "bg-gradient-to-br from-purple-600 to-blue-600 text-white shadow-lg" 
                            : "bg-slate-800/50 text-slate-400"
                        )}>
                          <item.icon className="h-5 w-5" />
                        </div>

                        {/* Text */}
                        <div className="flex-1">
                          <p className={cn(
                            "font-medium text-sm",
                            isActive ? "text-white" : "text-slate-300"
                          )}>
                            {item.name}
                          </p>
                          <p className="text-xs text-slate-500">{item.description}</p>
                        </div>

                        {/* Arrow */}
                        <ChevronRight className={cn(
                          "h-4 w-4 transition-all duration-300",
                          isActive ? "text-purple-400 translate-x-1" : "text-slate-600"
                        )} />
                      </motion.div>
                    </Link>
                  );
                })}

                {/* Coming Soon Section */}
                <div className="mt-8 mb-4">
                  <p className="text-xs text-slate-500 uppercase tracking-wider px-4">Coming Soon</p>
                </div>
                
                <div className="space-y-2 opacity-50">
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-800/30 cursor-not-allowed">
                    <div className="p-2 rounded-lg bg-slate-800/50 text-slate-600">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm text-slate-500">AI Insights</p>
                      <p className="text-xs text-slate-600">Smart recommendations</p>
                    </div>
                    <span className="text-xs bg-slate-800/50 px-2 py-1 rounded text-slate-500">Soon</span>
                  </div>
                </div>
              </nav>

              {/* Bottom Navigation */}
              <div className="p-4 border-t border-slate-800/50 space-y-2">
                {bottomNavigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="block"
                  >
                    <motion.div
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-slate-800/50 transition-all duration-300"
                    >
                      <item.icon className="h-4 w-4 text-slate-400" />
                      <span className="text-sm text-slate-400">{item.name}</span>
                    </motion.div>
                  </Link>
                ))}
              </div>

              {/* User Section */}
              <div className="p-4 border-t border-slate-800/50">
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-800/30">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                    <span className="text-sm font-bold text-white">U</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">User</p>
                    <p className="text-xs text-slate-400">Administrator</p>
                  </div>
                </div>
              </div>
      </motion.aside>

      {/* Desktop Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "fixed top-4 z-30 hidden md:flex",
          "bg-slate-800/50 backdrop-blur-sm border border-slate-700/50",
          "hover:bg-slate-800/70 transition-all duration-300",
          isOpen ? "left-[17rem]" : "left-4"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {isOpen ? <ChevronRight className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </motion.div>
      </Button>
    </>
  );
}