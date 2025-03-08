import React, { createContext, useContext, useState } from 'react';
import { DateTime } from 'luxon';

const BookingContext = createContext();

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};

export const BookingProvider = ({ children }) => {
  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  
  // Form data
  const [selectedBarber, setSelectedBarber] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [date, setDate] = useState(null);
  const [time, setTime] = useState(null);
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phoneNumber: "",
  });

  // Booking confirmation state
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bookingSummary, setBookingSummary] = useState(null);

  // Calendar data
  const [appointments, setAppointments] = useState([]);
  const [fullyBookedDates, setFullyBookedDates] = useState([]);
  const [isMonthLoading, setIsMonthLoading] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const handleBackButton = () => {
    // Clear the state for the current step before going back
    switch (currentStep) {
      case 2:
        // If on service selection step, clear the selected service
        setSelectedService("");
        break;
      case 3:
        // If on date selection step, clear the selected date
        setDate(null);
        break;
      case 4:
        // If on time selection step, clear the selected time
        setTime(null);
        break;
      case 5:
        // If on customer info step, clear the customer information
        if (!bookingConfirmed) {
          setCustomerInfo({
            name: "",
            email: "",
            phoneNumber: "",
          });
        }
        break;
      default:
        break;
    }
    
    // Go back one step only if booking is not confirmed
    if (!bookingConfirmed) {
      setCurrentStep((prev) => Math.max(1, prev - 1));
    }
  };

  const resetBooking = () => {
    setSelectedBarber("");
    setSelectedService("");
    setDate(null);
    setTime(null);
    setCustomerInfo({
      name: "",
      email: "",
      phoneNumber: "",
    });
    setBookingConfirmed(false);
    setBookingSummary(null);
    setCurrentStep(1);
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };

  const value = {
    currentStep,
    setCurrentStep,
    modalOpen,
    setModalOpen,
    modalMessage,
    setModalMessage,
    selectedBarber,
    setSelectedBarber,
    selectedService,
    setSelectedService,
    date,
    setDate,
    time,
    setTime,
    customerInfo,
    setCustomerInfo,
    bookingConfirmed,
    setBookingConfirmed,
    bookingSummary,
    setBookingSummary,
    appointments,
    setAppointments,
    fullyBookedDates,
    setFullyBookedDates,
    isMonthLoading,
    setIsMonthLoading,
    currentMonth,
    setCurrentMonth,
    handleBackButton,
    handleModalClose,
    resetBooking
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
}; 