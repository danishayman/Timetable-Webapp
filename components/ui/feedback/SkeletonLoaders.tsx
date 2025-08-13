/**
 * Skeleton Loading Components
 * Provides skeleton screens for different data types
 */
'use client';

import React from 'react';

export const SubjectCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 animate-pulse">
      <div className="space-y-4">
        {/* Subject code and name */}
        <div className="space-y-2">
          <div className="h-5 bg-gray-300 rounded w-24"></div>
          <div className="h-6 bg-gray-300 rounded w-3/4"></div>
        </div>
        
        {/* Credits and duration */}
        <div className="flex space-x-4">
          <div className="h-4 bg-gray-300 rounded w-20"></div>
          <div className="h-4 bg-gray-300 rounded w-16"></div>
        </div>
        
        {/* Description */}
        <div className="space-y-2">
          <div className="h-3 bg-gray-300 rounded w-full"></div>
          <div className="h-3 bg-gray-300 rounded w-5/6"></div>
          <div className="h-3 bg-gray-300 rounded w-4/5"></div>
        </div>
        
        {/* Action buttons */}
        <div className="flex space-x-2 pt-2">
          <div className="h-8 bg-gray-300 rounded w-16"></div>
          <div className="h-8 bg-gray-300 rounded w-20"></div>
        </div>
      </div>
    </div>
  );
};

export const TimetableSlotSkeleton: React.FC = () => {
  return (
    <div className="bg-gray-100 border border-gray-300 rounded p-2 h-20 animate-pulse">
      <div className="space-y-1">
        <div className="h-3 bg-gray-300 rounded w-16"></div>
        <div className="h-4 bg-gray-300 rounded w-20"></div>
        <div className="h-3 bg-gray-300 rounded w-12"></div>
      </div>
    </div>
  );
};

export const TimetableGridSkeleton: React.FC = () => {
  const timeSlots = Array.from({ length: 8 }, (_, i) => i);
  const days = Array.from({ length: 5 }, (_, i) => i);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="mb-6 space-y-3">
        <div className="h-8 bg-gray-300 rounded w-48 animate-pulse"></div>
        <div className="h-4 bg-gray-300 rounded w-32 animate-pulse"></div>
      </div>
      
      {/* Grid */}
      <div className="grid grid-cols-6 gap-2">
        {/* Header row */}
        <div className="h-8 bg-gray-300 rounded animate-pulse"></div>
        {days.map((day) => (
          <div key={day} className="h-8 bg-gray-300 rounded animate-pulse"></div>
        ))}
        
        {/* Time slots */}
        {timeSlots.map((slot) => (
          <React.Fragment key={slot}>
            <div className="h-16 bg-gray-300 rounded animate-pulse"></div>
            {days.map((day) => (
              <TimetableSlotSkeleton key={`${slot}-${day}`} />
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export const SubjectListSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <SubjectCardSkeleton key={index} />
      ))}
    </div>
  );
};

export const FormSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-6 animate-pulse">
      {/* Form title */}
      <div className="h-8 bg-gray-300 rounded w-48"></div>
      
      {/* Form fields */}
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <div className="h-4 bg-gray-300 rounded w-24"></div>
            <div className="h-10 bg-gray-300 rounded w-full"></div>
          </div>
        ))}
      </div>
      
      {/* Buttons */}
      <div className="flex space-x-4 pt-4">
        <div className="h-10 bg-gray-300 rounded w-20"></div>
        <div className="h-10 bg-gray-300 rounded w-24"></div>
      </div>
    </div>
  );
};

export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({ 
  rows = 5, 
  cols = 4 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Table header */}
      <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {Array.from({ length: cols }).map((_, index) => (
            <div key={index} className="h-4 bg-gray-300 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
      
      {/* Table rows */}
      <div className="divide-y divide-gray-200">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="px-6 py-4">
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
              {Array.from({ length: cols }).map((_, colIndex) => (
                <div key={colIndex} className="h-4 bg-gray-300 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-8 bg-gray-300 rounded w-64 animate-pulse"></div>
        <div className="h-4 bg-gray-300 rounded w-96 animate-pulse"></div>
      </div>
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
            <div className="space-y-3">
              <div className="h-4 bg-gray-300 rounded w-20"></div>
              <div className="h-8 bg-gray-300 rounded w-16"></div>
              <div className="h-3 bg-gray-300 rounded w-24"></div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Main content area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TimetableGridSkeleton />
        </div>
        <div className="space-y-4">
          <SubjectListSkeleton count={4} />
        </div>
      </div>
    </div>
  );
};

export const NavigationSkeleton: React.FC = () => {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="flex items-center space-x-3 px-4 py-2 animate-pulse">
          <div className="h-5 w-5 bg-gray-300 rounded"></div>
          <div className="h-4 bg-gray-300 rounded flex-1"></div>
        </div>
      ))}
    </div>
  );
};
