import { DateTime } from "luxon";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Calendar from "react-calendar";
import "./CalendarComponent.css";

const CalendarComponent = () => {
  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5; // Increased to 5 steps

  // Form data
  const [selectedBarber, setSelectedBarber] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [date, setDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
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
  const [isLoading, setIsLoading] = useState(false);
  const [isMonthLoading, setIsMonthLoading] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showLoading, setShowLoading] = useState(false);

  // Barber options
  const barbers = [
    { id: "miro", name: "Миро", experience: "6 месеца" },
    { id: "rado", name: "Радо", experience: "4 години" },
    { id: "simo", name: "Симо", experience: "2 години" },
  ];

  // Service options
  const services = [
    { id: "haircut", name: "Коса", duration: 30, price: 25 },
    { id: "beard", name: "Брада", duration: 20, price: 15 },
    { id: "combo", name: "Коса / Брада Kомбо", duration: 45, price: 35 },
  ];

  // Configure axios with a timeout and cache
  const api = axios.create({
    timeout: 5000,
    headers: { "Cache-Control": "max-age=300" }, // 5 minute cache
  });

  // Handle loading indicator with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(isLoading || isMonthLoading);
    }, 300); // Only show loading indicator if loading takes more than 300ms

    return () => clearTimeout(timer);
  }, [isLoading, isMonthLoading]);

  // Fetch appointments for the selected date and barber
  useEffect(() => {
    // Only fetch events if a date and barber are selected
    if (!date || !selectedBarber) {
      setAppointments([]);
      return;
    }

    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        const formattedDate = DateTime.fromJSDate(date)
          .setZone("Europe/Sofia")
          .toFormat("yyyy-MM-dd");
        const response = await api.get("http://localhost:5005/api/get-events", {
          params: {
            date: formattedDate,
            barber: selectedBarber,
          },
        });
        setAppointments(response.data.events);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching events", error);
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [date, selectedBarber]);

  // Check for fully booked dates when month changes - optimized version
  useEffect(() => {
    // Only check if a barber is selected
    if (!selectedBarber) {
      setFullyBookedDates([]);
      return;
    }

    const checkFullyBookedDates = async () => {
      setIsMonthLoading(true);
      const startOfMonth = DateTime.fromJSDate(currentMonth).startOf("month");
      const endOfMonth = DateTime.fromJSDate(currentMonth).endOf("month");

      try {
        // Get all events for the entire month in a single API call
        const response = await api.get(
          "http://localhost:5005/api/get-month-events",
          {
            params: {
              startDate: startOfMonth.toFormat("yyyy-MM-dd"),
              endDate: endOfMonth.toFormat("yyyy-MM-dd"),
              barber: selectedBarber,
            },
          }
        );

        // Process the data to identify fully booked dates
        const eventsMap = new Map();

        // Initialize the map with all dates in the month
        for (
          let day = startOfMonth;
          day <= endOfMonth;
          day = day.plus({ days: 1 })
        ) {
          const formattedDate = day.toFormat("yyyy-MM-dd");
          eventsMap.set(formattedDate, new Set());
        }

        // Add each event to the appropriate date's set
        response.data.events.forEach((event) => {
          const eventDateTime = DateTime.fromISO(event.start).setZone(
            "Europe/Sofia"
          );
          const formattedDate = eventDateTime.toFormat("yyyy-MM-dd");

          if (eventsMap.has(formattedDate)) {
            eventsMap.get(formattedDate).add(eventDateTime.hour);
          }
        });

        // Find fully booked dates (all hours from 9-17 are booked)
        const bookedDates = [];
        eventsMap.forEach((hours, date) => {
          // If all 9 business hours are booked
          if (hours.size >= 9) {
            bookedDates.push(date);
          }
        });

        setFullyBookedDates(bookedDates);
      } catch (error) {
        console.error("Error fetching month events:", error);

        // Fallback to the old method if the batch API doesn't exist
        try {
          const bookedDates = [];

          // Use Promise.all to make parallel requests
          const dates = [];
          for (
            let day = startOfMonth;
            day <= endOfMonth;
            day = day.plus({ days: 1 })
          ) {
            dates.push(day.toFormat("yyyy-MM-dd"));
          }

          const responses = await Promise.all(
            dates.map(
              (date) =>
                api
                  .get("http://localhost:5005/api/get-events", {
                    params: {
                      date,
                      barber: selectedBarber,
                    },
                  })
                  .catch((err) => ({ data: { events: [] } })) // Handle individual request failures
            )
          );

          // Process all the responses
          dates.forEach((date, index) => {
            const response = responses[index];
            const bookedHours = new Set();

            response.data.events.forEach((event) => {
              const eventDateTime = DateTime.fromISO(event.start).setZone(
                "Europe/Sofia"
              );
              bookedHours.add(eventDateTime.hour);
            });

            if (bookedHours.size >= 9) {
              bookedDates.push(date);
            }
          });

          setFullyBookedDates(bookedDates);
        } catch (fallbackError) {
          console.error("Error in fallback method:", fallbackError);
        }
      }

      setIsMonthLoading(false);
    };

    checkFullyBookedDates();
  }, [currentMonth, selectedBarber]);

  const handleBarberSelect = (barberId) => {
    setSelectedBarber(barberId);
    // Advance to the next step
    setCurrentStep(2);
  };

  const handleServiceSelect = (serviceId) => {
    setSelectedService(serviceId);
    // Advance to the next step
    setCurrentStep(3);
  };

  const handleDateChange = (newDate) => {
    // Only allow date selection/deselection when not loading month data
    if (isMonthLoading) {
      return;
    }

    // Check if the selected date is fully booked before updating state
    const formattedDate = DateTime.fromJSDate(newDate)
      .setZone("Europe/Sofia")
      .toFormat("yyyy-MM-dd");
    if (!fullyBookedDates.includes(formattedDate)) {
      setDate(newDate);
      // Advance to the next step
      setCurrentStep(4);
    }
  };

  const handleMonthChange = ({ activeStartDate }) => {
    setCurrentMonth(activeStartDate);
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    // Advance to the next step
    setCurrentStep(5);
    // Reset booking confirmed state when selecting a new time
    setBookingConfirmed(false);
  };

  const handleCustomerInfoChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

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
        setSelectedTime(null);
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

  const isTimeAvailable = (time) => {
    if (!date) return false; // No time is available if no date is selected

    const selectedDateTime = DateTime.fromJSDate(date)
      .setZone("Europe/Sofia")
      .set({ hour: time, minute: 0, second: 0, millisecond: 0 });

    const isTaken = appointments.some((event) => {
      const eventStart = DateTime.fromISO(event.start).setZone("Europe/Sofia");
      return (
        eventStart.hasSame(selectedDateTime, "day") &&
        eventStart.hour === selectedDateTime.hour
      );
    });

    return !isTaken;
  };

  const isDateDisabled = ({ date }) => {
    // Disable dates in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return true;

    // Disable fully booked dates
    const formattedDate = DateTime.fromJSDate(date)
      .setZone("Europe/Sofia")
      .toFormat("yyyy-MM-dd");
    return fullyBookedDates.includes(formattedDate);
  };

  const getTileClassName = ({ date: tileDate, view }) => {
    if (view !== "month") return "";

    // Add loading class when calculating fully booked dates
    if (isMonthLoading) return "date-loading";

    const formattedDate = DateTime.fromJSDate(tileDate)
      .setZone("Europe/Sofia")
      .toFormat("yyyy-MM-dd");
    let classNames = "";

    if (fullyBookedDates.includes(formattedDate)) {
      classNames += "fully-booked-date";
    }

    // Add selected class for the currently selected date
    if (
      date &&
      DateTime.fromJSDate(date).hasSame(DateTime.fromJSDate(tileDate), "day")
    ) {
      classNames += " selected-date-tile";
    }

    return classNames;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedBarber || !selectedService || !date || !selectedTime) {
      alert("Please complete all booking information");
      return;
    }

    if (
      !customerInfo.name ||
      !customerInfo.email ||
      !customerInfo.phoneNumber
    ) {
      alert("Please fill in all customer information");
      return;
    }

    const selectedDate = DateTime.fromJSDate(date).setZone("Europe/Sofia");
    const formattedDate = selectedDate.toFormat("yyyy-MM-dd");
    const formattedTime = selectedDate
      .set({ hour: selectedTime, minute: 0 })
      .toFormat("HH:mm:ss");

    // Get selected service details
    const serviceDetails = services.find(
      (service) => service.id === selectedService
    );
    // Get selected barber details
    const barberDetails = barbers.find(
      (barber) => barber.id === selectedBarber
    );

    // Prepare booking summary data
    const summary = {
      barberName: barberDetails.name,
      serviceName: serviceDetails.name,
      date: formattedDate,
      time: `${selectedTime}:00`,
      duration: serviceDetails.duration,
      price: serviceDetails.price,
      customerName: customerInfo.name,
      customerEmail: customerInfo.email,
      customerPhone: customerInfo.phoneNumber
    };

    api
      .post("http://localhost:5005/api/booking", {
        customerName: customerInfo.name,
        customerEmail: customerInfo.email,
        phoneNumber: customerInfo.phoneNumber,
        barber: selectedBarber,
        barberName: barberDetails.name,
        service: selectedService,
        date: formattedDate,
        time: formattedTime,
        duration: serviceDetails.duration,
      })
      .then((response) => {
        // Save the booking summary and mark as confirmed
        setBookingSummary({
          ...summary,
          appointmentId: response.data.appointmentId
        });
        setBookingConfirmed(true);

        // Add the new appointment to the list
        const newAppointment = {
          id: response.data.appointmentId,
          summary: `${selectedService} - ${customerInfo.name}`,
          start: selectedDate.set({ hour: selectedTime, minute: 0 }).toISO(),
        };

        setAppointments([...appointments, newAppointment]);
      })
      .catch((error) => {
        alert("Failed to book appointment");
        console.error("Booking error:", error);
      });
  };

  const handleNewBooking = () => {
    // Reset all states to start a new booking
    setSelectedBarber("");
    setSelectedService("");
    setDate(null);
    setSelectedTime(null);
    setCustomerInfo({
      name: "",
      email: "",
      phoneNumber: "",
    });
    setBookingConfirmed(false);
    setBookingSummary(null);
    setCurrentStep(1);
  };

  const renderStepIndicator = () => {
    // Get the selected barber's name
    const barberName = selectedBarber
      ? barbers.find((b) => b.id === selectedBarber)?.name
      : "";

    // Get the selected service's name
    const serviceName = selectedService
      ? services.find((s) => s.id === selectedService)?.name
      : "";

    // Format the selected date
    const formattedDate = date
      ? DateTime.fromJSDate(date).setZone("Europe/Sofia").toFormat("dd/MM/yyyy")
      : "";

    // Format the selected time
    const formattedTime = selectedTime ? `${selectedTime}:00` : "";

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
              <div className="step-label">
                {step === 1 && (barberName ? barberName : "Бръснар")}
                {step === 2 && (serviceName ? serviceName :"Услуга")}
                {step === 3 && (formattedDate ? formattedDate : "Дата")}
                {step === 4 &&  (formattedTime ? formattedTime : "Час")}
                {step === 5 && "Данни"}
              </div>
            </div>
          ))}
          
          <div className="step-connector">
            <div
              className="step-connector-progress"
              style={{
                width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%`,
              }}
            ></div>
          </div>
        </div>
      </div>
    );
  };
  
  const renderBarberSelection = () => {
    return (
      <div className="barber-selection step-content">
        <h3>Избери Своя Бръснар</h3>
        <div className="barbers-grid">
          {barbers.map((barber) => (
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

  const renderServiceSelection = () => {
    return (
      <div className="service-selection step-content">
        <h3>Избери услуга</h3>
        <div className="services-grid">
          {services.map((service) => (
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

  const renderCalendarSelection = () => {
    return (
      <div className="calendar-selection step-content">
        <h3>Избери Дата</h3>
        <div className="calendar-wrapper">
          <Calendar
            onChange={handleDateChange}
            value={date}
            minDate={new Date()} // Today as minimum date
            maxDate={(() => {
              const maxDate = new Date();
              // Add 1 month and 2 weeks (6 weeks total) to current date
              maxDate.setDate(maxDate.getDate() + 42); // 42 days = 6 weeks
              return maxDate;
            })()}
            tileDisabled={isDateDisabled}
            tileClassName={getTileClassName}
            onActiveStartDateChange={handleMonthChange}
            className={`custom-calendar ${
              isMonthLoading ? "calendar-loading" : ""
            }`}
            showNeighboringMonth={true}
            goToRangeStartOnSelect={false}
          />
        </div>
      </div>
    );
  };

  const renderTimeSelection = () => {
    return (
      <div className="time-selection step-content">
        <h3>
          Избери Свободен Час{" "}
          {/* {DateTime.fromJSDate(date).setZone('Europe/Sofia').toFormat('dd/MM/yyyy')}*/}
        </h3>
        <div className="time-slots">
          {[9, 10, 11, 12, 13, 14, 15, 16, 17].map((time) => (
            <button
              key={time}
              onClick={() => isTimeAvailable(time) && handleTimeSelect(time)}
              className={`time-button ${
                isTimeAvailable(time) ? "available" : "unavailable"
              } ${selectedTime === time ? "selected" : ""}`}
              disabled={isLoading || !isTimeAvailable(time)}
            >
              {time}:00
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderBookingConfirmation = () => {
    if (!bookingSummary) return null;
    
    return (
      <div className="booking-confirmation step-content">
        <h3>Запазеният Час е Потвърден!</h3>
        
        <div className="booking-summary">
          <h4>Данни за Услугата</h4>
          <div className="summary-details">
            <p>
              <strong>Номер на резервация:</strong> {bookingSummary.appointmentId}
            </p>
            <p>
              <strong>Бръснар:</strong> {bookingSummary.barberName}
            </p>
            <p>
              <strong>Услуга:</strong> {bookingSummary.serviceName}
            </p>
            <p>
              <strong>Дата:</strong> {DateTime.fromISO(bookingSummary.date).toFormat("dd/MM/yyyy")}
            </p>
            <p>
              <strong>Час:</strong> {bookingSummary.time}
            </p>
            <p>
              <strong>Времетраене:</strong> {bookingSummary.duration} мин.
            </p>
            <p>
              <strong>Цена:</strong> {bookingSummary.price} лв.
            </p>
            <p>
              <strong>Име:</strong> {bookingSummary.customerName}
            </p>
            <p>
              <strong>Email:</strong> {bookingSummary.customerEmail}
            </p>
            <p>
              <strong>Телефон:</strong> {bookingSummary.customerPhone}
            </p>
          </div>
        </div>
        
        <button 
          type="button" 
          className="submit-button"
          onClick={handleNewBooking}
        >
          Резервирай Нов Час
        </button>
      </div>
    );
  };

  const renderCustomerInfo = () => {
    // If booking is confirmed, show confirmation instead of the form
    if (bookingConfirmed) {
      return renderBookingConfirmation();
    }
    
    return (
      <div className="customer-info step-content">
        <h3>Вашата Информация</h3>

        <form className="customer-form">
          <div className="form-group">
            <label htmlFor="name">Your Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={customerInfo.name}
              onChange={handleCustomerInfoChange}
              required
              placeholder="Full Name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={customerInfo.email}
              onChange={handleCustomerInfoChange}
              required
              placeholder="youremail@example.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="phoneNumber">Phone Number</label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={customerInfo.phoneNumber}
              onChange={handleCustomerInfoChange}
              required
              placeholder="Phone Number"
            />
          </div>

          <button
            type="button"
            className="submit-button"
            onClick={handleSubmit}
            disabled={
              !customerInfo.name ||
              !customerInfo.email ||
              !customerInfo.phoneNumber
            }
          >
            Book Appointment
          </button>
        </form>
      </div>
    );
  };

  return (
    <div className="booking-container">
      <h2 className="booking-title">Запази си Час</h2>

      {renderStepIndicator()}

      <div className="booking-content">
        {currentStep > 1 && !bookingConfirmed && (
          <button className="back-button" onClick={handleBackButton}>
            ← Назад
          </button>
        )}

        <div className="steps-container">
          {currentStep === 1 && renderBarberSelection()}
          {currentStep === 2 && renderServiceSelection()}
          {currentStep === 3 && renderCalendarSelection()}
          {currentStep === 4 && renderTimeSelection()}
          {currentStep === 5 && renderCustomerInfo()}
        </div>
      </div>

      {showLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      )}
    </div>
  );
};

export default CalendarComponent;