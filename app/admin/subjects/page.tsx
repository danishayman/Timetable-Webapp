'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Plus, Edit, Trash2, Search, Filter, AlertCircle, CheckCircle, Loader2, ArrowLeft } from 'lucide-react';
import SubjectForm from '@/components/features/admin/SubjectForm';
import { Subject } from '@/types';
import useAdminAuthStore from '@/store/adminAuthStore';

interface FilterState {
  search: string;
  department: string;
  semester: string;
  credits: string;
}

type ViewMode = 'list' | 'create' | 'edit';

export default function AdminSubjectsPage() {
  const router = useRouter();
  const { isAuthenticated, checkAuth, isLoading: authLoading } = useAdminAuthStore();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [editingSubject, setEditingSubject] = useState<Subject | undefined>(undefined);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    department: '',
    semester: '',
    credits: ''
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

  // Fetch subjects on component mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchSubjects();
    }
  }, [isAuthenticated]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const fetchSubjects = async () => {
    setLoading(true);
    setError(null);
    
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
      setError(err instanceof Error ? err.message : 'An error occurred while fetching subjects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubject = () => {
    setEditingSubject(undefined);
    setViewMode('create');
  };

  const handleEditSubject = (subject: Subject) => {
    setEditingSubject(subject);
    setViewMode('edit');
  };

  const handleDeleteSubject = async (subject: Subject) => {
    if (!confirm(`Are you sure you want to delete "${subject.name}" (${subject.code})?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/subjects?id=${subject.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer mock-token-for-testing', // TODO: Replace with real auth token
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete subject');
      }

      setSuccessMessage(`Subject "${subject.name}" deleted successfully`);
      await fetchSubjects(); // Refresh the list
    } catch (err) {
      console.error('Error deleting subject:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while deleting the subject');
    }
  };

  const handleFormSuccess = () => {
    setSuccessMessage(viewMode === 'create' ? 'Subject created successfully!' : 'Subject updated successfully!');
    setViewMode('list');
    setEditingSubject(undefined);
    fetchSubjects(); // Refresh the list
  };

  const handleFormCancel = () => {
    setViewMode('list');
    setEditingSubject(undefined);
  };

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      department: '',
      semester: '',
      credits: ''
    });
  };

  const handleBackToDashboard = () => {
    router.push('/admin');
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

  // Filter subjects based on current filters
  const filteredSubjects = subjects.filter(subject => {
    const matchesSearch = !filters.search || 
      subject.code.toLowerCase().includes(filters.search.toLowerCase()) ||
      subject.name.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesDepartment = !filters.department || 
      (subject.department && subject.department.toLowerCase().includes(filters.department.toLowerCase()));
    
    const matchesSemester = !filters.semester || 
      (subject.semester && subject.semester.toLowerCase().includes(filters.semester.toLowerCase()));
    
    const matchesCredits = !filters.credits || 
      subject.credits.toString() === filters.credits;

    return matchesSearch && matchesDepartment && matchesSemester && matchesCredits;
  });

  // Get unique values for filter dropdowns
  const departments = [...new Set(subjects.map(s => s.department).filter((dept): dept is string => Boolean(dept)))];
  const semesters = [...new Set(subjects.map(s => s.semester).filter((sem): sem is string => Boolean(sem)))];
  const creditOptions = [...new Set(subjects.map(s => s.credits))].sort((a, b) => a - b);

  if (viewMode !== 'list') {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => setViewMode('list')}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Subject List
          </button>
        </div>
        
        <SubjectForm
          subject={editingSubject}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
          isLoading={loading}
        />
      </div>
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Subject Management</h2>
          <p className="text-gray-600">
            Manage all subjects and courses in the system. ({filteredSubjects.length} subjects)
          </p>
        </div>
        <button
          onClick={handleCreateSubject}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Subject
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    placeholder="Search by code or name..."
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select
                  value={filters.department}
                  onChange={(e) => handleFilterChange('department', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                <select
                  value={filters.semester}
                  onChange={(e) => handleFilterChange('semester', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Semesters</option>
                  {semesters.map(sem => (
                    <option key={sem} value={sem}>{sem}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Credits</label>
                <select
                  value={filters.credits}
                  onChange={(e) => handleFilterChange('credits', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Credits</option>
                  {creditOptions.map(credits => (
                    <option key={credits} value={credits}>{credits} Credits</option>
                  ))}
                </select>
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

      {/* Subject List */}
      <div className="bg-white shadow rounded-lg">
        {loading ? (
          <div className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-4" />
            <p className="text-gray-600">Loading subjects...</p>
          </div>
        ) : filteredSubjects.length === 0 ? (
          <div className="p-8 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-sm font-medium text-gray-900 mb-2">
              {subjects.length === 0 ? 'No subjects found' : 'No subjects match your filters'}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {subjects.length === 0 ? 'Get started by creating your first subject.' : 'Try adjusting your search criteria.'}
            </p>
            {subjects.length === 0 && (
              <button
                onClick={handleCreateSubject}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Subject
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Credits
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Semester
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSubjects.map((subject) => (
                  <tr key={subject.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{subject.code}</div>
                        <div className="text-sm text-gray-500">{subject.name}</div>
                        {subject.description && (
                          <div className="text-xs text-gray-400 mt-1 max-w-xs truncate">
                            {subject.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {subject.credits}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {subject.department || '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {subject.semester || '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEditSubject(subject)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded"
                          title="Edit subject"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSubject(subject)}
                          className="text-red-600 hover:text-red-900 p-1 rounded"
                          title="Delete subject"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
