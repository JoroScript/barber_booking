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

app.use(cors({
  origin: ['http://localhost:5173','http://localhost:5174'], // Add your frontend URL here
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
  'default': 'annoyedpigeon25@gmail.com'
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
    return next(); // Skip lock if required fields are missing
  }
  
  const lockKey = generateLockKey(barber, date, time);
  
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
    lockCache.del(req.lockKey);
  }
  next();
};

// Helper function to check if a timeslot is available
const isTimeSlotAvailable = async (barber, date, time, duration) => {
  await jwtClient.authorize();
  
  const calendarId = getCalendarId(barber);
  
  // Calculate the start and end time of the proposed appointment
  const startDateTime = DateTime.fromISO(`${date}T${time}`, { zone: 'Europe/Sofia' });
  const endDateTime = startDateTime.plus({ minutes: duration });
  
  // We need to check the entire day to find overlapping appointments
  const startOfDay = startDateTime.startOf('day').toJSDate();
  const endOfDay = startDateTime.endOf('day').toJSDate();
  
  // Get all events for that day
  const response = await calendar.events.list({
    auth: jwtClient,
    calendarId: calendarId,
    timeMin: startOfDay.toISOString(),
    timeMax: endOfDay.toISOString(),
    singleEvents: true,
    orderBy: 'startTime',
  });
  
  // Check if any existing event overlaps with the proposed time slot
  for (const event of response.data.items) {
    const eventStart = DateTime.fromISO(event.start.dateTime);
    const eventEnd = DateTime.fromISO(event.end.dateTime);
    
    // Check for overlap
    if (
      (startDateTime < eventEnd && endDateTime > eventStart) ||
      (startDateTime.equals(eventStart) && endDateTime.equals(eventEnd))
    ) {
      return { available: false, conflictingEvent: event.summary };
    }
  }
  
  return { available: true };
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

// Process a booking request
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
  
  try {
    // Final verification that the time slot is still available
    const availabilityCheck = await isTimeSlotAvailable(barber, date, time, duration);
    
    if (!availabilityCheck.available) {
      // Release the lock before returning the error response
      if (req.lockKey) {
        lockCache.del(req.lockKey);
      }
      return res.status(409).json({ 
        error: 'This time slot is no longer available',
        conflictingEvent: availabilityCheck.conflictingEvent 
      });
    }
    
    // Time slot is available, proceed with booking
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
    
    const response = await calendar.events.insert({
      auth: jwtClient,
      calendarId: calendarId,
      resource: event,
    });
    
    // Get service details for the email
    const serviceDetails = SERVICES.find(s => s.id === service);
    const price = serviceDetails ? serviceDetails.price : 'N/A';
    const serviceName = serviceDetails ? serviceDetails.name : service;
    
    // Send confirmation email
    try {
      await sendBookingConfirmationEmail({
        customerName,
        customerEmail,
        barberName,
        serviceName,
        date,
        time,
        duration,
        price
      });
      console.log('Confirmation email sent to', customerEmail);
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Continue with the response even if email fails
    }
    
    // Release the lock before sending the success response
    if (req.lockKey) {
      lockCache.del(req.lockKey);
    }
    
    res.json({
      success: true,
      message: 'Appointment booked successfully',
      appointmentId: response.data.id,
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
  } catch (error) {
    console.error('Error booking appointment:', error.response ? error.response.data : error.message);
    
    // Always release the lock when there's an error
    if (req.lockKey) {
      lockCache.del(req.lockKey);
    }
    
    res.status(500).json({ error: error.message || 'Failed to book appointment' });
  }
};

// Enhanced booking endpoint with concurrency control
app.post('/api/booking', acquireTimeslotLock, async (req, res, next) => {
  console.log('Received booking request:', req.body);
  
  // Validate required fields
  const { barber, date, time, duration } = req.body;
  if (!barber || !date || !time || !duration) {
    releaseTimeslotLock(req, res, () => {
      res.status(400).json({ error: 'Missing required booking information' });
    });
    return;
  }
  
  try {
    // Verify time slot availability
    const availabilityCheck = await isTimeSlotAvailable(barber, date, time, duration);
    
    if (!availabilityCheck.available) {
      return res.status(409).json({ 
        error: 'This time slot is already booked',
        conflictingEvent: availabilityCheck.conflictingEvent
      });
    }
    
    // Add to processing queue
    bookingQueue.push({ req, res });
    
    // Start processing if not already in progress
    if (!isProcessingQueue) {
      processBookingQueue();
    }
  } catch (error) {
    console.error('Error checking availability:', error);
    releaseTimeslotLock(req, res, () => {
      res.status(500).json({ error: 'Error processing booking request' });
    });
  }
}, releaseTimeslotLock);

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

app.listen(process.env.PORT, () => {
  console.log("Booking server listening on port", process.env.PORT);
});