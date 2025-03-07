import { google } from 'googleapis';
import express from 'express';
import fs from 'fs';
import { DateTime } from 'luxon';
import cors from 'cors';
const calendar = google.calendar('v3');
const app = express();
app.use(cors({
  origin: ['http://localhost:5173'], // Add your frontend URL here
}))
app.use(express.json()); // Required for parsing JSON requests

// Load the service account key JSON file
const serviceAccount = JSON.parse(fs.readFileSync('./service-account-key.json', 'utf8'));

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

app.post('/api/booking', async (req, res) => {
  console.log('Received request:', req.body); // Debugging log
  const { 
    customerName, 
    customerEmail, 
    phoneNumber, 
    barber,
    barberName,
    service,
    date,
    time,
    duration = 30 // default duration in minutes
  } = req.body;
  
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
    
    const response = await calendar.events.insert({
      auth: jwtClient,
      calendarId: calendarId,
      resource: event,
    });
    
    res.json({
      success: true,
      message: 'Appointment booked successfully',
      appointmentId: response.data.id,
      appointmentDetails: {
        barber,
        barberName,
        service,
        date,
        time,
        duration
      }
    });
    
  } catch (error) {
    console.error('Error booking appointment:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: error.message || 'Failed to book appointment' });
  }
});

app.get('/api/get-events', async (req, res) => {
  const { date, barber } = req.query;
  const startOfDay = DateTime.fromISO(`${date}T00:00:00`, { zone: 'Europe/Sofia' }).toJSDate();
  const endOfDay = DateTime.fromISO(`${date}T23:59:59`, { zone: 'Europe/Sofia' }).toJSDate();

  try {
    // Authorize the client (assuming jwtClient is already set up)
    await jwtClient.authorize();

    const calendarId = getCalendarId(barber);

    // Get the events for the day from Google Calendar
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
    }));

    res.json({ events });
  } catch (error) {
    console.error('Error fetching events from Google Calendar', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Updated route to get all events for a month with barber parameter
app.get('/api/get-month-events', async (req, res) => {
  const { startDate, endDate, barber } = req.query;
  
  if (!startDate || !endDate) {
    return res.status(400).json({ error: 'Both startDate and endDate are required' });
  }
  
  try {
    // Convert the dates to the correct format with timezone
    const timeMin = DateTime.fromISO(`${startDate}T00:00:00`, { zone: 'Europe/Sofia' }).toJSDate();
    const timeMax = DateTime.fromISO(`${endDate}T23:59:59`, { zone: 'Europe/Sofia' }).toJSDate();
    
    // Authorize the client
    await jwtClient.authorize();
    
    const calendarId = getCalendarId(barber);
    
    // Get events for the entire month with a single API call
    const response = await calendar.events.list({
      auth: jwtClient,
      calendarId: calendarId,
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
      maxResults: 2500 // Increase if you have more events in a month
    });
    
    const events = response.data.items.map((event) => ({
      id: event.id,
      summary: event.summary,
      start: event.start.dateTime,
    }));
    
    // Add some debugging info
    console.log(`Fetched ${events.length} events for barber ${barber} for period ${startDate} to ${endDate}`);
    
    res.json({ events });
  } catch (error) {
    console.error('Error fetching month events from Google Calendar', error);
    res.status(500).json({ error: 'Failed to fetch month events', details: error.message });
  }
});

app.listen(5005, () => {
  console.log("listening on port 5005");
});