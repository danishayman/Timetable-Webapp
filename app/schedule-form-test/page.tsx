'use client';

import { useState, useEffect } from 'react';
import ScheduleForm from '@/src/components/admin/ScheduleForm';
import { Subject } from '@/src/types/subject';
import { ClassSchedule } from '@/src/types/classSchedule';

export default function ScheduleFormTestPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ClassSchedule | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  // Mock subjects data for testing
  useEffect(() => {
    const mockSubjects: Subject[] = [
      {
        id: '1',
        code: 'CS101',
        name: 'Introduction to Computer Science',
        credits: 3,
        description: 'Basic computer science concepts',
        semester: 'Fall 2024',
        department: 'Computer Science',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '2',
        code: 'MATH201',
        name: 'Linear Algebra',
        credits: 4,
        description: 'Introduction to linear algebra',
        semester: 'Fall 2024',
        department: 'Mathematics',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '3',
        code: 'ENG105',
        name: 'English Composition',
        credits: 3,
        description: 'Writing and composition skills',
        semester: 'Fall 2024',
        department: 'English',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ];
    setSubjects(mockSubjects);
  }, []);

  // Mock schedule for editing test
  const mockSchedule: ClassSchedule = {
    id: 'test-schedule-id',
    subject_id: '1',
    type: 'lecture',
    day_of_week: 1,
    start_time: '09:00',
    end_time: '10:30',
    venue: 'Room A101',
    instructor: 'Dr. Smith',
    max_capacity: 50,
    created_at: '2024-01-01T00:00:00Z'
  };

  const handleFormSuccess = () => {
    console.log('Form submitted successfully!');
    setShowForm(false);
    setEditingSchedule(undefined);
    // In a real app, you would refresh the schedules list here
  };

  const handleFormCancel = () => {
    console.log('Form cancelled');
    setShowForm(false);
    setEditingSchedule(undefined);
  };

  const handleCreateNew = () => {
    setEditingSchedule(undefined);
    setShowForm(true);
  };

  const handleEdit = () => {
    setEditingSchedule(mockSchedule);
    setShowForm(true);
  };

  const toggleLoading = () => {
    setIsLoading(!isLoading);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Schedule Form Test Page
        </h1>

        {!showForm ? (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
            
            <div className="space-y-4">
              <div className="flex space-x-4">
                <button
                  onClick={handleCreateNew}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Test Create New Schedule
                </button>
                
                <button
                  onClick={handleEdit}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  Test Edit Schedule
                </button>
                
                <button
                  onClick={toggleLoading}
                  className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition-colors"
                >
                  Toggle Loading State: {isLoading ? 'ON' : 'OFF'}
                </button>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">Available Test Subjects:</h3>
                <div className="space-y-2">
                  {subjects.map(subject => (
                    <div key={subject.id} className="p-3 bg-gray-50 rounded-md">
                      <div className="font-medium">{subject.code} - {subject.name}</div>
                      <div className="text-sm text-gray-600">
                        {subject.department} • {subject.credits} Credits • {subject.semester}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {editingSchedule && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-2">Mock Schedule for Editing:</h3>
                  <div className="p-3 bg-blue-50 rounded-md">
                    <div className="font-medium">
                      {subjects.find(s => s.id === editingSchedule.subject_id)?.code} - {editingSchedule.type}
                    </div>
                    <div className="text-sm text-gray-600">
                      Day {editingSchedule.day_of_week} • {editingSchedule.start_time} - {editingSchedule.end_time} • {editingSchedule.venue}
                    </div>
                    <div className="text-sm text-gray-600">
                      Instructor: {editingSchedule.instructor} • Capacity: {editingSchedule.max_capacity}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <ScheduleForm
            schedule={editingSchedule}
            subjects={subjects}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
            isLoading={isLoading}
          />
        )}

        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <h3 className="font-medium text-yellow-800 mb-2">Testing Instructions:</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Click "Test Create New Schedule" to test form creation mode</li>
            <li>• Click "Test Edit Schedule" to test form editing mode with pre-filled data</li>
            <li>• Toggle loading state to test disabled form behavior</li>
            <li>• Test form validation by submitting with empty/invalid fields</li>
            <li>• Check console for form submission results</li>
            <li>• Test time auto-calculation when changing start time</li>
            <li>• Test subject selection and type changes</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
