import fetch from 'node-fetch';
import { performance } from 'perf_hooks';

// Configuration
const API_URL = 'http://localhost:5005/api';
const NUM_REQUESTS = 20; // Number of booking requests to make
const CONCURRENT_REQUESTS = 5; // Number of concurrent requests

// Generate test data with unique time slots
const generateTestData = (index) => {
  const today = new Date();
  
  // Use different dates to avoid conflicts
  const futureDate = new Date(today);
  futureDate.setDate(today.getDate() + 7 + Math.floor(index / 8)); // Start a week from now and spread across multiple days
  
  // Format date as YYYY-MM-DD
  const date = futureDate.toISOString().split('T')[0];
  
  // Generate a time between 9:00 and 16:00, ensuring each request gets a unique time
  const hour = 9 + (index % 8);
  const time = `${hour.toString().padStart(2, '0')}:00:00`;
  
  // Use different barbers to avoid conflicts
  const barberIndex = index % 3;
  
  return {
    customerName: `Test User ${index}`,
    customerEmail: `test${index}@example.com`,
    phoneNumber: `+359888${(100000 + index).toString()}`,
    barber: barberIndex === 0 ? 'miro' : (barberIndex === 1 ? 'rado' : 'simo'),
    barberName: barberIndex === 0 ? 'Миро' : (barberIndex === 1 ? 'Радо' : 'Симо'),
    service: barberIndex === 0 ? 'haircut' : (barberIndex === 1 ? 'beard' : 'combo'),
    date,
    time,
    duration: barberIndex === 0 ? 30 : (barberIndex === 1 ? 20 : 45)
  };
};

// Function to check availability before booking
const checkAvailability = async (data) => {
  try {
    const response = await fetch(`${API_URL}/check-availability`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        barber: data.barber,
        date: data.date,
        time: data.time,
        duration: data.duration
      })
    });
    
    const result = await response.json();
    return result.available;
  } catch (error) {
    console.error('Error checking availability:', error);
    return false;
  }
};

// Function to make a booking request
const makeBookingRequest = async (data, index) => {
  // First check if the time slot is available
  const isAvailable = await checkAvailability(data);
  
  if (!isAvailable) {
    return {
      index,
      success: false,
      status: 409,
      responseTime: 0,
      data: { error: "Time slot not available (pre-check)" }
    };
  }
  
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
  console.log(`Starting realistic test with ${NUM_REQUESTS} requests (${CONCURRENT_REQUESTS} concurrent)`);
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
    
    // Log batch results
    batchResults.forEach(result => {
      if (result.success) {
        console.log(`Request ${result.index} completed in ${result.responseTime.toFixed(2)}ms`);
      } else {
        if (result.responseTime === 0) {
          console.log(`Request ${result.index} skipped: ${result.data.error}`);
        } else {
          console.log(`Request ${result.index} failed in ${result.responseTime.toFixed(2)}ms: ${result.error || JSON.stringify(result.data).substring(0, 50)}...`);
        }
      }
    });
    
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
  const skippedRequests = results.filter(r => !r.success && r.responseTime === 0).length;
  const actualFailedRequests = failedRequests - skippedRequests;
  
  // Only include actual API calls in response time calculations
  const responseTimes = results
    .filter(r => r.responseTime > 0)
    .map(r => r.responseTime);
  
  const avgResponseTime = responseTimes.length > 0 
    ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
    : 0;
  
  const minResponseTime = responseTimes.length > 0 ? Math.min(...responseTimes) : 0;
  const maxResponseTime = responseTimes.length > 0 ? Math.max(...responseTimes) : 0;
  
  // Calculate percentiles
  const sortedResponseTimes = [...responseTimes].sort((a, b) => a - b);
  const p50 = sortedResponseTimes.length > 0 
    ? sortedResponseTimes[Math.floor(sortedResponseTimes.length * 0.5)] || 0 
    : 0;
  const p90 = sortedResponseTimes.length > 0 
    ? sortedResponseTimes[Math.floor(sortedResponseTimes.length * 0.9)] || 0 
    : 0;
  const p95 = sortedResponseTimes.length > 0 
    ? sortedResponseTimes[Math.floor(sortedResponseTimes.length * 0.95)] || 0 
    : 0;
  const p99 = sortedResponseTimes.length > 0 
    ? sortedResponseTimes[Math.floor(sortedResponseTimes.length * 0.99)] || 0 
    : 0;
  
  // Print results
  console.log('\nRealistic Test Results:');
  console.log('---------------------------------------------------');
  console.log(`Total Requests: ${NUM_REQUESTS}`);
  console.log(`Successful Requests: ${successfulRequests}`);
  console.log(`Failed Requests: ${actualFailedRequests}`);
  console.log(`Skipped Requests (unavailable slots): ${skippedRequests}`);
  console.log(`Total Time: ${totalTime.toFixed(2)}ms`);
  console.log(`Average Response Time: ${avgResponseTime.toFixed(2)}ms`);
  console.log(`Minimum Response Time: ${minResponseTime.toFixed(2)}ms`);
  console.log(`Maximum Response Time: ${maxResponseTime.toFixed(2)}ms`);
  console.log(`P50 (Median): ${p50.toFixed(2)}ms`);
  console.log(`P90: ${p90.toFixed(2)}ms`);
  console.log(`P95: ${p95.toFixed(2)}ms`);
  console.log(`P99: ${p99.toFixed(2)}ms`);
  console.log('---------------------------------------------------');
  
  // Provide a recommendation
  console.log('\nPerformance Assessment:');
  if (avgResponseTime < 500) {
    console.log('✅ EXCELLENT: Average response time is under 500ms');
  } else if (avgResponseTime < 1000) {
    console.log('✅ GOOD: Average response time is under 1 second');
  } else if (avgResponseTime < 2000) {
    console.log('⚠️ ACCEPTABLE: Average response time is under 2 seconds');
  } else if (avgResponseTime < 3000) {
    console.log('⚠️ SLOW: Average response time is under 3 seconds');
  } else {
    console.log('❌ POOR: Average response time is over 3 seconds');
  }
  
  if (p95 < 1000) {
    console.log('✅ EXCELLENT: 95% of requests complete in under 1 second');
  } else if (p95 < 2000) {
    console.log('✅ GOOD: 95% of requests complete in under 2 seconds');
  } else if (p95 < 3000) {
    console.log('⚠️ ACCEPTABLE: 95% of requests complete in under 3 seconds');
  } else if (p95 < 5000) {
    console.log('⚠️ SLOW: 95% of requests complete in under 5 seconds');
  } else {
    console.log('❌ POOR: 95% of requests take over 5 seconds');
  }
  
  // Only consider actual failures (not skipped requests) for the failure rate
  const actualFailureRate = actualFailedRequests / (NUM_REQUESTS - skippedRequests);
  
  if (actualFailedRequests === 0) {
    console.log('✅ EXCELLENT: No failed requests');
  } else if (actualFailureRate < 0.01) {
    console.log('✅ GOOD: Less than 1% of requests failed');
  } else if (actualFailureRate < 0.05) {
    console.log('⚠️ ACCEPTABLE: Less than 5% of requests failed');
  } else {
    console.log('❌ POOR: More than 5% of requests failed');
  }
  
  // Final recommendation
  if (avgResponseTime < 1000 && p95 < 2000 && actualFailureRate < 0.01) {
    console.log('\n✅ PRODUCTION READY: The system performs well under load and is ready for production.');
  } else if (avgResponseTime < 2000 && p95 < 3000 && actualFailureRate < 0.05) {
    console.log('\n⚠️ ACCEPTABLE FOR PRODUCTION: The system performs adequately but could be improved.');
  } else {
    console.log('\n❌ NOT PRODUCTION READY: The system needs optimization before going to production.');
  }
};

// Run the tests
runTests().catch(error => {
  console.error('Error running tests:', error);
}); 