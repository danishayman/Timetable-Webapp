'use client';

import React from 'react';
import { Settings } from 'lucide-react';

export default function AdminSettingsPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">System Settings</h2>
        <p className="text-gray-600">
          Configure system preferences and administrative settings.
        </p>
      </div>

      {/* Content Area */}
      <div className="bg-white shadow rounded-lg">
        <div className="p-6">
          <div className="text-center py-12">
            <Settings className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">System Settings</h3>
            <p className="mt-1 text-sm text-gray-500">
              This page will contain system configuration options.
            </p>
            <p className="mt-2 text-xs text-gray-400">
              Future enhancement - Not part of current MVP
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
