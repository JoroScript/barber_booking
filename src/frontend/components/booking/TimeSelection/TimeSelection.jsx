import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useBooking } from '../../../contexts/BookingContext';
import { BUSINESS_HOURS, SERVICES } from '../../../utilities/constants';
import { fetchDayEvents } from '../../../utilities/bookingApi';
import { DateTime } from 'luxon';
import './TimeSelection.css';

const TimeSelection = () => {
  const {
    date,
    time,
    setTime,
    selectedBarber,
    selectedService,
    setCurrentStep,
  } = useBooking();

  const [bookedTimes, setBookedTimes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Debug: Log the current time value
  useEffect(() => {
    console.log("TimeSelection - Current time value:", time);
  }, [time]);

  // Generate time slots immediately (9:00 to 18:00, hourly)
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = 9; hour <= 17; hour++) {
      const timeString = `${hour.toString().padStart(2, '0')}:00`;
      slots.push(timeString);
    }
    return slots;
  }, []);

  useEffect(() => {
    if (!date || !selectedBarber || !selectedService) return;

    setIsLoading(true);
    
    const loadAppointments = async () => {
      try {
        const events = await fetchDayEvents(date, selectedBarber);
        
        // Extract booked times from events
        const booked = events.map(event => {
          const start = DateTime.fromISO(event.start).setZone("Europe/Sofia").toFormat('HH:mm');
          return start;
        });
        
        setBookedTimes(booked);
      } catch (error) {
        console.error('Error loading appointments:', error);
      } finally {
        // Add a small delay for a smooth transition
        setTimeout(() => {
          setIsLoading(false);
        }, 600);
      }
    };

    loadAppointments();
  }, [date, selectedBarber, selectedService]);

  const isTimeAvailable = useCallback((timeSlot) => {
    if (isLoading) return false;
    return !bookedTimes.includes(timeSlot);
  }, [bookedTimes, isLoading]);

  const handleTimeSelect = useCallback((timeSlot) => {
    if (isLoading) return;
    
    console.log("TimeSelection - Setting time to:", timeSlot);
    
    // Convert timeSlot string to number for proper handling
    const hourValue = parseInt(timeSlot.split(':')[0], 10);
    
    // Set the time in the context
    setTime(hourValue);
    
    console.log("TimeSelection - Time set to:", hourValue);
    
    // Move to the next step
    setCurrentStep(5);
  }, [isLoading, setTime, setCurrentStep]);

  return (
    <div className="time-selection step-content">
      <h3>Избери Час</h3>
      <div className="time-slots-container">
        <div className="time-slots">
          {timeSlots.map((timeSlot) => {
            const isAvailable = isTimeAvailable(timeSlot);
            const hourValue = parseInt(timeSlot.split(':')[0], 10);
            const isSelected = time === hourValue;
            
            return (
              <button
                key={timeSlot}
                onClick={() => isAvailable && handleTimeSelect(timeSlot)}
                className={`time-button 
                  ${isLoading ? 'loading' : isAvailable ? 'available' : 'unavailable'} 
                  ${isSelected ? 'selected' : ''}`}
                disabled={!isAvailable || isLoading}
              >
                <span className="time-text">{timeSlot}</span>
                {isLoading && <span className="time-loading-indicator"></span>}
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Debug info */}
      <div style={{ display: 'none' }}>
        <p>Selected time: {time}</p>
        <p>Time type: {typeof time}</p>
      </div>
    </div>
  );
};

export default TimeSelection; 