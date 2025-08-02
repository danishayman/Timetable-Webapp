'use client';

import React from 'react';
import { Calendar, Plus } from 'lucide-react';

export default function AdminSchedulesPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Schedule Management</h2>
          <p className="text-gray-600">
            Manage class schedules, timeslots, and venues.
          </p>
        </div>
        <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors">
          <Plus className="h-4 w-4 mr-2" />
          Add Schedule
        </button>
      </div>

      {/* Content Area */}
      <div className="bg-white shadow rounded-lg">
        <div className="p-6">
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Schedule Management</h3>
            <p className="mt-1 text-sm text-gray-500">
              This page will contain the schedule management interface.
            </p>
            <p className="mt-2 text-xs text-gray-400">
              Coming in Phase 12 - Admin Schedule Management
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
