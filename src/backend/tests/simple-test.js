import fetch from 'node-fetch';
import { performance } from 'perf_hooks';

// Configuration
const API_URL = 'http://localhost:5005/api';
const NUM_REQUESTS = 5; // Number of booking requests to make

// Generate test data
const generateTestData = (index) => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  
  // Format date as YYYY-MM-DD
  const date = tomorrow.toISOString().split('T')[0];
  
  // Generate a time between 9:00 and 16:00
  const hour = 9 + index;
  const time = `${hour.toString().padStart(2, '0')}:00:00`;
  
  return {
    customerName: `Test User ${index}`,
    customerEmail: `test${index}@example.com`,
    phoneNumber: `+359888${(100000 + index).toString()}`,
    barber: index % 3 === 0 ? 'miro' : (index % 3 === 1 ? 'rado' : 'simo'),
    barberName: index % 3 === 0 ? 'Миро' : (index % 3 === 1 ? 'Радо' : 'Симо'),
    service: index % 3 === 0 ? 'haircut' : (index % 3 === 1 ? 'beard' : 'combo'),
    date,
    time,
    duration: index % 3 === 0 ? 30 : (index % 3 === 1 ? 20 : 45)
  };
};

// Function to make a booking request
const makeBookingRequest = async (data, index) => {
  const startTime = performance.now();
  
  try {
    console.log(`Making request ${index}...`);
    const response = await fetch(`${API_URL}/booking`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    const endTime = performance.now();
    const responseTime = endTime - startTime;
    
    const responseData = await response.json();
    
    console.log(`Request ${index} completed in ${responseTime.toFixed(2)}ms`);
    console.log(`Status: ${response.status}`);
    console.log(`Response: ${JSON.stringify(responseData).substring(0, 100)}...`);
    console.log('---');
    
    return {
      index,
      success: response.ok,
      status: response.status,
      responseTime,
      data: responseData
    };
  } catch (error) {
    const endTime = performance.now();
    const responseTime = endTime - startTime;
    
    console.log(`Request ${index} failed in ${responseTime.toFixed(2)}ms`);
    console.log(`Error: ${error.message}`);
    console.log('---');
    
    return {
      index,
      success: false,
      error: error.message,
      responseTime
    };
  }
};

// Function to run tests sequentially
const runTests = async () => {
  console.log(`Starting simple test with ${NUM_REQUESTS} sequential requests`);
  console.log('---------------------------------------------------');
  
  const results = [];
  const startTime = performance.now();
  
  // Process requests sequentially
  for (let i = 0; i < NUM_REQUESTS; i++) {
    const data = generateTestData(i);
    const result = await makeBookingRequest(data, i);
    results.push(result);
    
    // Add a small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  const endTime = performance.now();
  const totalTime = endTime - startTime;
  
  // Calculate statistics
  const successfulRequests = results.filter(r => r.success).length;
  const failedRequests = results.filter(r => !r.success).length;
  const responseTimes = results.map(r => r.responseTime);
  const avgResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
  const minResponseTime = Math.min(...responseTimes);
  const maxResponseTime = Math.max(...responseTimes);
  
  // Print results
  console.log('Test Results:');
  console.log('---------------------------------------------------');
  console.log(`Total Requests: ${NUM_REQUESTS}`);
  console.log(`Successful Requests: ${successfulRequests}`);
  console.log(`Failed Requests: ${failedRequests}`);
  console.log(`Total Time: ${totalTime.toFixed(2)}ms`);
  console.log(`Average Response Time: ${avgResponseTime.toFixed(2)}ms`);
  console.log(`Minimum Response Time: ${minResponseTime.toFixed(2)}ms`);
  console.log(`Maximum Response Time: ${maxResponseTime.toFixed(2)}ms`);
  console.log('---------------------------------------------------');
};

// Run the tests
runTests().catch(error => {
  console.error('Error running tests:', error);
}); 