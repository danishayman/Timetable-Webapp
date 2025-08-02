// Test script for Schedule API Routes
// Run this in the browser console or as a Node.js script

const API_BASE = 'http://localhost:3000/api/admin/schedules';

// Test data
const testSchedule = {
  subject_id: '550e8400-e29b-41d4-a716-446655440000', // Replace with actual subject ID
  type: 'lecture',
  day_of_week: 1, // Monday
  start_time: '09:00',
  end_time: '10:30',
  venue: 'Room A101',
  instructor: 'Dr. Test',
  max_capacity: 50
};

// Helper function to make API requests
async function apiRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    const data = await response.json();
    console.log(`${options.method || 'GET'} ${url}:`, {
      status: response.status,
      data: data
    });
    
    return { response, data };
  } catch (error) {
    console.error(`Error with ${options.method || 'GET'} ${url}:`, error);
    return { error };
  }
}

// Test functions
async function testGetAllSchedules() {
  console.log('\n=== Testing GET /api/admin/schedules ===');
  await apiRequest(API_BASE);
}

async function testGetSchedulesBySubject(subjectId) {
  console.log('\n=== Testing GET /api/admin/schedules?subject_id=... ===');
  await apiRequest(`${API_BASE}?subject_id=${subjectId}`);
}

async function testCreateSchedule() {
  console.log('\n=== Testing POST /api/admin/schedules ===');
  const { response, data } = await apiRequest(API_BASE, {
    method: 'POST',
    body: JSON.stringify(testSchedule)
  });
  
  if (response?.ok && data?.data?.id) {
    return data.data.id; // Return created schedule ID for further tests
  }
  return null;
}

async function testGetScheduleById(scheduleId) {
  console.log('\n=== Testing GET /api/admin/schedules/[id] ===');
  await apiRequest(`${API_BASE}/${scheduleId}`);
}

async function testUpdateSchedule(scheduleId) {
  console.log('\n=== Testing PUT /api/admin/schedules/[id] ===');
  const updateData = {
    venue: 'Room B202',
    max_capacity: 60
  };
  
  await apiRequest(`${API_BASE}/${scheduleId}`, {
    method: 'PUT',
    body: JSON.stringify(updateData)
  });
}

async function testDeleteSchedule(scheduleId) {
  console.log('\n=== Testing DELETE /api/admin/schedules/[id] ===');
  await apiRequest(`${API_BASE}/${scheduleId}`, {
    method: 'DELETE'
  });
}

// Run all tests
async function runAllTests() {
  console.log('Starting Schedule API Tests...');
  
  // Test GET all schedules
  await testGetAllSchedules();
  
  // Test GET schedules by subject (using first subject if available)
  await testGetSchedulesBySubject('test-subject-id');
  
  // Test CREATE schedule
  const createdScheduleId = await testCreateSchedule();
  
  if (createdScheduleId) {
    // Test GET schedule by ID
    await testGetScheduleById(createdScheduleId);
    
    // Test UPDATE schedule
    await testUpdateSchedule(createdScheduleId);
    
    // Test DELETE schedule
    await testDeleteSchedule(createdScheduleId);
  }
  
  console.log('\nSchedule API Tests completed!');
}

// Export for manual testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testGetAllSchedules,
    testGetSchedulesBySubject,
    testCreateSchedule,
    testGetScheduleById,
    testUpdateSchedule,
    testDeleteSchedule,
    runAllTests
  };
}

// Auto-run if in browser
if (typeof window !== 'undefined') {
  console.log('Schedule API test functions available:');
  console.log('- testGetAllSchedules()');
  console.log('- testCreateSchedule()');
  console.log('- runAllTests()');
}
