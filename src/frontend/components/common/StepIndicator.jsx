import React, { useEffect, useRef } from 'react';
import { useBooking } from '../../contexts/BookingContext';
import { TOTAL_STEPS, BARBERS, SERVICES } from '../../utilities/constants';
import { DateTime } from 'luxon';
import './StepIndicator.css'; // Make sure CSS is imported

const StepIndicator = () => {
  const {
    currentStep,
    selectedBarber,
    selectedService,
    date,
    time,
  } = useBooking();
  
  // Reference to the step indicator for ensuring proper rendering
  const stepIndicatorRef = useRef(null);
  
  // Force a repaint on mount to ensure proper z-index stacking
  useEffect(() => {
    if (stepIndicatorRef.current) {
      // Force a repaint by temporarily modifying a style property
      const currentDisplay = stepIndicatorRef.current.style.display;
      stepIndicatorRef.current.style.display = 'none';
      // Trigger a reflow
      void stepIndicatorRef.current.offsetHeight;
      stepIndicatorRef.current.style.display = currentDisplay;
    }
  }, []);

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
    <div className="step-indicator" ref={stepIndicatorRef}>
      <div className="steps-wrapper">
        {/* Render connector first to ensure it's behind the steps */}
        <div className="step-connector">
          <div
            className="step-connector-progress"
            style={{
              width: `${((currentStep - 1) / (TOTAL_STEPS - 1)) * 100}%`,
            }}
          ></div>
        </div>
        
        {/* Render steps after connector */}
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
      </div>
    </div>
  );
};

export default StepIndicator; 