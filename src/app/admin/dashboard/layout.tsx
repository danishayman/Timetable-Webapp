'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Users, 
  BookOpen, 
  Calendar, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Home,
  ChevronRight
} from 'lucide-react';

interface AdminDashboardLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const navigation: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/admin/dashboard',
    icon: Home,
    description: 'Overview and statistics'
  },
  {
    name: 'Subjects',
    href: '/admin/dashboard/subjects',
    icon: BookOpen,
    description: 'Manage subjects and courses'
  },
  {
    name: 'Schedules',
    href: '/admin/dashboard/schedules',
    icon: Calendar,
    description: 'Manage class schedules and timeslots'
  },
  {
    name: 'Settings',
    href: '/admin/dashboard/settings',
    icon: Settings,
    description: 'System configuration'
  }
];

export default function AdminDashboardLayout({ children }: AdminDashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Close sidebar when route changes (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Handle logout
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      // TODO: Implement actual logout logic with admin auth store
      console.log('Logging out admin...');
      
      // Simulate logout delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Redirect to login page
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Get current page title and breadcrumb
  const getCurrentPageInfo = () => {
    const currentNav = navigation.find(item => 
      pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href))
    );
    
    if (currentNav) {
      return {
        title: currentNav.name,
        description: currentNav.description
      };
    }
    
    return {
      title: 'Admin Dashboard',
      description: 'Manage your timetable system'
    };
  };

  const currentPageInfo = getCurrentPageInfo();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Sidebar header */}
          <div className="flex items-center justify-between h-16 px-6 bg-blue-600 text-white">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 mr-2" />
              <span className="text-lg font-semibold">Admin Panel</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-md hover:bg-blue-700 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href));
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors group
                    ${isActive 
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className={`
                    h-5 w-5 mr-3 transition-colors
                    ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}
                  `} />
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className={`text-xs ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                      {item.description}
                    </div>
                  </div>
                  {isActive && <ChevronRight className="h-4 w-4 text-blue-600" />}
                </Link>
              );
            })}
          </nav>

          {/* Sidebar footer - Logout */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LogOut className="h-5 w-5 mr-3" />
              <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
              {isLoggingOut && (
                <div className="ml-auto">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top navigation bar */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Page title and breadcrumb */}
            <div className="flex-1 lg:ml-0 ml-12">
              <div className="flex items-center">
                <nav className="flex" aria-label="Breadcrumb">
                  <ol className="flex items-center space-x-2 text-sm text-gray-500">
                    <li>
                      <Link href="/admin/dashboard" className="hover:text-gray-700 transition-colors">
                        Admin
                      </Link>
                    </li>
                    {pathname !== '/admin/dashboard' && (
                      <>
                        <ChevronRight className="h-4 w-4" />
                        <li className="text-gray-900 font-medium">
                          {currentPageInfo.title}
                        </li>
                      </>
                    )}
                  </ol>
                </nav>
              </div>
              <div className="mt-1">
                <h1 className="text-xl font-semibold text-gray-900">{currentPageInfo.title}</h1>
                <p className="text-sm text-gray-600">{currentPageInfo.description}</p>
              </div>
            </div>

            {/* User info */}
            <div className="flex items-center space-x-4">
              <div className="hidden sm:block text-right">
                <div className="text-sm font-medium text-gray-900">Admin User</div>
                <div className="text-xs text-gray-500">admin@example.com</div>
              </div>
              <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                <Users className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
