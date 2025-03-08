import React from 'react';
import { useBooking } from '../../../contexts/BookingContext';
import { SERVICES } from '../../../utilities/constants';
import './ServiceSelection.css';

const ServiceSelection = () => {
  const { selectedService, setSelectedService, setCurrentStep } = useBooking();

  const handleServiceSelect = (serviceId) => {
    setSelectedService(serviceId);
    setCurrentStep(3);
  };

  return (
    <div className="service-selection step-content">
      <h3>Избери услуга</h3>
      <div className="services-grid">
        {SERVICES.map((service) => (
          <div
            key={service.id}
            className={`service-card ${
              selectedService === service.id ? "selected" : ""
            }`}
            onClick={() => handleServiceSelect(service.id)}
          >
            <h4>{service.name}</h4>
            <div className="service-details">
              <p>{service.duration} мин.</p>
              <p>{service.price} лв.</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServiceSelection; 