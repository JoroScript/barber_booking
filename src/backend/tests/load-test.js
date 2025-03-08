import fetch from 'node-fetch';
import { performance } from 'perf_hooks';

// Configuration
const API_URL = 'http://localhost:5005/api';
const TEST_DURATION_MS = 60000; // 1 minute test
const USERS_PER_MINUTE = 30; // Simulate 30 users per minute (0.5 users per second)
const THINK_TIME_MS = 2000; // Simulate user thinking time between actions

// Track metrics
const metrics = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  responseTimes: [],
  errors: []
};

// Generate random user data
const generateUserData = () => {
  const id = Math.floor(Math.random() * 10000);
  return {
    name: `Test User ${id}`,
    email: `test${id}@example.com`,
    phone: `+359888${(100000 + id).toString()}`
  };
};

// Generate random date in the next 7 days
const generateRandomDate = () => {
  const today = new Date();
  const futureDate = new Date(today);
  futureDate.setDate(today.getDate() + Math.floor(Math.random() * 7) + 1);
  return futureDate.toISOString().split('T')[0];
};

// Generate random time between 9:00 and 17:00
const generateRandomTime = () => {
  const hour = 9 + Math.floor(Math.random() * 8);
  return `${hour.toString().padStart(2, '0')}:00:00`;
};

// Random selection from array
const randomSelect = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};

// Simulate a user session
const simulateUserSession = async () => {
  const sessionStartTime = performance.now();
  const userData = generateUserData();
  
  try {
    // Step 1: Select a barber
    const barbers = [
      { id: 'miro', name: 'Миро' },
      { id: 'rado', name: 'Радо' },
      { id: 'simo', name: 'Симо' }
    ];
    const selectedBarber = randomSelect(barbers);
    
    await simulateThinkTime();
    
    // Step 2: Select a service
    const services = [
      { id: 'haircut', name: 'Коса', duration: 30, price: 25 },
      { id: 'beard', name: 'Брада', duration: 20, price: 15 },
      { id: 'combo', name: 'Коса / Брада Kомбо', duration: 45, price: 35 }
    ];
    const selectedService = randomSelect(services);
    
    await simulateThinkTime();
    
    // Step 3: Select a date
    const selectedDate = generateRandomDate();
    
    await simulateThinkTime();
    
    // Step 4: Select a time
    const selectedTime = generateRandomTime();
    
    await simulateThinkTime();
    
    // Step 5: Submit booking
    const bookingData = {
      customerName: userData.name,
      customerEmail: userData.email,
      phoneNumber: userData.phone,
      barber: selectedBarber.id,
      barberName: selectedBarber.name,
      service: selectedService.id,
      serviceName: selectedService.name,
      date: selectedDate,
      time: selectedTime,
      duration: selectedService.duration,
      price: selectedService.price
    };
    
    const startTime = performance.now();
    
    const response = await fetch(`${API_URL}/booking`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bookingData)
    });
    
    const endTime = performance.now();
    const responseTime = endTime - startTime;
    
    metrics.totalRequests++;
    metrics.responseTimes.push(responseTime);
    
    if (response.ok) {
      metrics.successfulRequests++;
    } else {
      metrics.failedRequests++;
      const errorData = await response.json();
      metrics.errors.push({
        status: response.status,
        message: errorData.error || 'Unknown error',
        data: bookingData
      });
    }
    
    const sessionEndTime = performance.now();
    console.log(`User session completed in ${(sessionEndTime - sessionStartTime).toFixed(2)}ms`);
    
  } catch (error) {
    metrics.totalRequests++;
    metrics.failedRequests++;
    metrics.errors.push({
      message: error.message,
      stack: error.stack
    });
    console.error('Error in user session:', error.message);
  }
};

// Simulate user think time
const simulateThinkTime = async () => {
  const thinkTime = THINK_TIME_MS + Math.random() * 1000; // Add some randomness
  await new Promise(resolve => setTimeout(resolve, thinkTime));
};

// Run the load test
const runLoadTest = async () => {
  console.log(`Starting load test with ${USERS_PER_MINUTE} users per minute for ${TEST_DURATION_MS / 1000} seconds`);
  console.log('---------------------------------------------------');
  
  const startTime = performance.now();
  const endTime = startTime + TEST_DURATION_MS;
  
  // Calculate delay between user sessions
  const delayBetweenUsers = 60000 / USERS_PER_MINUTE;
  
  // Start user sessions at regular intervals
  let nextUserTime = startTime;
  
  while (performance.now() < endTime) {
    if (performance.now() >= nextUserTime) {
      simulateUserSession();
      nextUserTime += delayBetweenUsers;
    }
    
    // Small delay to prevent CPU hogging
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Wait for any remaining sessions to complete
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Calculate and print results
  const testDuration = performance.now() - startTime;
  const avgResponseTime = metrics.responseTimes.length > 0 
    ? metrics.responseTimes.reduce((sum, time) => sum + time, 0) / metrics.responseTimes.length 
    : 0;
  const minResponseTime = metrics.responseTimes.length > 0 ? Math.min(...metrics.responseTimes) : 0;
  const maxResponseTime = metrics.responseTimes.length > 0 ? Math.max(...metrics.responseTimes) : 0;
  
  // Calculate percentiles
  const sortedResponseTimes = [...metrics.responseTimes].sort((a, b) => a - b);
  const p50 = sortedResponseTimes[Math.floor(sortedResponseTimes.length * 0.5)] || 0;
  const p90 = sortedResponseTimes[Math.floor(sortedResponseTimes.length * 0.9)] || 0;
  const p95 = sortedResponseTimes[Math.floor(sortedResponseTimes.length * 0.95)] || 0;
  const p99 = sortedResponseTimes[Math.floor(sortedResponseTimes.length * 0.99)] || 0;
  
  console.log('\nLoad Test Results:');
  console.log('---------------------------------------------------');
  console.log(`Test Duration: ${(testDuration / 1000).toFixed(2)} seconds`);
  console.log(`Total Requests: ${metrics.totalRequests}`);
  console.log(`Successful Requests: ${metrics.successfulRequests}`);
  console.log(`Failed Requests: ${metrics.failedRequests}`);
  console.log(`Success Rate: ${((metrics.successfulRequests / metrics.totalRequests) * 100).toFixed(2)}%`);
  console.log(`Requests Per Second: ${(metrics.totalRequests / (testDuration / 1000)).toFixed(2)}`);
  console.log('\nResponse Time Statistics:');
  console.log(`Average: ${avgResponseTime.toFixed(2)}ms`);
  console.log(`Minimum: ${minResponseTime.toFixed(2)}ms`);
  console.log(`Maximum: ${maxResponseTime.toFixed(2)}ms`);
  console.log(`P50 (Median): ${p50.toFixed(2)}ms`);
  console.log(`P90: ${p90.toFixed(2)}ms`);
  console.log(`P95: ${p95.toFixed(2)}ms`);
  console.log(`P99: ${p99.toFixed(2)}ms`);
  
  if (metrics.errors.length > 0) {
    console.log('\nErrors:');
    metrics.errors.slice(0, 10).forEach((error, index) => {
      console.log(`Error ${index + 1}:`);
      console.log(`  Status: ${error.status || 'N/A'}`);
      console.log(`  Message: ${error.message}`);
      if (error.data) {
        console.log(`  Data: ${JSON.stringify(error.data).substring(0, 100)}...`);
      }
    });
    
    if (metrics.errors.length > 10) {
      console.log(`... and ${metrics.errors.length - 10} more errors`);
    }
  }
  
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
  
  if (metrics.failedRequests === 0) {
    console.log('✅ EXCELLENT: No failed requests');
  } else if ((metrics.failedRequests / metrics.totalRequests) < 0.01) {
    console.log('✅ GOOD: Less than 1% of requests failed');
  } else if ((metrics.failedRequests / metrics.totalRequests) < 0.05) {
    console.log('⚠️ ACCEPTABLE: Less than 5% of requests failed');
  } else {
    console.log('❌ POOR: More than 5% of requests failed');
  }
  
  // Final recommendation
  if (avgResponseTime < 1000 && p95 < 2000 && (metrics.failedRequests / metrics.totalRequests) < 0.01) {
    console.log('\n✅ PRODUCTION READY: The system performs well under load and is ready for production.');
  } else if (avgResponseTime < 2000 && p95 < 3000 && (metrics.failedRequests / metrics.totalRequests) < 0.05) {
    console.log('\n⚠️ ACCEPTABLE FOR PRODUCTION: The system performs adequately but could be improved.');
  } else {
    console.log('\n❌ NOT PRODUCTION READY: The system needs optimization before going to production.');
  }
};

// Run the load test
runLoadTest().catch(error => {
  console.error('Error running load test:', error);
}); 