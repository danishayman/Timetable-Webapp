// Test utility functions for ScheduleForm
// This file can be imported in tests or run directly in the browser console

type TimeTestCase = {
  input: string;
  expectedMinutes: number;
}

type DurationTestCase = {
  startTime: string;
  endTime: string;
  expectedDurationHours: number;
  isValid: boolean;
}

// Test cases for time conversion
const timeConversionTests: TimeTestCase[] = [
  { input: '08:00', expectedMinutes: 480 },
  { input: '09:30', expectedMinutes: 570 },
  { input: '12:00', expectedMinutes: 720 },
  { input: '18:30', expectedMinutes: 1110 },
  { input: '21:30', expectedMinutes: 1290 }
];

// Test cases for duration validation
const durationTests: DurationTestCase[] = [
  { startTime: '09:00', endTime: '10:30', expectedDurationHours: 1.5, isValid: true },
  { startTime: '14:00', endTime: '16:00', expectedDurationHours: 2, isValid: true },
  { startTime: '08:00', endTime: '08:15', expectedDurationHours: 0.25, isValid: false }, // Too short
  { startTime: '09:00', endTime: '14:00', expectedDurationHours: 5, isValid: false }, // Too long
  { startTime: '10:00', endTime: '09:00', expectedDurationHours: -1, isValid: false }, // End before start
];

// Helper functions (same as in ScheduleForm)
const timeToMinutes = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

const validateDuration = (startTime: string, endTime: string): { isValid: boolean; durationMinutes: number; error?: string } => {
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);
  const durationMinutes = endMinutes - startMinutes;

  if (durationMinutes <= 0) {
    return { isValid: false, durationMinutes, error: 'End time must be after start time' };
  }

  if (durationMinutes < 30) {
    return { isValid: false, durationMinutes, error: 'Class duration must be at least 30 minutes' };
  }

  if (durationMinutes > 240) {
    return { isValid: false, durationMinutes, error: 'Class duration cannot exceed 4 hours' };
  }

  return { isValid: true, durationMinutes };
};

// Test runner
const runTests = () => {
  console.log('=== ScheduleForm Utility Tests ===\n');

  // Test time conversion
  console.log('1. Testing time to minutes conversion:');
  let timeConversionPassed = 0;
  timeConversionTests.forEach(test => {
    const result = timeToMinutes(test.input);
    const passed = result === test.expectedMinutes;
    console.log(`  ${test.input} -> ${result} minutes (expected: ${test.expectedMinutes}) ${passed ? '✅' : '❌'}`);
    if (passed) timeConversionPassed++;
  });
  console.log(`  Result: ${timeConversionPassed}/${timeConversionTests.length} passed\n`);

  // Test minutes to time conversion
  console.log('2. Testing minutes to time conversion:');
  let minutesToTimePassed = 0;
  timeConversionTests.forEach(test => {
    const result = minutesToTime(test.expectedMinutes);
    const passed = result === test.input;
    console.log(`  ${test.expectedMinutes} minutes -> ${result} (expected: ${test.input}) ${passed ? '✅' : '❌'}`);
    if (passed) minutesToTimePassed++;
  });
  console.log(`  Result: ${minutesToTimePassed}/${timeConversionTests.length} passed\n`);

  // Test duration validation
  console.log('3. Testing duration validation:');
  let durationPassed = 0;
  durationTests.forEach(test => {
    const result = validateDuration(test.startTime, test.endTime);
    const durationHours = result.durationMinutes / 60;
    const validationPassed = result.isValid === test.isValid;
    const durationCorrect = Math.abs(durationHours - test.expectedDurationHours) < 0.01;
    const passed = validationPassed && (test.isValid ? durationCorrect : true);
    
    console.log(`  ${test.startTime} - ${test.endTime}: ${durationHours.toFixed(1)}h, valid: ${result.isValid} ${passed ? '✅' : '❌'}`);
    if (result.error) {
      console.log(`    Error: ${result.error}`);
    }
    if (passed) durationPassed++;
  });
  console.log(`  Result: ${durationPassed}/${durationTests.length} passed\n`);

  // Overall result
  const totalTests = timeConversionTests.length + timeConversionTests.length + durationTests.length;
  const totalPassed = timeConversionPassed + minutesToTimePassed + durationPassed;
  console.log(`=== Overall Test Result: ${totalPassed}/${totalTests} passed ===`);

  return {
    timeConversion: timeConversionPassed === timeConversionTests.length,
    minutesToTime: minutesToTimePassed === timeConversionTests.length,
    duration: durationPassed === durationTests.length,
    overall: totalPassed === totalTests
  };
};

// Auto-calculate end time test
const testAutoEndTime = (startTime: string, classType: 'lecture' | 'tutorial' | 'lab' | 'practical') => {
  const startMinutes = timeToMinutes(startTime);
  const defaultDuration = classType === 'lecture' ? 90 : 60;
  const endMinutes = startMinutes + defaultDuration;
  const maxEndMinutes = timeToMinutes('22:00');
  const calculatedEnd = Math.min(endMinutes, maxEndMinutes);
  const endTime = minutesToTime(calculatedEnd);

  console.log(`Auto-calculate test: ${startTime} + ${defaultDuration}min (${classType}) = ${endTime}`);
  return endTime;
};

// Form validation test cases
const formValidationTests = [
  {
    name: 'Valid lecture schedule',
    data: {
      subject_id: 'valid-uuid',
      type: 'lecture' as const,
      day_of_week: 1,
      start_time: '09:00',
      end_time: '10:30',
      venue: 'Room A101',
      instructor: 'Dr. Smith',
      max_capacity: 50
    },
    shouldPass: true
  },
  {
    name: 'Missing subject',
    data: {
      subject_id: '',
      type: 'lecture' as const,
      day_of_week: 1,
      start_time: '09:00',
      end_time: '10:30',
      venue: 'Room A101',
      instructor: 'Dr. Smith',
      max_capacity: 50
    },
    shouldPass: false
  },
  {
    name: 'Invalid day of week',
    data: {
      subject_id: 'valid-uuid',
      type: 'lecture' as const,
      day_of_week: 8,
      start_time: '09:00',
      end_time: '10:30',
      venue: 'Room A101',
      instructor: 'Dr. Smith',
      max_capacity: 50
    },
    shouldPass: false
  },
  {
    name: 'End time before start time',
    data: {
      subject_id: 'valid-uuid',
      type: 'lecture' as const,
      day_of_week: 1,
      start_time: '10:30',
      end_time: '09:00',
      venue: 'Room A101',
      instructor: 'Dr. Smith',
      max_capacity: 50
    },
    shouldPass: false
  },
  {
    name: 'Too short duration',
    data: {
      subject_id: 'valid-uuid',
      type: 'lecture' as const,
      day_of_week: 1,
      start_time: '09:00',
      end_time: '09:15',
      venue: 'Room A101',
      instructor: 'Dr. Smith',
      max_capacity: 50
    },
    shouldPass: false
  },
  {
    name: 'Too long duration',
    data: {
      subject_id: 'valid-uuid',
      type: 'lecture' as const,
      day_of_week: 1,
      start_time: '09:00',
      end_time: '14:00',
      venue: 'Room A101',
      instructor: 'Dr. Smith',
      max_capacity: 50
    },
    shouldPass: false
  },
  {
    name: 'Missing venue',
    data: {
      subject_id: 'valid-uuid',
      type: 'lecture' as const,
      day_of_week: 1,
      start_time: '09:00',
      end_time: '10:30',
      venue: '',
      instructor: 'Dr. Smith',
      max_capacity: 50
    },
    shouldPass: false
  },
  {
    name: 'Invalid capacity (too low)',
    data: {
      subject_id: 'valid-uuid',
      type: 'lecture' as const,
      day_of_week: 1,
      start_time: '09:00',
      end_time: '10:30',
      venue: 'Room A101',
      instructor: 'Dr. Smith',
      max_capacity: 0
    },
    shouldPass: false
  },
  {
    name: 'Invalid capacity (too high)',
    data: {
      subject_id: 'valid-uuid',
      type: 'lecture' as const,
      day_of_week: 1,
      start_time: '09:00',
      end_time: '10:30',
      venue: 'Room A101',
      instructor: 'Dr. Smith',
      max_capacity: 600
    },
    shouldPass: false
  }
];

// Export functions for use in other files or manual testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    runTests,
    testAutoEndTime,
    timeToMinutes,
    minutesToTime,
    validateDuration,
    formValidationTests
  };
}

// Auto-run tests if in browser
if (typeof window !== 'undefined') {
  console.log('ScheduleForm test utilities loaded. Available functions:');
  console.log('- runTests(): Run all utility tests');
  console.log('- testAutoEndTime(startTime, classType): Test auto end-time calculation');
  console.log('- Call runTests() now to see results...\n');
  
  // Run tests automatically
  runTests();
}
