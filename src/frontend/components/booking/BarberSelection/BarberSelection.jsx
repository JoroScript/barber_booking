import React from 'react';
import { useBooking } from '../../../contexts/BookingContext';
import { BARBERS } from '../../../utilities/constants';
import './BarberSelection.css';

const BarberSelection = () => {
  const { selectedBarber, setSelectedBarber, setCurrentStep } = useBooking();

  const handleBarberSelect = (barberId) => {
    setSelectedBarber(barberId);
    setCurrentStep(2);
  };

  return (
    <div className="barber-selection step-content">
      <h3>Избери Своя Бръснар</h3>
      <div className="barbers-grid">
        {BARBERS.map((barber) => (
          <div
            key={barber.id}
            className={`barber-card ${
              selectedBarber === barber.id ? "selected" : ""
            }`}
            onClick={() => handleBarberSelect(barber.id)}
          >
            <div className="barber-avatar">{barber.name.charAt(0)}</div>
            <div className="barber-info">
              <h4>{barber.name}</h4>
              <div className="barber-details">
                <p>
                  <strong>Опит:</strong> {barber.experience}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BarberSelection; 