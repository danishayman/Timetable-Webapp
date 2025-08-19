'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Plus, Edit, Trash2, Search, Filter, AlertCircle, CheckCircle, Loader2, ArrowLeft, Clock, MapPin, Users } from 'lucide-react';
import ScheduleForm from '@/components/features/admin/ScheduleForm';
import { ClassSchedule } from '@/types/classSchedule';
import { Subject } from '@/types/subject';
import useAdminAuthStore from '@/store/adminAuthStore';
import { DAYS_OF_WEEK, CLASS_TYPES } from '@/constants';

interface FilterState {
  search: string;
  subject_id: string;
  type: string;
  day_of_week: string;
  venue: string;
}

type ViewMode = 'list' | 'create' | 'edit';

export default function AdminSchedulesPage() {
  const router = useRouter();
  const { isAuthenticated, checkAuth, isLoading: authLoading } = useAdminAuthStore();
  
  const [schedules, setSchedules] = useState<ClassSchedule[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [editingSchedule, setEditingSchedule] = useState<ClassSchedule | undefined>(undefined);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    subject_id: '',
    type: '',
    day_of_week: '',
    venue: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/admin/login');
    }
  }, [isAuthenticated, authLoading, router]);


  // Memoize fetchData to avoid useEffect dependency warning
  const fetchData = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([fetchSchedules(), fetchSubjects()]);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch data on component mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, fetchData]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // ...existing code...

  const fetchSchedules = async () => {
    try {
      const response = await fetch('/api/admin/schedules', {
        headers: {
          'Authorization': 'Bearer mock-token-for-testing', // TODO: Replace with real auth token
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch schedules');
      }

      const result = await response.json();
      setSchedules(result.data || []);
    } catch (err) {
      console.error('Error fetching schedules:', err);
      throw err;
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await fetch('/api/admin/subjects', {
        headers: {
          'Authorization': 'Bearer mock-token-for-testing', // TODO: Replace with real auth token
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch subjects');
      }

      const result = await response.json();
      setSubjects(result.data || []);
    } catch (err) {
      console.error('Error fetching subjects:', err);
      throw err;
    }
  };

  const handleCreateSchedule = () => {
    setEditingSchedule(undefined);
    setViewMode('create');
  };

  const handleEditSchedule = (schedule: ClassSchedule) => {
    setEditingSchedule(schedule);
    setViewMode('edit');
  };

  const handleDeleteSchedule = async (schedule: ClassSchedule) => {
    const subjectName = getSubjectName(schedule.subject_id);
    const dayName = DAYS_OF_WEEK[schedule.day_of_week];
    const typeName = CLASS_TYPES[schedule.type as keyof typeof CLASS_TYPES]?.name || schedule.type;
    
    if (!confirm(`Are you sure you want to delete this ${typeName} schedule?\n\nSubject: ${subjectName}\nDay: ${dayName}\nTime: ${schedule.start_time} - ${schedule.end_time}\nVenue: ${schedule.venue}`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/schedules/${schedule.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer mock-token-for-testing', // TODO: Replace with real auth token
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete schedule');
      }

      setSuccessMessage(`Schedule deleted successfully`);
      await fetchSchedules(); // Refresh the list
    } catch (err) {
      console.error('Error deleting schedule:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while deleting the schedule');
    }
  };

  const handleFormSuccess = () => {
    setSuccessMessage(viewMode === 'create' ? 'Schedule created successfully!' : 'Schedule updated successfully!');
    setViewMode('list');
    setEditingSchedule(undefined);
    fetchSchedules(); // Refresh the list
  };

  const handleFormCancel = () => {
    setViewMode('list');
    setEditingSchedule(undefined);
  };

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      subject_id: '',
      type: '',
      day_of_week: '',
      venue: ''
    });
  };

  const handleBackToDashboard = () => {
    router.push('/admin');
  };

  const getSubjectName = (subjectId: string): string => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject ? `${subject.code} - ${subject.name}` : 'Unknown Subject';
  };

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Don't render content if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Filter schedules based on current filters
  const filteredSchedules = schedules.filter(schedule => {
    const subjectName = getSubjectName(schedule.subject_id).toLowerCase();
    const matchesSearch = !filters.search || 
      subjectName.includes(filters.search.toLowerCase()) ||
      schedule.venue.toLowerCase().includes(filters.search.toLowerCase()) ||
      (schedule.instructor && schedule.instructor.toLowerCase().includes(filters.search.toLowerCase()));
    
    const matchesSubject = !filters.subject_id || schedule.subject_id === filters.subject_id;
    const matchesType = !filters.type || schedule.type === filters.type;
    const matchesDay = !filters.day_of_week || schedule.day_of_week.toString() === filters.day_of_week;
    const matchesVenue = !filters.venue || schedule.venue.toLowerCase().includes(filters.venue.toLowerCase());

    return matchesSearch && matchesSubject && matchesType && matchesDay && matchesVenue;
  });

  // Get unique values for filter dropdowns
  // const uniqueVenues = [...new Set(schedules.map(s => s.venue))].sort();
  const availableTypes = Object.keys(CLASS_TYPES).filter(key => key !== 'custom');

  if (viewMode !== 'list') {
    return (
      <ScheduleForm
        schedule={editingSchedule}
        subjects={subjects}
        onSuccess={handleFormSuccess}
        onCancel={handleFormCancel}
        isLoading={loading}
      />
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Back to Dashboard Button */}
      <div className="mb-6">
        <button
          onClick={handleBackToDashboard}
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 flex items-center p-4 bg-green-50 border border-green-200 rounded-md">
          <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
          <span className="text-green-800">{successMessage}</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 flex items-center p-4 bg-red-50 border border-red-200 rounded-md">
          <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
          <span className="text-red-800">{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-600 hover:text-red-800"
          >
            ×
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Schedule Management</h2>
          <p className="text-gray-600">
            Manage class schedules, timeslots, and venues. ({filteredSchedules.length} schedules)
          </p>
        </div>
        <button
          onClick={handleCreateSchedule}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Schedule
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            <Filter className="h-4 w-4 mr-2" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>
        
        {showFilters && (
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    placeholder="Search subjects, venues, instructors..."
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <select
                  value={filters.subject_id}
                  onChange={(e) => handleFilterChange('subject_id', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">All Subjects</option>
                  {subjects.map(subject => (
                    <option key={subject.id} value={subject.id}>
                      {subject.code} - {subject.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">All Types</option>
                  {availableTypes.map(type => (
                    <option key={type} value={type}>
                      {CLASS_TYPES[type as keyof typeof CLASS_TYPES].name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
                <select
                  value={filters.day_of_week}
                  onChange={(e) => handleFilterChange('day_of_week', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">All Days</option>
                  {DAYS_OF_WEEK.map((day, index) => (
                    <option key={index} value={index}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
                <input
                  type="text"
                  value={filters.venue}
                  onChange={(e) => handleFilterChange('venue', e.target.value)}
                  placeholder="Filter by venue..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={clearFilters}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Schedule List */}
      <div className="bg-white shadow rounded-lg">
        {loading ? (
          <div className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-green-600 mb-4" />
            <p className="text-gray-600">Loading schedules...</p>
          </div>
        ) : filteredSchedules.length === 0 ? (
          <div className="p-8 text-center">
            <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-sm font-medium text-gray-900 mb-2">
              {schedules.length === 0 ? 'No schedules found' : 'No schedules match your filters'}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {schedules.length === 0 ? 'Get started by creating your first schedule.' : 'Try adjusting your search criteria.'}
            </p>
            {schedules.length === 0 && (
              <button
                onClick={handleCreateSchedule}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Schedule
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject & Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Schedule
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Venue & Instructor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Capacity
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSchedules
                  .sort((a, b) => {
                    // Sort by day of week first, then by start time
                    if (a.day_of_week !== b.day_of_week) {
                      return a.day_of_week - b.day_of_week;
                    }
                    return a.start_time.localeCompare(b.start_time);
                  })
                  .map((schedule) => {
                    const subject = subjects.find(s => s.id === schedule.subject_id);
                    const typeInfo = CLASS_TYPES[schedule.type as keyof typeof CLASS_TYPES];
                    
                    return (
                      <tr key={schedule.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {subject ? `${subject.code} - ${subject.name}` : 'Unknown Subject'}
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <span 
                                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                  schedule.type === 'lecture' ? 'bg-blue-100 text-blue-800' :
                                  schedule.type === 'tutorial' ? 'bg-green-100 text-green-800' :
                                  schedule.type === 'lab' ? 'bg-yellow-100 text-yellow-800' :
                                  schedule.type === 'practical' ? 'bg-purple-100 text-purple-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {typeInfo ? typeInfo.name : schedule.type}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            <div className="flex items-center mb-1">
                              <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                              {DAYS_OF_WEEK[schedule.day_of_week]}
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1 text-gray-400" />
                              {schedule.start_time} - {schedule.end_time}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            <div className="flex items-center mb-1">
                              <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                              {schedule.venue}
                            </div>
                            {schedule.instructor && (
                              <div className="text-sm text-gray-500">
                                {schedule.instructor}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <Users className="h-4 w-4 mr-1 text-gray-400" />
                            {schedule.max_capacity}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleEditSchedule(schedule)}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded"
                              title="Edit schedule"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteSchedule(schedule)}
                              className="text-red-600 hover:text-red-900 p-1 rounded"
                              title="Delete schedule"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
