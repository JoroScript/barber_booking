import React from 'react';
import { useBooking } from '../../contexts/BookingContext';
import { TOTAL_STEPS, BARBERS, SERVICES } from '../../utilities/constants';
import { DateTime } from 'luxon';

const StepIndicator = () => {
  const {
    currentStep,
    selectedBarber,
    selectedService,
    date,
    time,
  } = useBooking();

  const getStepLabel = (step) => {
    switch (step) {
      case 1:
        return selectedBarber ? BARBERS.find(b => b.id === selectedBarber)?.name : "Бръснар";
      case 2:
        return selectedService ? SERVICES.find(s => s.id === selectedService)?.name : "Услуга";
      case 3:
        return date ? DateTime.fromJSDate(date).setZone('Europe/Sofia').toFormat('dd/MM/yyyy') : "Дата";
      case 4:
        return time ? `${time}:00` : "Час";
      case 5:
        return "Данни";
      default:
        return "";
    }
  };

  return (
    <div className="step-indicator">
      <div className="steps-wrapper">
        {[1, 2, 3, 4, 5].map((step) => (
          <div
            key={step}
            className={`step ${step === currentStep ? "active" : ""} ${
              step < currentStep ? "completed" : ""
            }`}
          >
            <div className="step-number">{step}</div>
            <div className="step-label">{getStepLabel(step)}</div>
          </div>
        ))}
        
        <div className="step-connector">
          <div
            className="step-connector-progress"
            style={{
              width: `${((currentStep - 1) / (TOTAL_STEPS - 1)) * 100}%`,
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default StepIndicator; 