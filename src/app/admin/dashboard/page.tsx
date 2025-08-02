'use client';

import React from 'react';
import { BookOpen, Calendar, Users, TrendingUp } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
}

function StatCard({ title, value, icon: Icon, change, changeType = 'neutral' }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <Icon className="h-8 w-8 text-blue-600" />
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
            <dd className="flex items-baseline">
              <div className="text-2xl font-semibold text-gray-900">{value}</div>
              {change && (
                <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                  changeType === 'positive' ? 'text-green-600' : 
                  changeType === 'negative' ? 'text-red-600' : 
                  'text-gray-500'
                }`}>
                  {change}
                </div>
              )}
            </dd>
          </dl>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  // Mock data for demonstration
  const stats = [
    {
      title: 'Total Subjects',
      value: 24,
      icon: BookOpen,
      change: '+3 this month',
      changeType: 'positive' as const
    },
    {
      title: 'Active Schedules',
      value: 156,
      icon: Calendar,
      change: '+12 this week',
      changeType: 'positive' as const
    },
    {
      title: 'Total Students',
      value: '1,205',
      icon: Users,
      change: '+48 this month',
      changeType: 'positive' as const
    },
    {
      title: 'System Usage',
      value: '94.2%',
      icon: TrendingUp,
      change: '+2.1% from last month',
      changeType: 'positive' as const
    }
  ];

  const recentActions = [
    {
      action: 'Subject Created',
      details: 'Advanced Database Systems (CS401)',
      time: '2 hours ago',
      type: 'create'
    },
    {
      action: 'Schedule Updated',
      details: 'Data Structures - Lecture time changed',
      time: '4 hours ago',
      type: 'update'
    },
    {
      action: 'Subject Deleted',
      details: 'Removed obsolete course (CS199)',
      time: '1 day ago',
      type: 'delete'
    },
    {
      action: 'Schedule Created',
      details: 'New tutorial sessions for CS301',
      time: '2 days ago',
      type: 'create'
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back, Admin!</h2>
        <p className="text-gray-600">
          Here's what's happening with your timetable system today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            change={stat.change}
            changeType={stat.changeType}
          />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <a
                href="/admin/dashboard/subjects"
                className="flex items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors group"
              >
                <BookOpen className="h-5 w-5 text-blue-600 mr-3" />
                <div>
                  <div className="font-medium text-gray-900 group-hover:text-blue-700">
                    Manage Subjects
                  </div>
                  <div className="text-sm text-gray-500">
                    Add, edit, or remove subjects
                  </div>
                </div>
              </a>
              <a
                href="/admin/dashboard/schedules"
                className="flex items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors group"
              >
                <Calendar className="h-5 w-5 text-green-600 mr-3" />
                <div>
                  <div className="font-medium text-gray-900 group-hover:text-green-700">
                    Manage Schedules
                  </div>
                  <div className="text-sm text-gray-500">
                    Configure class times and venues
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {recentActions.map((action, index) => (
                <div key={index} className="flex items-start">
                  <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 mr-3 ${
                    action.type === 'create' ? 'bg-green-500' :
                    action.type === 'update' ? 'bg-blue-500' :
                    'bg-red-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {action.action}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {action.details}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {action.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">System Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">✓</div>
              <div className="text-sm font-medium text-gray-900 mt-2">Database</div>
              <div className="text-xs text-gray-500">All systems operational</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">✓</div>
              <div className="text-sm font-medium text-gray-900 mt-2">API Services</div>
              <div className="text-xs text-gray-500">Response time: 120ms</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">!</div>
              <div className="text-sm font-medium text-gray-900 mt-2">Backup</div>
              <div className="text-xs text-gray-500">Last backup: 2 hours ago</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
