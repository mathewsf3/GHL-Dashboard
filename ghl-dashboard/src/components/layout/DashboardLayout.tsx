'use client';

import { ReactNode, useState, createContext, useContext } from 'react';
import { Sidebar } from './Sidebar';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: ReactNode;
}

interface SidebarContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType>({
  isOpen: true,
  setIsOpen: () => {},
});

export const useSidebar = () => useContext(SidebarContext);

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <SidebarContext.Provider value={{ isOpen, setIsOpen }}>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main 
          className={cn(
            "flex-1 overflow-y-auto bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900",
            "transition-all duration-200 ease-out",
            isOpen ? "md:ml-72" : "md:ml-0"
          )}
        >
          {children}
        </main>
      </div>
    </SidebarContext.Provider>
  );
}