'use client';

import { useUser } from '@stack-auth/nextjs';
import { redirect } from 'next/navigation';
import { LayoutDashboard, Settings, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) {
    redirect('/auth/login');
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-card transition-transform duration-300 md:static md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="border-b border-border px-6 py-4">
            <h1 className="text-xl font-bold text-foreground">TaskFlow</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-foreground/70 hover:bg-muted hover:text-foreground"
            >
              <LayoutDashboard className="h-5 w-5" />
              Dashboard
            </Link>
            <Link
              href="/dashboard/projects"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-foreground/70 hover:bg-muted hover:text-foreground"
            >
              <LayoutDashboard className="h-5 w-5" />
              Projects
            </Link>
          </nav>

          {/* User Section */}
          <div className="border-t border-border px-3 py-4">
            <div className="mb-3 flex items-center gap-3 rounded-lg px-3 py-2">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary">
                {user.displayName?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{user.displayName || 'User'}</p>
                <p className="truncate text-xs text-muted-foreground">{user.primaryEmail}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="flex-1 h-9">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="flex-1 h-9">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Close button for mobile */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute right-4 top-4 md:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top navigation */}
        <header className="border-b border-border bg-card px-4 py-3 md:px-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden"
            >
              <Menu className="h-5 w-5 text-foreground" />
            </button>
            <div></div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
