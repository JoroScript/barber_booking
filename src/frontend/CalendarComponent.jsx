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

const BookingContent = () => {
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
      <h2 className="booking-title">Запази си Час</h2>

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
    <BookingProvider>
      <BookingContent />
    </BookingProvider>
  );
};

export default CalendarComponent;