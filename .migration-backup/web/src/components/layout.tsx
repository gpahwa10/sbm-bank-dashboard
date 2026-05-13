import React from 'react';
import { Link, useLocation } from 'wouter';
import { useAuthStore } from '@/lib/auth';
import { useListNotifications, useLogout, getListNotificationsQueryKey } from "@workspace/api-client-react";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Calendar,
  FileText,
  UserPlus,
  BarChart,
  Settings,
  ShieldCheck,
  Bell,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, logout: clearAuth } = useAuthStore();
  const [location, setLocation] = useLocation();
  const logoutMutation = useLogout();
  
  const { data: notifications } = useListNotifications(undefined, {
    query: {
      queryKey: getListNotificationsQueryKey(undefined),
      enabled: !!user,
    },
  });
  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (e) {
      // Ignore
    } finally {
      clearAuth();
      setLocation('/');
    }
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Requisitions', path: '/requisitions', icon: FileText },
    { label: 'Jobs', path: '/jobs', icon: Briefcase },
    { label: 'Candidates', path: '/candidates', icon: Users },
    { label: 'Applications', path: '/applications', icon: FileText },
    { label: 'Interviews', path: '/interviews', icon: Calendar },
    { label: 'Offers', path: '/offers', icon: FileText },
    { label: 'Onboarding', path: '/onboarding', icon: UserPlus },
    { label: 'Reports', path: '/reports', icon: BarChart },
    { label: 'Compliance', path: '/dashboard/compliance', icon: ShieldCheck },
    { label: 'Admin', path: '/admin', icon: Settings },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col">
        <div className="h-14 flex items-center px-4 font-bold text-lg tracking-tight border-b border-sidebar-border">
          TalentFlow
        </div>
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location === item.path || location.startsWith(`${item.path}/`);
            return (
              <Link key={item.path} href={item.path}>
                <div className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-sm cursor-pointer transition-colors ${isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'}`}>
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </div>
        <div className="p-4 border-t border-sidebar-border text-xs text-sidebar-foreground/60">
          <div>Logged in as</div>
          <div className="font-semibold text-sidebar-foreground truncate">{user?.name}</div>
          <div className="truncate capitalize">{user?.role.replace('_', ' ')}</div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-14 bg-card border-b border-border flex items-center justify-between px-6 shrink-0 z-10">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            {/* Simple breadcrumbs simulation */}
            <span className="capitalize">{location.split('/')[1] || 'Dashboard'}</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/notifications">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-4 w-4 text-foreground/80" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center bg-destructive text-destructive-foreground text-[10px]">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </Link>
            <div className="h-6 w-px bg-border mx-1" />
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-foreground">
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </Button>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="mx-auto max-w-6xl">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
