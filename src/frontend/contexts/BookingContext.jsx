import React from 'react';
import { DateTime } from 'luxon';

// Verify React is available
console.log('BookingContext: React is available:', !!React);
console.log('BookingContext: createContext is available:', !!React.createContext);
console.log('BookingContext: useState is available:', !!React.useState);

// Create context using React directly
const BookingContext = React.createContext();

export const useBooking = () => {
  const context = React.useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};

export const BookingProvider = ({ children }) => {
  // Verify React hooks are working
  React.useEffect(() => {
    console.log('BookingProvider mounted, React hooks are working');
  }, []);

  // Step management
  const [currentStep, setCurrentStep] = React.useState(1);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [modalMessage, setModalMessage] = React.useState("");
  
  // Form data
  const [selectedBarber, setSelectedBarber] = React.useState("");
  const [selectedService, setSelectedService] = React.useState("");
  const [date, setDate] = React.useState(null);
  const [time, setTime] = React.useState(null);
  const [customerInfo, setCustomerInfo] = React.useState({
    name: "",
    email: "",
    phoneNumber: "",
  });

  // Booking confirmation state
  const [bookingConfirmed, setBookingConfirmed] = React.useState(false);
  const [bookingSummary, setBookingSummary] = React.useState(null);

  // Calendar data
  const [appointments, setAppointments] = React.useState([]);
  const [fullyBookedDates, setFullyBookedDates] = React.useState([]);
  const [isMonthLoading, setIsMonthLoading] = React.useState(false);
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

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