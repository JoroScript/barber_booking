import React from 'react';
import { BookingProvider, useBooking } from './contexts/BookingContext';
import StepIndicator from './components/common/StepIndicator';
import BarberSelection from './components/booking/BarberSelection/BarberSelection';
import ServiceSelection from './components/booking/ServiceSelection/ServiceSelection';
import DateSelection from './components/booking/DateSelection/DateSelection';
import TimeSelection from './components/booking/TimeSelection/TimeSelection';
import CustomerInfo from './components/booking/CustomerInfo/CustomerInfo';
import BookingConfirmation from './components/booking/BookingConfirmation/BookingConfirmation';
import UnavailableSlotModal from './UnavailableSlotModal';
import './CalendarComponent.css';

// Ensure React is available
console.log('CalendarComponent: React is available:', !!React);
console.log('CalendarComponent: useState is available:', !!React.useState);

// Create a wrapper component to ensure React is loaded
const ReactLoadedWrapper = ({ children }) => {
  // Use React directly to ensure it's available
  const [isLoaded, setIsLoaded] = React.useState(false);
  
  React.useEffect(() => {
    console.log('ReactLoadedWrapper mounted, React hooks are working');
    setIsLoaded(true);
  }, []);
  
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-gray-900">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p>Loading Calendar...</p>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
};

const BookingContent = () => {
  // Use React directly to ensure it's available
  React.useEffect(() => {
    console.log('BookingContent mounted, React hooks are working');
  }, []);
  
  const {
    currentStep,
    modalOpen,
    modalMessage,
    handleModalClose,
    bookingConfirmed,
    handleBackButton
  } = useBooking();

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <BarberSelection />;
      case 2:
        return <ServiceSelection />;
      case 3:
        return <DateSelection />;
      case 4:
        return <TimeSelection />;
      case 5:
        return bookingConfirmed ? <BookingConfirmation /> : <CustomerInfo />;
      default:
        return null;
    }
  };

  return (
    <div className="booking-container">
      {!bookingConfirmed && <StepIndicator />}

      <div className="booking-content">
        {currentStep > 1 && !bookingConfirmed && (
          <button className="back-button" onClick={handleBackButton}>
            ← Назад
          </button>
        )}

        <div className="steps-container">
          {renderCurrentStep()}
        </div>
      </div>

      <UnavailableSlotModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        message={modalMessage}
      />
    </div>
  );
};

const CalendarComponent = () => {
  return (
    <ReactLoadedWrapper>
      <BookingProvider>
        <BookingContent />
      </BookingProvider>
    </ReactLoadedWrapper>
  );
};

export default CalendarComponent;