import fetch from 'node-fetch';
import { performance } from 'perf_hooks';

// Configuration
const API_URL = 'http://localhost:5005/api';
const NUM_REQUESTS = 10; // Number of booking requests to make
const CONCURRENT_REQUESTS = 3; // Number of concurrent requests

// Generate test data
const generateTestData = (index) => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  
  // Format date as YYYY-MM-DD
  const date = tomorrow.toISOString().split('T')[0];
  
  // Generate a time between 9:00 and 16:00
  const hour = 9 + (index % 8);
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
    
    return {
      index,
      success: false,
      error: error.message,
      responseTime
    };
  }
};

// Function to run tests in batches
const runTests = async () => {
  console.log(`Starting performance test with ${NUM_REQUESTS} requests (${CONCURRENT_REQUESTS} concurrent)`);
  console.log('---------------------------------------------------');
  
  const results = [];
  const startTime = performance.now();
  
  // Process requests in batches
  for (let i = 0; i < NUM_REQUESTS; i += CONCURRENT_REQUESTS) {
    const batch = [];
    
    // Create a batch of concurrent requests
    for (let j = 0; j < CONCURRENT_REQUESTS && i + j < NUM_REQUESTS; j++) {
      const index = i + j;
      const data = generateTestData(index);
      batch.push(makeBookingRequest(data, index));
    }
    
    // Wait for all requests in the batch to complete
    const batchResults = await Promise.all(batch);
    results.push(...batchResults);
    
    // Add a small delay between batches to avoid overwhelming the server
    if (i + CONCURRENT_REQUESTS < NUM_REQUESTS) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
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
  console.log('Performance Test Results:');
  console.log('---------------------------------------------------');
  console.log(`Total Requests: ${NUM_REQUESTS}`);
  console.log(`Successful Requests: ${successfulRequests}`);
  console.log(`Failed Requests: ${failedRequests}`);
  console.log(`Total Time: ${totalTime.toFixed(2)}ms`);
  console.log(`Average Response Time: ${avgResponseTime.toFixed(2)}ms`);
  console.log(`Minimum Response Time: ${minResponseTime.toFixed(2)}ms`);
  console.log(`Maximum Response Time: ${maxResponseTime.toFixed(2)}ms`);
  console.log('---------------------------------------------------');
  
  // Print detailed results for failed requests
  const failedResults = results.filter(r => !r.success);
  if (failedResults.length > 0) {
    console.log('\nFailed Requests:');
    failedResults.forEach(result => {
      console.log(`Request ${result.index}:`);
      console.log(`  Response Time: ${result.responseTime.toFixed(2)}ms`);
      console.log(`  Status: ${result.status || 'N/A'}`);
      console.log(`  Error: ${result.error || JSON.stringify(result.data)}`);
      console.log('---');
    });
  }
};

// Run the tests
runTests().catch(error => {
  console.error('Error running tests:', error);
}); 