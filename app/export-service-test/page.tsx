"use client";

import { useState, useRef } from 'react';
import { ExportService } from '@/src/services/exportService';
import useTimetableStore from '@/src/store/timetableStore';
import { TimetableSlot } from '@/src/types/timetable';
import { generateId } from '@/src/lib/utils';
import { CLASS_TYPES, DAYS_OF_WEEK, TIME_SLOTS } from '@/src/lib/constants';

export default function ExportServiceTestPage() {
  const { timetableSlots, setTimetableSlots } = useTimetableStore();
  const timetableRef = useRef<HTMLDivElement>(null);
  
  const [exportResult, setExportResult] = useState<{
    status: 'idle' | 'loading' | 'success' | 'error';
    message: string;
    data?: any;
  }>({
    status: 'idle',
    message: 'Ready to test export service'
  });

  // Generate sample timetable data
  const generateSampleData = () => {
    const sampleSlots: TimetableSlot[] = [
      {
        id: generateId(),
        subject_id: 'subject1',
        subject_code: 'CS101',
        subject_name: 'Introduction to Programming',
        type: 'lecture',
        day_of_week: 1, // Monday
        start_time: '09:00',
        end_time: '10:30',
        venue: 'Room A101',
        instructor: 'Dr. Smith',
        color: CLASS_TYPES.lecture.color,
        isCustom: false
      },
      {
        id: generateId(),
        subject_id: 'subject1',
        subject_code: 'CS101',
        subject_name: 'Introduction to Programming',
        type: 'tutorial',
        day_of_week: 3, // Wednesday
        start_time: '14:00',
        end_time: '15:30',
        venue: 'Lab 2',
        instructor: 'TA Johnson',
        color: CLASS_TYPES.tutorial.color,
        isCustom: false
      },
      {
        id: generateId(),
        subject_id: 'subject2',
        subject_code: 'MATH201',
        subject_name: 'Calculus I',
        type: 'lecture',
        day_of_week: 2, // Tuesday
        start_time: '11:00',
        end_time: '12:30',
        venue: 'Room B201',
        instructor: 'Prof. Williams',
        color: CLASS_TYPES.lecture.color,
        isCustom: false
      },
      {
        id: generateId(),
        subject_id: 'subject3',
        subject_code: 'PHYS101',
        subject_name: 'Physics I',
        type: 'lab',
        day_of_week: 4, // Thursday
        start_time: '15:00',
        end_time: '17:00',
        venue: 'Physics Lab',
        instructor: 'Dr. Brown',
        color: CLASS_TYPES.lab.color,
        isCustom: false
      },
      {
        id: generateId(),
        subject_id: 'custom1',
        subject_code: 'STUDY',
        subject_name: 'Study Group',
        type: 'custom',
        day_of_week: 5, // Friday
        start_time: '13:00',
        end_time: '14:00',
        venue: 'Library',
        instructor: '',
        color: CLASS_TYPES.custom.color,
        isCustom: true
      }
    ];
    
    setTimetableSlots(sampleSlots);
    setExportResult({
      status: 'success',
      message: 'Sample data generated successfully',
      data: { slotsCount: sampleSlots.length }
    });
  };

  // Test PDF export
  const testPdfExport = async () => {
    if (timetableSlots.length === 0) {
      setExportResult({
        status: 'error',
        message: 'No timetable data to export. Please generate sample data first.'
      });
      return;
    }
    
    setExportResult({
      status: 'loading',
      message: 'Exporting to PDF...'
    });
    
    try {
      // Test the stub method
      const pdfBlob = await ExportService.exportToPDF(timetableSlots, 'Test Timetable');
      
      // Download the PDF
      ExportService.downloadBlob(pdfBlob, 'test_timetable.pdf');
      
      setExportResult({
        status: 'success',
        message: 'PDF export test completed successfully',
        data: { size: pdfBlob.size, type: pdfBlob.type }
      });
    } catch (error) {
      console.error('PDF export failed:', error);
      setExportResult({
        status: 'error',
        message: `PDF export failed: ${error instanceof Error ? error.message : String(error)}`
      });
    }
  };

  // Test ICS export
  const testIcsExport = async () => {
    if (timetableSlots.length === 0) {
      setExportResult({
        status: 'error',
        message: 'No timetable data to export. Please generate sample data first.'
      });
      return;
    }
    
    setExportResult({
      status: 'loading',
      message: 'Exporting to ICS...'
    });
    
    try {
      // Test the stub method
      const icsBlob = await ExportService.exportToICS(timetableSlots, 'Test Timetable');
      
      // Download the ICS file
      ExportService.downloadBlob(icsBlob, 'test_timetable.ics');
      
      setExportResult({
        status: 'success',
        message: 'ICS export test completed successfully',
        data: { size: icsBlob.size, type: icsBlob.type }
      });
    } catch (error) {
      console.error('ICS export failed:', error);
      setExportResult({
        status: 'error',
        message: `ICS export failed: ${error instanceof Error ? error.message : String(error)}`
      });
    }
  };

  // Test Image export
  const testImageExport = async () => {
    if (timetableSlots.length === 0) {
      setExportResult({
        status: 'error',
        message: 'No timetable data to export. Please generate sample data first.'
      });
      return;
    }
    
    setExportResult({
      status: 'loading',
      message: 'Exporting to Image...'
    });
    
    try {
      // Test the stub method
      const imageBlob = await ExportService.exportToImage(timetableSlots, 'Test Timetable');
      
      // Download the image
      ExportService.downloadBlob(imageBlob, 'test_timetable.png');
      
      setExportResult({
        status: 'success',
        message: 'Image export test completed successfully',
        data: { size: imageBlob.size, type: imageBlob.type }
      });
    } catch (error) {
      console.error('Image export failed:', error);
      setExportResult({
        status: 'error',
        message: `Image export failed: ${error instanceof Error ? error.message : String(error)}`
      });
    }
  };

  // Test HTML element export
  const testElementExport = async () => {
    if (!timetableRef.current) {
      setExportResult({
        status: 'error',
        message: 'Timetable element not found.'
      });
      return;
    }
    
    setExportResult({
      status: 'loading',
      message: 'Exporting timetable element...'
    });
    
    try {
      // Test the exportFromElement method
      const pdfBlob = await ExportService.exportFromElement(
        timetableRef.current,
        'pdf',
        'Test Timetable'
      );
      
      // Download the PDF
      ExportService.downloadBlob(
        pdfBlob, 
        ExportService.generateFilename('Test Timetable', 'pdf')
      );
      
      setExportResult({
        status: 'success',
        message: 'Element export test completed successfully',
        data: { size: pdfBlob.size, type: pdfBlob.type }
      });
    } catch (error) {
      console.error('Element export failed:', error);
      setExportResult({
        status: 'error',
        message: `Element export failed: ${error instanceof Error ? error.message : String(error)}`
      });
    }
  };

  // Test data formatting
  const testDataFormatting = () => {
    if (timetableSlots.length === 0) {
      setExportResult({
        status: 'error',
        message: 'No timetable data to format. Please generate sample data first.'
      });
      return;
    }
    
    try {
      // Test the formatTimetableData method
      const formattedData = ExportService.formatTimetableData(timetableSlots);
      
      setExportResult({
        status: 'success',
        message: 'Data formatting test completed successfully',
        data: {
          days: formattedData.days.length,
          timeSlots: formattedData.timeSlots.length,
          slotsByDay: Object.keys(formattedData.slotsByDayAndTime).length
        }
      });
    } catch (error) {
      console.error('Data formatting failed:', error);
      setExportResult({
        status: 'error',
        message: `Data formatting failed: ${error instanceof Error ? error.message : String(error)}`
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Export Service Test</h1>
      
      {/* Test Result */}
      <div className={`p-4 mb-8 rounded-lg ${
        exportResult.status === 'success' ? 'bg-green-100 text-green-800' :
        exportResult.status === 'error' ? 'bg-red-100 text-red-800' :
        exportResult.status === 'loading' ? 'bg-blue-100 text-blue-800' :
        'bg-gray-100 text-gray-800'
      }`}>
        <h2 className="text-lg font-semibold mb-2">Test Result</h2>
        <p className="mb-2">{exportResult.message}</p>
        
        {exportResult.data && (
          <pre className="text-xs mt-2 p-2 bg-white bg-opacity-50 rounded overflow-auto">
            {JSON.stringify(exportResult.data, null, 2)}
          </pre>
        )}
      </div>
      
      {/* Test Controls */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Test Controls</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={generateSampleData}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Generate Sample Data
          </button>
          
          <button
            onClick={testDataFormatting}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Test Data Formatting
          </button>
          
          <button
            onClick={testPdfExport}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            Test PDF Export
          </button>
          
          <button
            onClick={testIcsExport}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            Test ICS Export
          </button>
          
          <button
            onClick={testImageExport}
            className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600"
          >
            Test Image Export
          </button>
          
          <button
            onClick={testElementExport}
            className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
          >
            Test Element Export
          </button>
        </div>
      </div>
      
      {/* Timetable Preview */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Timetable Preview</h2>
        
        <div 
          ref={timetableRef}
          className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow overflow-x-auto"
        >
          {timetableSlots.length > 0 ? (
            <div className="min-w-[800px]">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="p-2 border bg-gray-100 dark:bg-gray-700"></th>
                    {DAYS_OF_WEEK.map((day, index) => (
                      <th key={index} className="p-2 border bg-gray-100 dark:bg-gray-700">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {TIME_SLOTS.map((timeSlot, timeIndex) => (
                    <tr key={timeIndex}>
                      <td className="p-2 border bg-gray-50 dark:bg-gray-800 text-center font-medium">
                        {timeSlot}
                      </td>
                      {DAYS_OF_WEEK.map((_, dayIndex) => {
                        // Find slots for this day and time
                        const slotsForCell = timetableSlots.filter(
                          slot => slot.day_of_week === dayIndex && slot.start_time === timeSlot
                        );
                        
                        return (
                          <td key={dayIndex} className="p-2 border min-w-[120px] h-12">
                            {slotsForCell.map(slot => (
                              <div 
                                key={slot.id}
                                className="text-xs p-1 rounded mb-1"
                                style={{ backgroundColor: slot.color, color: 'white' }}
                              >
                                <div className="font-bold">{slot.subject_code}</div>
                                <div>{slot.type}</div>
                                <div>{slot.venue}</div>
                              </div>
                            ))}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 italic text-center py-8">
              No timetable data available. Please generate sample data.
            </p>
          )}
        </div>
      </div>
      
      {/* Current Timetable Data */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-2">Current Timetable Data</h2>
        <p className="mb-4">Total slots: {timetableSlots.length}</p>
        
        {timetableSlots.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-800 shadow rounded-lg">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="py-2 px-4 text-left">Subject</th>
                  <th className="py-2 px-4 text-left">Type</th>
                  <th className="py-2 px-4 text-left">Day</th>
                  <th className="py-2 px-4 text-left">Time</th>
                  <th className="py-2 px-4 text-left">Venue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {timetableSlots.map(slot => (
                  <tr key={slot.id}>
                    <td className="py-2 px-4">
                      <div className="font-medium">{slot.subject_code}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{slot.subject_name}</div>
                    </td>
                    <td className="py-2 px-4">
                      <span 
                        className="inline-block px-2 py-1 rounded text-xs font-medium"
                        style={{ backgroundColor: slot.color, color: 'white' }}
                      >
                        {slot.type.charAt(0).toUpperCase() + slot.type.slice(1)}
                      </span>
                    </td>
                    <td className="py-2 px-4">
                      {DAYS_OF_WEEK[slot.day_of_week]}
                    </td>
                    <td className="py-2 px-4">
                      {slot.start_time} - {slot.end_time}
                    </td>
                    <td className="py-2 px-4">{slot.venue}</td>
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