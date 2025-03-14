import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the .env file in the project root
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Log environment variables for debugging (without showing the actual password)
console.log('Environment variables loaded:');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASSWORD length:', process.env.EMAIL_PASSWORD ? process.env.EMAIL_PASSWORD.length : 0);
console.log('PORT:', process.env.PORT);

import { google } from 'googleapis';
import express from 'express';
import fs from 'fs';
import { DateTime } from 'luxon';
import cors from 'cors';
import NodeCache from 'node-cache';
import { sendBookingConfirmationEmail } from './services/emailService.js';
import { SERVICES } from './utilities/constants.js';

const calendar = google.calendar('v3');
const app = express();

// Create an in-memory cache for locking time slots
// TTL: 2 minutes (120 seconds) - locks expire after this time
const lockCache = new NodeCache({ stdTTL: 120 });

// Add caching for calendar events to reduce API calls
const eventCache = new NodeCache({ stdTTL: 300 }); // Cache events for 5 minutes

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'https://theborzz.netlify.app'], // Frontend URLs
}));
app.use(express.json()); // Required for parsing JSON requests

// Use the absolute path to the service account key file
const serviceAccount = JSON.parse(fs.readFileSync(path.join(__dirname, 'service-account-key.json'), 'utf8'));

const jwtClient = new google.auth.JWT(
  serviceAccount.client_email,
  null,
  serviceAccount.private_key,
  ['https://www.googleapis.com/auth/calendar.events']
);

// Map barber IDs to their corresponding calendar IDs
const barberCalendars = {
  'miro': 'annoyedpigeon25@gmail.com',
  'simo': 'georgiatanasov403@gmail.com',
  'rado': 'georgiatanasov403@gmail.com',
  // If no barber is specified, use the default calendar
};

// Helper function to get calendar ID based on barber ID
const getCalendarId = (barberId) => {
  return barberCalendars[barberId] || barberCalendars.default;
};

// Generate a unique lock key for a time slot
const generateLockKey = (barber, date, time) => {
  return `lock:${barber}:${date}:${time}`;
};

// Middleware to acquire a lock for a time slot
const acquireTimeslotLock = (req, res, next) => {
  const { barber, date, time } = req.body;
  
  if (!barber || !date || !time) {
    console.log('Missing required fields for lock acquisition');
    return next(); // Skip lock if required fields are missing
  }
  
  const lockKey = generateLockKey(barber, date, time);
  console.log(`Attempting to acquire lock for ${lockKey}`);
  
  // Check if lock exists
  if (lockCache.has(lockKey)) {
    console.log(`Lock exists for ${lockKey}, request denied`);
    return res.status(423).json({ 
      error: 'This time slot is currently being booked by another user. Please try again in a moment.' 
    });
  }
  
  // Set lock with 30 second TTL
  lockCache.set(lockKey, true, 30);
  console.log(`Lock acquired for ${lockKey}`);
  
  // Store the lock key in the request for later release
  req.lockKey = lockKey;
  
  next();
};

// Middleware to release a lock
const releaseTimeslotLock = (req, res, next) => {
  if (req.lockKey) {
    console.log(`Releasing lock ${req.lockKey} in middleware`);
    lockCache.del(req.lockKey);
    delete req.lockKey;
  }
  next();
};

// Optimize the isTimeSlotAvailable function with caching
const isTimeSlotAvailable = async (barber, date, time, duration) => {
  console.log(`Checking availability for ${barber} on ${date} at ${time} for ${duration} minutes`);
  
  try {
    const startDateTime = DateTime.fromISO(`${date}T${time}`, { zone: 'Europe/Sofia' });
    const endDateTime = startDateTime.plus({ minutes: duration });
    
    // Format for Google Calendar API
    const timeMin = startDateTime.toISO();
    const timeMax = endDateTime.toISO();
    
    // Create a cache key for this time range
    const cacheKey = `events_${barber}_${date}_${time}_${duration}`;
    
    // Check if we have cached events for this time range
    let events = eventCache.get(cacheKey);
    
    if (!events) {
      console.log(`Cache miss for ${cacheKey}, fetching from API`);
      
      try {
        await jwtClient.authorize().catch(err => {
          console.error('Error authorizing with Google:', err.message);
        });
        
        const calendarId = getCalendarId(barber);
        console.log(`Checking calendar ${calendarId} for events`);
        
        const response = await calendar.events.list({
          auth: jwtClient,
          calendarId: calendarId,
          timeMin: timeMin,
          timeMax: timeMax,
          singleEvents: true,
        });
        
        events = response.data.items || [];
        
        // Cache the events
        eventCache.set(cacheKey, events);
      } catch (error) {
        console.error('Error checking calendar availability:', error.message);
        // For testing purposes, assume the slot is available if we can't check
        console.log(`Assuming time slot is available due to calendar API error`);
        return { available: true, warning: 'Could not verify with calendar, proceeding anyway' };
      }
    } else {
      console.log(`Cache hit for ${cacheKey}, using cached events`);
    }
    
    console.log(`Found ${events.length} events in the time range`);
    
    if (events.length > 0) {
      console.log(`Time slot is not available due to conflicting events`);
      return { 
        available: false, 
        conflictingEvent: events[0] 
      };
    }
    
    console.log(`Time slot is available`);
    return { available: true };
  } catch (error) {
    console.error('Error in isTimeSlotAvailable:', error.message);
    throw new Error(`Failed to check time slot availability: ${error.message}`);
  }
};

// Queue for processing booking requests
const bookingQueue = [];
let isProcessingQueue = false;

// Function to process the booking queue
const processBookingQueue = async () => {
  if (isProcessingQueue || bookingQueue.length === 0) {
    return;
  }
  
  isProcessingQueue = true;
  
  try {
    const bookingRequest = bookingQueue.shift();
    const { req, res } = bookingRequest;
    
    // Process the actual booking
    await processBooking(req, res);
  } catch (error) {
    console.error('Error processing booking from queue:', error);
  } finally {
    isProcessingQueue = false;
    
    // Continue processing queue if there are more items
    if (bookingQueue.length > 0) {
      setImmediate(processBookingQueue);
    }
  }
};

// Optimize the processBooking function
const processBooking = async (req, res) => {
  const { 
    customerName, 
    customerEmail, 
    phoneNumber, 
    barber,
    barberName,
    service,
    date,
    time,
    duration
  } = req.body;
  
  // Store the lock key for later release
  const lockKey = req.lockKey;
  
  try {
    console.log(`Processing booking for ${customerName} on ${date} at ${time}`);
    
    // Final verification that the time slot is still available
    const availabilityCheck = await isTimeSlotAvailable(barber, date, time, duration);
    
    if (!availabilityCheck.available) {
      console.log(`Time slot not available for ${date} at ${time}`);
      // Release the lock before returning the error response
      if (lockKey) {
        console.log(`Releasing lock ${lockKey} due to unavailability`);
        lockCache.del(lockKey);
      }
      return res.status(409).json({ 
        error: 'This time slot is no longer available',
        conflictingEvent: availabilityCheck.conflictingEvent 
      });
    }
    
    // Time slot is available, proceed with booking
    let eventId = 'mock-event-id-' + Date.now(); // Default mock ID
    
    try {
      await jwtClient.authorize();
      
      const startDateTime = DateTime.fromISO(`${date}T${time}`, { zone: 'Europe/Sofia' }).toJSDate();
      const endDateTime = new Date(startDateTime.getTime() + duration * 60000);
      
      const event = {
        summary: `${service} - ${customerName}`,
        description: `Phone: ${phoneNumber}\nEmail: ${customerEmail}\nService: ${service}`,
        start: {
          dateTime: startDateTime.toISOString(),
          timeZone: 'Europe/Sofia', 
        },
        end: {
          dateTime: endDateTime.toISOString(),
          timeZone: 'Europe/Sofia', 
        },
      };
      
      const calendarId = getCalendarId(barber);
      
      console.log(`Creating calendar event for ${date} at ${time}`);
      const response = await calendar.events.insert({
        auth: jwtClient,
        calendarId: calendarId,
        resource: event,
      });
      
      eventId = response.data.id;
      console.log(`Calendar event created with ID: ${eventId}`);
      
      // Invalidate cache for this time range
      const cacheKey = `events_${barber}_${date}_${time}_${duration}`;
      eventCache.del(cacheKey);
    } catch (calendarError) {
      console.error('Error creating calendar event:', calendarError);
      // Release the lock before returning the error response
      if (lockKey) {
        console.log(`Releasing lock ${lockKey} due to calendar error`);
        lockCache.del(lockKey);
      }
      return res.status(500).json({ 
        error: 'Failed to create calendar event. Please try again.' 
      });
    }
    
    // Get service details for the email
    const serviceDetails = SERVICES.find(s => s.id === service);
    const price = serviceDetails ? serviceDetails.price : 'N/A';
    const serviceName = serviceDetails ? serviceDetails.name : service;
    
    // Send confirmation email asynchronously (don't wait for it)
    let emailPromise = null;
    try {
      console.log(`Sending confirmation email to ${customerEmail}`);
      emailPromise = sendBookingConfirmationEmail({
        customerName,
        customerEmail,
        barberName,
        serviceName,
        date,
        time,
        duration,
        price
      });
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Continue with the response even if email fails
    }
    
    // Release the lock before sending the success response
    if (lockKey) {
      console.log(`Releasing lock ${lockKey} after successful booking`);
      lockCache.del(lockKey);
    }
    
    console.log(`Booking completed successfully for ${customerName}`);
    
    // Send the success response immediately
    res.json({
      success: true,
      message: 'Appointment booked successfully',
      emailStatus: 'sending',
      appointmentId: eventId,
      appointmentDetails: {
        barber,
        barberName,
        service,
        serviceName,
        date,
        time,
        duration,
        price
      }
    });
    
    // Wait for the email to be sent (but don't block the response)
    if (emailPromise) {
      emailPromise.then(emailResult => {
        console.log(`Email sent: ${emailResult.success}`);
      }).catch(err => {
        console.error('Error sending email:', err);
      });
    }
  } catch (error) {
    console.error('Error booking appointment:', error.message);
    
    // Always release the lock when there's an error
    if (lockKey) {
      console.log(`Releasing lock ${lockKey} due to general error`);
      lockCache.del(lockKey);
    }
    
    res.status(500).json({ error: error.message || 'Failed to book appointment' });
  }
};

// Update the booking endpoint to ensure it properly handles locks
app.post('/api/booking', acquireTimeslotLock, async (req, res, next) => {
  console.log('Received booking request:', req.body);
  
  // Validate required fields
  const { barber, date, time, duration } = req.body;
  if (!barber || !date || !time || !duration) {
    console.log('Missing required booking information');
    // Release the lock before returning the error
    if (req.lockKey) {
      console.log(`Releasing lock ${req.lockKey} due to missing fields`);
      lockCache.del(req.lockKey);
    }
    return res.status(400).json({ error: 'Missing required booking information' });
  }
  
  // Process the booking
  await processBooking(req, res);
});

// Add a new endpoint to check availability before booking
app.post('/api/check-availability', async (req, res) => {
  const { barber, date, time, duration } = req.body;
  
  if (!barber || !date || !time || !duration) {
    return res.status(400).json({ error: 'Missing required information' });
  }
  
  try {
    const availabilityCheck = await isTimeSlotAvailable(barber, date, time, duration);
    res.json(availabilityCheck);
  } catch (error) {
    console.error('Error checking availability:', error);
    res.status(500).json({ error: 'Error checking availability' });
  }
});

// The existing endpoints remain largely unchanged
app.get('/api/get-events', async (req, res) => {
  const { date, barber } = req.query;
  const startOfDay = DateTime.fromISO(`${date}T00:00:00`, { zone: 'Europe/Sofia' }).toJSDate();
  const endOfDay = DateTime.fromISO(`${date}T23:59:59`, { zone: 'Europe/Sofia' }).toJSDate();

  try {
    await jwtClient.authorize();
    const calendarId = getCalendarId(barber);

    const response = await calendar.events.list({
      auth: jwtClient,
      calendarId: calendarId,
      timeMin: startOfDay.toISOString(),
      timeMax: endOfDay.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = response.data.items.map((event) => ({
      id: event.id,
      summary: event.summary,
      start: event.start.dateTime,
      end: event.end.dateTime
    }));

    res.json({ events });
  } catch (error) {
    console.error('Error fetching events from Google Calendar', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

app.get('/api/get-month-events', async (req, res) => {
  const { startDate, endDate, barber } = req.query;
  
  if (!startDate || !endDate) {
    return res.status(400).json({ error: 'Both startDate and endDate are required' });
  }
  
  try {
    const timeMin = DateTime.fromISO(`${startDate}T00:00:00`, { zone: 'Europe/Sofia' }).toJSDate();
    const timeMax = DateTime.fromISO(`${endDate}T23:59:59`, { zone: 'Europe/Sofia' }).toJSDate();
    
    await jwtClient.authorize();
    const calendarId = getCalendarId(barber);
    
    const response = await calendar.events.list({
      auth: jwtClient,
      calendarId: calendarId,
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
      maxResults: 2500
    });
    
    const events = response.data.items.map((event) => ({
      id: event.id,
      summary: event.summary,
      start: event.start.dateTime,
      end: event.end.dateTime
    }));
    
    console.log(`Fetched ${events.length} events for barber ${barber} for period ${startDate} to ${endDate}`);
    
    res.json({ events });
  } catch (error) {
    console.error('Error fetching month events from Google Calendar', error);
    res.status(500).json({ error: 'Failed to fetch month events', details: error.message });
  }
});

// Add a health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(process.env.PORT, () => {
  console.log("Booking server listening on port", process.env.PORT);
});