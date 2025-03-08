import React, { useEffect } from 'react';
import { useBooking } from '../../../contexts/BookingContext';
import './BookingConfirmation.css';

const BookingConfirmation = () => {
  const { bookingSummary, resetBooking } = useBooking();
  
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Add class to body to prevent horizontal scrolling
    document.body.classList.add('no-horizontal-scroll');
    
    // Cleanup
    return () => {
      document.body.classList.remove('no-horizontal-scroll');
    };
  }, []);

  if (!bookingSummary) {
    return (
      <div className="booking-confirmation">
        <div className="confirmation-message">
          Няма информация за резервация. Моля, започнете процеса на резервация отначало.
        </div>
        <div className="confirmation-actions">
          <button 
            type="button" 
            className="new-booking-button"
            onClick={resetBooking}
          >
            Нова Резервация
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-confirmation">
      <div className="confirmation-header">
        <div className="success-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
        <h3>Успешно запазен час</h3>
      </div>
      
      <div className="confirmation-message">
        Благодарим ви, че избрахте нашия салон. Вашата резервация е потвърдена. По-долу можете да видите детайлите за вашия час.
      </div>
      
      <div className="booking-summary">
        <h4>Детайли за резервацията</h4>
        <div className="summary-details">
          <div className="summary-row">
            <span className="summary-label">Бръснар:</span>
            <span className="summary-value">{bookingSummary.barberName}</span>
          </div>
          <div className="summary-row">
            <span className="summary-label">Услуга:</span>
            <span className="summary-value">{bookingSummary.serviceName}</span>
          </div>
          <div className="summary-row">
            <span className="summary-label">Дата:</span>
            <span className="summary-value">{bookingSummary.date}</span>
          </div>
          <div className="summary-row">
            <span className="summary-label">Час:</span>
            <span className="summary-value">{bookingSummary.time}</span>
          </div>
          <div className="summary-row">
            <span className="summary-label">Продължителност:</span>
            <span className="summary-value">{bookingSummary.duration} минути</span>
          </div>
          <div className="summary-row">
            <span className="summary-label">Цена:</span>
            <span className="summary-value">{bookingSummary.price} лв.</span>
          </div>
        </div>
      </div>
      
      <div className="customer-details">
        <h4>Вашите данни</h4>
        <div className="summary-details">
          <div className="summary-row">
            <span className="summary-label">Име:</span>
            <span className="summary-value">{bookingSummary.customerName}</span>
          </div>
          <div className="summary-row">
            <span className="summary-label">Имейл:</span>
            <span className="summary-value">{bookingSummary.customerEmail}</span>
          </div>
          <div className="summary-row">
            <span className="summary-label">Телефон:</span>
            <span className="summary-value">{bookingSummary.customerPhone}</span>
          </div>
        </div>
      </div>
      
      <div className="email-notification">
        <div className="email-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
          </svg>
        </div>
        <p>Изпратихме детайлите за вашата резервация на посочения имейл адрес. Моля, проверете и вашата папка "Спам", ако не виждате имейла.</p>
      </div>
      
      <div className="confirmation-actions">
        <button 
          type="button" 
          className="new-booking-button"
          onClick={resetBooking}
        >
          Резервирай Нов Час
        </button>
      </div>
    </div>
  );
};

export default BookingConfirmation; 