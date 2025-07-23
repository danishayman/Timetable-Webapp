"use client";

import { useState, useEffect } from 'react';
import { Subject, TutorialGroup } from '@/src/types';

export default function ApiTestPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [subjectDetails, setSubjectDetails] = useState<any | null>(null);
  const [tutorials, setTutorials] = useState<TutorialGroup[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all subjects
  const fetchSubjects = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/subjects');
      const result = await response.json();
      
      if (result.error) {
        setError(result.error);
      } else {
        setSubjects(result.data || []);
      }
    } catch (err) {
      setError('Failed to fetch subjects');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch subject details
  const fetchSubjectDetails = async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/subjects/${id}`);
      const result = await response.json();
      
      if (result.error) {
        setError(result.error);
      } else {
        setSubjectDetails(result.data || null);
      }
    } catch (err) {
      setError('Failed to fetch subject details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch tutorials for a subject
  const fetchTutorials = async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/tutorials?subject_id=${id}`);
      const result = await response.json();
      
      if (result.error) {
        setError(result.error);
      } else {
        setTutorials(result.data || []);
      }
    } catch (err) {
      setError('Failed to fetch tutorials');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle subject selection
  const handleSubjectSelect = (subject: Subject) => {
    setSelectedSubject(subject);
    fetchSubjectDetails(subject.id);
    fetchTutorials(subject.id);
  };

  // Fetch subjects on component mount
  useEffect(() => {
    fetchSubjects();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">API Test Page</h1>
      
      {/* Error display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* Loading indicator */}
      {loading && (
        <div className="text-center py-4">
          <p>Loading...</p>
        </div>
      )}
      
      {/* Subjects list */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Subjects</h2>
        <button
          onClick={fetchSubjects}
          className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
        >
          Refresh Subjects
        </button>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {subjects.map(subject => (
            <div
              key={subject.id}
              className={`border p-4 rounded cursor-pointer ${
                selectedSubject?.id === subject.id ? 'bg-blue-100 border-blue-500' : ''
              }`}
              onClick={() => handleSubjectSelect(subject)}
            >
              <h3 className="font-bold">{subject.code}</h3>
              <p>{subject.name}</p>
              <p className="text-sm text-gray-600">Credits: {subject.credits}</p>
              <p className="text-sm text-gray-600">Department: {subject.department}</p>
            </div>
          ))}
        </div>
        
        {subjects.length === 0 && !loading && (
          <p className="text-gray-500">No subjects found</p>
        )}
      </div>
      
      {/* Subject details */}
      {selectedSubject && subjectDetails && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Subject Details: {selectedSubject.code}</h2>
          
          <div className="bg-gray-100 p-4 rounded mb-4">
            <h3 className="font-bold">{subjectDetails.subject.name}</h3>
            <p>{subjectDetails.subject.description}</p>
            <p className="text-sm text-gray-600">Semester: {subjectDetails.subject.semester}</p>
          </div>
          
          {/* Class schedules */}
          <h3 className="font-semibold mt-4 mb-2">Class Schedules</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b">Type</th>
                  <th className="py-2 px-4 border-b">Day</th>
                  <th className="py-2 px-4 border-b">Time</th>
                  <th className="py-2 px-4 border-b">Venue</th>
                  <th className="py-2 px-4 border-b">Instructor</th>
                </tr>
              </thead>
              <tbody>
                {subjectDetails.schedules.map((schedule: any) => (
                  <tr key={schedule.id}>
                    <td className="py-2 px-4 border-b capitalize">{schedule.type}</td>
                    <td className="py-2 px-4 border-b">
                      {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][schedule.day_of_week]}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {schedule.start_time} - {schedule.end_time}
                    </td>
                    <td className="py-2 px-4 border-b">{schedule.venue}</td>
                    <td className="py-2 px-4 border-b">{schedule.instructor}</td>
                  </tr>
                ))}
                
                {subjectDetails.schedules.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-2 px-4 text-center text-gray-500">
                      No class schedules found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Tutorials */}
      {selectedSubject && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Tutorial Groups</h2>
          <button
            onClick={() => fetchTutorials(selectedSubject.id)}
            className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
          >
            Refresh Tutorials
          </button>
          
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b">Group</th>
                  <th className="py-2 px-4 border-b">Day</th>
                  <th className="py-2 px-4 border-b">Time</th>
                  <th className="py-2 px-4 border-b">Venue</th>
                  <th className="py-2 px-4 border-b">Instructor</th>
                </tr>
              </thead>
              <tbody>
                {tutorials.map(tutorial => (
                  <tr key={tutorial.id}>
                    <td className="py-2 px-4 border-b">{tutorial.group_name}</td>
                    <td className="py-2 px-4 border-b">
                      {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][tutorial.day_of_week]}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {tutorial.start_time} - {tutorial.end_time}
                    </td>
                    <td className="py-2 px-4 border-b">{tutorial.venue}</td>
                    <td className="py-2 px-4 border-b">{tutorial.instructor}</td>
                  </tr>
                ))}
                
                {tutorials.length === 0 && !loading && (
                  <tr>
                    <td colSpan={5} className="py-2 px-4 text-center text-gray-500">
                      No tutorial groups found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
} 