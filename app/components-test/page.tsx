"use client";

import { useState } from 'react';
import SubjectCard from '@/src/components/subjects/SubjectCard';
import { Subject } from '@/src/types/subject';
import Loading from '@/src/components/common/Loading';
import ErrorMessage from '@/src/components/common/ErrorMessage';

// Sample subject data for testing
const sampleSubjects: Subject[] = [
  {
    id: '1',
    code: 'CS101',
    name: 'Introduction to Programming',
    credits: 3,
    description: 'Fundamentals of programming using Python. Topics include basic syntax, data types, control structures, functions, and object-oriented programming concepts.',
    semester: 'Fall 2024',
    department: 'Computer Science',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    code: 'MATH201',
    name: 'Calculus I',
    credits: 4,
    description: 'Limits, derivatives, and integrals of algebraic and transcendental functions. Applications to related rates, curve sketching, and optimization problems.',
    semester: 'Fall 2024',
    department: 'Mathematics',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    code: 'ENG105',
    name: 'Academic Writing',
    credits: 3,
    description: 'Principles of academic writing and research. Focus on developing clear and effective writing skills for academic purposes.',
    semester: 'Fall 2024',
    department: 'English',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export default function ComponentsTestPage() {
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [showLoading, setShowLoading] = useState(false);
  const [showError, setShowError] = useState(false);

  const handleSubjectClick = (subject: Subject) => {
    setSelectedSubject(selectedSubject?.id === subject.id ? null : subject);
  };

  const toggleLoading = () => {
    setShowLoading(!showLoading);
  };

  const toggleError = () => {
    setShowError(!showError);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Component Test Page</h1>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">SubjectCard Component</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Click on a card to select/deselect it.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {sampleSubjects.map(subject => (
            <SubjectCard
              key={subject.id}
              subject={subject}
              isSelected={selectedSubject?.id === subject.id}
              onClick={handleSubjectClick}
              showDetails={selectedSubject?.id === subject.id}
            />
          ))}
        </div>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Loading Component</h2>
        <button 
          onClick={toggleLoading}
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded mb-4"
        >
          {showLoading ? 'Hide' : 'Show'} Loading Spinner
        </button>
        
        {showLoading && (
          <div className="border rounded p-6 bg-white dark:bg-gray-800">
            <h3 className="text-lg font-medium mb-2">Loading Sizes</h3>
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Small</p>
                <Loading size="small" />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Medium (default)</p>
                <Loading />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Large</p>
                <Loading size="large" />
              </div>
            </div>
          </div>
        )}
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Error Message Component</h2>
        <button 
          onClick={toggleError}
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded mb-4"
        >
          {showError ? 'Hide' : 'Show'} Error Message
        </button>
        
        {showError && (
          <div className="border rounded p-6 bg-white dark:bg-gray-800">
            <ErrorMessage 
              message="Failed to fetch subjects. Please check your connection and try again."
              retry={() => alert('Retry action triggered')}
            />
            <div className="mt-4">
              <ErrorMessage 
                message="This is an error without a retry option."
              />
            </div>
          </div>
        )}
      </section>
    </div>
  );
} 