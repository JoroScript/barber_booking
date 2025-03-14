import React from 'react';
import { useBooking } from '../../../contexts/BookingContext';
import { DateTime } from 'luxon';
import Calendar from 'react-calendar';
import { fetchMonthEvents } from '../../../utilities/bookingApi';
import { BUSINESS_HOURS } from '../../../utilities/constants';
import './DateSelection.css';

// Verify React is available
console.log('DateSelection: React is available:', !!React);
console.log('DateSelection: useState is available:', !!React.useState);

const DateSelection = () => {
  // Use React directly to ensure it's available
  const [cachedMonthData, setCachedMonthData] = React.useState({});
  
  // Verify React hooks are working
  React.useEffect(() => {
    console.log('DateSelection component mounted, React hooks are working');
  }, []);
  
  const {
    date,
    setDate,
    selectedBarber,
    setCurrentStep,
    fullyBookedDates,
    setFullyBookedDates,
    isMonthLoading,
    setIsMonthLoading,
    currentMonth,
    setCurrentMonth
  } = useBooking();

  const getCacheKey = React.useCallback((month, barberId) => {
    return `${month.getFullYear()}-${month.getMonth()}-${barberId}`;
  }, []);

  // Bulgarian weekday abbreviations
  const formatShortWeekday = React.useCallback((locale, date) => {
    const weekdays = ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    return weekdays[date.getDay()];
  }, []);

  // Bulgarian month names
  const formatMonthYear = React.useCallback((locale, date) => {
    const months = [
      'Януари', 'Февруари', 'Март', 'Април', 'Май', 'Юни',
      'Юли', 'Август', 'Септември', 'Октомври', 'Ноември', 'Декември'
    ];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  }, []);

  const processBookedDates = React.useCallback((events, startOfMonth, endOfMonth) => {
    const bookedHoursPerDate = new Map();
    const totalBusinessHours = BUSINESS_HOURS.length;

    // Pre-initialize dates in the month
    for (let day = startOfMonth; day <= endOfMonth; day = day.plus({ days: 1 })) {
      const dateKey = day.toFormat("yyyy-MM-dd");
      bookedHoursPerDate.set(dateKey, 0);
    }

    // Process events in bulk
    events.forEach((event) => {
      const eventStart = DateTime.fromISO(event.start).setZone("Europe/Sofia");
      const dateKey = eventStart.toFormat("yyyy-MM-dd");
      
      if (bookedHoursPerDate.has(dateKey)) {
        bookedHoursPerDate.set(dateKey, bookedHoursPerDate.get(dateKey) + 1);
      }
    });

    // Filter fully booked dates
    return Array.from(bookedHoursPerDate.entries())
      .filter(([_, count]) => count >= totalBusinessHours)
      .map(([date]) => date);
  }, []);

  const checkFullyBookedDates = React.useCallback(async () => {
    if (!selectedBarber) return;
    
    const cacheKey = getCacheKey(currentMonth, selectedBarber);
    
    // Check if we have cached data for this month and barber
    if (cachedMonthData[cacheKey]) {
      console.log("Using cached data for", cacheKey);
      setFullyBookedDates(cachedMonthData[cacheKey]);
      return;
    }
    
    setIsMonthLoading(true);
    const startOfMonth = DateTime.fromJSDate(currentMonth).startOf("month");
    const endOfMonth = DateTime.fromJSDate(currentMonth).endOf("month");

    try {
      const events = await fetchMonthEvents(startOfMonth, endOfMonth, selectedBarber);
      const bookedDates = processBookedDates(events, startOfMonth, endOfMonth);
      
      // Cache the results
      setCachedMonthData(prev => ({
        ...prev,
        [cacheKey]: bookedDates
      }));
      
      setFullyBookedDates(bookedDates);
    } catch (error) {
      console.error("Error fetching month events:", error);
    } finally {
      setIsMonthLoading(false);
    }
  }, [selectedBarber, currentMonth, processBookedDates, setFullyBookedDates, setIsMonthLoading, cachedMonthData, getCacheKey]);

  React.useEffect(() => {
    if (!selectedBarber) {
      setFullyBookedDates([]);
      return;
    }

    const timeoutId = setTimeout(() => {
      checkFullyBookedDates();
    }, 300); // Debounce time

    return () => clearTimeout(timeoutId);
  }, [selectedBarber, currentMonth, checkFullyBookedDates, setFullyBookedDates]);

  const handleDateChange = React.useCallback((newDate) => {
    if (isMonthLoading) return;

    const formattedDate = DateTime.fromJSDate(newDate)
      .setZone("Europe/Sofia")
      .toFormat("yyyy-MM-dd");
      
    if (!fullyBookedDates.includes(formattedDate)) {
      setDate(newDate);
      setCurrentStep(4);
    }
  }, [isMonthLoading, fullyBookedDates, setDate, setCurrentStep]);

  const handleMonthChange = React.useCallback(({ activeStartDate }) => {
    setCurrentMonth(activeStartDate);
  }, [setCurrentMonth]);

  const isDateDisabled = React.useCallback(({ date }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return true;

    const formattedDate = DateTime.fromJSDate(date)
      .setZone("Europe/Sofia")
      .toFormat("yyyy-MM-dd");
    return fullyBookedDates.includes(formattedDate);
  }, [fullyBookedDates]);

  const getTileClassName = React.useCallback(({ date: tileDate, view }) => {
    if (view !== "month") return "";

    const formattedDate = DateTime.fromJSDate(tileDate)
      .setZone("Europe/Sofia")
      .toFormat("yyyy-MM-dd");
    let classNames = "";

    if (fullyBookedDates.includes(formattedDate)) {
      classNames += "fully-booked-date";
    }

    if (date && DateTime.fromJSDate(date).hasSame(DateTime.fromJSDate(tileDate), "day")) {
      classNames += " selected-date-tile";
    }

    return classNames;
  }, [fullyBookedDates, date]);

  // Memoize calendar to prevent unnecessary re-renders
  const calendarComponent = React.useMemo(() => (
    <Calendar
      onChange={handleDateChange}
      value={date}
      minDate={new Date()}
      maxDate={(() => {
        const maxDate = new Date();
        maxDate.setDate(maxDate.getDate() + 42);
        return maxDate;
      })()}
      tileDisabled={isDateDisabled}
      tileClassName={getTileClassName}
      onActiveStartDateChange={handleMonthChange}
      className={`custom-calendar ${isMonthLoading ? 'calendar-loading' : ''}`}
      showNeighboringMonth={true}
      goToRangeStartOnSelect={false}
      formatShortWeekday={formatShortWeekday}
      formatMonthYear={formatMonthYear}
      locale="bg-BG"
      prevLabel="←"
      nextLabel="→"
      prev2Label="«"
      next2Label="»"
    />
  ), [date, handleDateChange, isDateDisabled, getTileClassName, handleMonthChange, isMonthLoading, formatShortWeekday, formatMonthYear]);

  return (
    <div className="calendar-selection step-content">
      <h3>Избери Дата</h3>
      <div className="calendar-wrapper">
        <div className="calendar-container">
          {calendarComponent}
          {isMonthLoading && (
            <div className="calendar-loading-overlay">
              <div className="calendar-loading-spinner"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DateSelection; 