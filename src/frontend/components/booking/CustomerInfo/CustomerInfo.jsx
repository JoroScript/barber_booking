import React, { useState, useEffect } from 'react';
import { useBooking } from '../../../contexts/BookingContext';
import { BARBERS, SERVICES } from '../../../utilities/constants';
import { createBooking, checkTimeSlotAvailability } from '../../../utilities/bookingApi';
import { DateTime } from 'luxon';
import './CustomerInfo.css';

const CustomerInfo = () => {
  const {
    customerInfo,
    setCustomerInfo,
    selectedBarber,
    selectedService,
    date,
    time,
    setModalMessage,
    setModalOpen,
    setAppointments,
    setBookingSummary,
    setBookingConfirmed,
  } = useBooking();

  // Use local loading state instead of global one
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Debug: Log the current time value
  useEffect(() => {
    console.log("CustomerInfo - Current time value:", time);
    console.log("CustomerInfo - Time type:", typeof time);
  }, [time]);

  const handleCustomerInfoChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("CustomerInfo - Submitting with time:", time);
    console.log("CustomerInfo - All form data:", {
      selectedBarber,
      selectedService,
      date,
      time,
      customerInfo
    });

    if (!selectedBarber || !selectedService || !date || time === null) {
      setModalMessage("Please complete all booking information");
      setModalOpen(true);
      return;
    }

    if (!customerInfo.name || !customerInfo.email || !customerInfo.phoneNumber) {
      setModalMessage("Please fill in all customer information");
      setModalOpen(true);
      return;
    }

    setIsSubmitting(true);

    // First, verify the time slot is still available
    const availabilityCheck = await checkTimeSlotAvailability(
      selectedBarber,
      date,
      time,
      SERVICES.find(s => s.id === selectedService).duration
    );
    
    if (!availabilityCheck.available) {
      setIsSubmitting(false);
      setModalMessage(availabilityCheck.error || "This time slot is no longer available");
      setModalOpen(true);
      return;
    }

    const selectedDate = DateTime.fromJSDate(date).setZone("Europe/Sofia");
    const formattedDate = selectedDate.toFormat("yyyy-MM-dd");
    const formattedTime = selectedDate
      .set({ hour: time, minute: 0 })
      .toFormat("HH:mm:ss");

    const serviceDetails = SERVICES.find(service => service.id === selectedService);
    const barberDetails = BARBERS.find(barber => barber.id === selectedBarber);

    const bookingData = {
      customerName: customerInfo.name,
      customerEmail: customerInfo.email,
      phoneNumber: customerInfo.phoneNumber,
      barber: selectedBarber,
      barberName: barberDetails.name,
      service: selectedService,
      date: formattedDate,
      time: formattedTime,
      duration: serviceDetails.duration,
    };

    try {
      const response = await createBooking(bookingData);

      setBookingSummary({
        barberName: barberDetails.name,
        serviceName: serviceDetails.name,
        date: formattedDate,
        time: `${time}:00`,
        duration: serviceDetails.duration,
        price: serviceDetails.price,
        customerName: customerInfo.name,
        customerEmail: customerInfo.email,
        customerPhone: customerInfo.phoneNumber,
        appointmentId: response.appointmentId
      });
      
      setBookingConfirmed(true);

      // Add the new appointment to the list
      const newAppointment = {
        id: response.appointmentId,
        summary: `${selectedService} - ${customerInfo.name}`,
        start: selectedDate.set({ hour: time, minute: 0 }).toISO(),
        end: selectedDate.set({ hour: time, minute: serviceDetails.duration }).toISO()
      };

      setAppointments(prev => [...prev, newAppointment]);
    } catch (error) {
      let errorMessage = "Failed to book appointment";
      
      if (error.response?.status === 409) {
        errorMessage = "This time slot has been booked by someone else. Please select another time.";
      } else {
        errorMessage = error.response?.data?.error || errorMessage;
      }
      
      setModalMessage(errorMessage);
      setModalOpen(true);
      console.error("Booking error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format the time for display
  const formattedTime = time !== null ? `${time}:00` : "No time selected";

  return (
    <div className="customer-info step-content">
      <h3>Вашата Информация</h3>
      
      {/* Debug info */}
      
      
      <form className={`customer-form ${isSubmitting ? 'submitting' : ''}`} onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Име</label>
          <input
            type="text"
            id="name"
            name="name"
            value={customerInfo.name}
            onChange={handleCustomerInfoChange}
            required
            placeholder=""
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Имейл</label>
          <input
            type="email"
            id="email"
            name="email"
            value={customerInfo.email}
            onChange={handleCustomerInfoChange}
            required
            placeholder=""
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label htmlFor="phoneNumber">Телефон</label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={customerInfo.phoneNumber}
            onChange={handleCustomerInfoChange}
            required
            placeholder=""
            disabled={isSubmitting}
          />
        </div>

        <button
          type="submit"
          className={`submit-button ${isSubmitting ? 'submitting' : ''}`}
          disabled={!customerInfo.name || !customerInfo.email || !customerInfo.phoneNumber || isSubmitting || time === null}
        >
          {isSubmitting ? (
            <>
              <span className="button-spinner"></span>
              Processing...
            </>
          ) : (
            'Book Appointment'
          )}
        </button>
      </form>
    </div>
  );
};

export default CustomerInfo; 