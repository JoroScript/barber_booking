import axios from 'axios';
import { DateTime } from 'luxon';

// Get the API URL from environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005';

// Configure axios with a timeout and cache
const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 5000,
  headers: { "Cache-Control": "max-age=300" }, // 5 minute cache
});

export const fetchDayEvents = async (date, barber) => {
  const formattedDate = DateTime.fromJSDate(date)
    .setZone("Europe/Sofia")
    .toFormat("yyyy-MM-dd");

  const response = await api.get("/get-events", {
    params: { date: formattedDate, barber },
  });
  return response.data.events;
};

export const fetchMonthEvents = async (startDate, endDate, barber) => {
  const response = await api.get("/get-month-events", {
    params: {
      startDate: startDate.toFormat("yyyy-MM-dd"),
      endDate: endDate.toFormat("yyyy-MM-dd"),
      barber,
    },
  });
  return response.data.events;
};

export const checkTimeSlotAvailability = async (barber, date, time, duration) => {
  try {
    const formattedDate = DateTime.fromJSDate(date)
      .setZone("Europe/Sofia")
      .toFormat("yyyy-MM-dd");
    const formattedTime = DateTime.fromJSDate(date)
      .setZone("Europe/Sofia")
      .set({ hour: time, minute: 0 })
      .toFormat("HH:mm:ss");

    const response = await api.post("/check-availability", {
      barber,
      date: formattedDate,
      time: formattedTime,
      duration,
    });
    return response.data;
  } catch (error) {
    return {
      available: false,
      error: error.response?.data?.error || "Failed to check availability",
    };
  }
};

export const createBooking = async (bookingData) => {
  const response = await api.post("/booking", bookingData);
  return response.data;
}; 