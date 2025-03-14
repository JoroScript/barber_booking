// Import React directly with a named import to ensure it's available
import * as ReactModule from 'react';
import { DateTime } from 'luxon';
import Calendar from 'react-calendar';
import { fetchMonthEvents } from '../../../utilities/bookingApi';
import { BUSINESS_HOURS } from '../../../utilities/constants';
import './DateSelection.css';

// Make sure React is available
const React = ReactModule;
console.log('StandaloneDateSelection: React module imported directly:', !!React);
console.log('StandaloneDateSelection: useState is available:', !!React.useState);

// Create a standalone version of DateSelection that doesn't rely on context
const StandaloneDateSelection = (props) => {
  // Extract props with defaults
  const {
    initialDate = null,
    initialSelectedBarber = "",
    onDateSelected = () => {},
    onNextStep = () => {},
    onSetFullyBookedDates = () => {}
  } = props;

  // Local state management
  const [date, setLocalDate] = React.useState(initialDate);
  const [selectedBarber, setLocalBarber] = React.useState(initialSelectedBarber);
  const [fullyBookedDates, setLocalFullyBookedDates] = React.useState([]);
  const [isMonthLoading, setIsMonthLoading] = React.useState(false);
  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  const [cachedMonthData, setCachedMonthData] = React.useState({});
  const [error, setError] = React.useState(null);

  // Log that component is mounted
  React.useEffect(() => {
    console.log('StandaloneDateSelection mounted successfully');
    console.log('React hooks are working in StandaloneDateSelection');
  }, []);

  // Helper functions
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
    try {
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
    } catch (err) {
      console.error('Error processing booked dates:', err);
      setError('Error processing booked dates');
      return [];
    }
  }, []);

  const checkFullyBookedDates = React.useCallback(async () => {
    if (!selectedBarber) return;
    
    try {
      const cacheKey = getCacheKey(currentMonth, selectedBarber);
      
      // Check if we have cached data for this month and barber
      if (cachedMonthData[cacheKey]) {
        console.log("Using cached data for", cacheKey);
        setLocalFullyBookedDates(cachedMonthData[cacheKey]);
        onSetFullyBookedDates(cachedMonthData[cacheKey]);
        return;
      }
      
      setIsMonthLoading(true);
      const startOfMonth = DateTime.fromJSDate(currentMonth).startOf("month");
      const endOfMonth = DateTime.fromJSDate(currentMonth).endOf("month");

      const events = await fetchMonthEvents(startOfMonth, endOfMonth, selectedBarber);
      const bookedDates = processBookedDates(events, startOfMonth, endOfMonth);
      
      // Cache the results
      setCachedMonthData(prev => ({
        ...prev,
        [cacheKey]: bookedDates
      }));
      
      setLocalFullyBookedDates(bookedDates);
      onSetFullyBookedDates(bookedDates);
    } catch (error) {
      console.error("Error fetching month events:", error);
      setError('Error fetching month events');
    } finally {
      setIsMonthLoading(false);
    }
  }, [selectedBarber, currentMonth, processBookedDates, onSetFullyBookedDates, cachedMonthData, getCacheKey]);

  React.useEffect(() => {
    if (!selectedBarber) {
      setLocalFullyBookedDates([]);
      onSetFullyBookedDates([]);
      return;
    }

    const timeoutId = setTimeout(() => {
      checkFullyBookedDates();
    }, 300); // Debounce time

    return () => clearTimeout(timeoutId);
  }, [selectedBarber, currentMonth, checkFullyBookedDates, onSetFullyBookedDates]);

  const handleDateChange = React.useCallback((newDate) => {
    if (isMonthLoading) return;

    try {
      const formattedDate = DateTime.fromJSDate(newDate)
        .setZone("Europe/Sofia")
        .toFormat("yyyy-MM-dd");
        
      if (!fullyBookedDates.includes(formattedDate)) {
        setLocalDate(newDate);
        onDateSelected(newDate);
        onNextStep();
      }
    } catch (err) {
      console.error('Error handling date change:', err);
      setError('Error selecting date');
    }
  }, [isMonthLoading, fullyBookedDates, onDateSelected, onNextStep]);

  const handleMonthChange = React.useCallback(({ activeStartDate }) => {
    setCurrentMonth(activeStartDate);
  }, []);

  const isDateDisabled = React.useCallback(({ date }) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (date < today) return true;

      const formattedDate = DateTime.fromJSDate(date)
        .setZone("Europe/Sofia")
        .toFormat("yyyy-MM-dd");
      return fullyBookedDates.includes(formattedDate);
    } catch (err) {
      console.error('Error checking if date is disabled:', err);
      return true; // Disable date if there's an error
    }
  }, [fullyBookedDates]);

  const getTileClassName = React.useCallback(({ date: tileDate, view }) => {
    try {
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
    } catch (err) {
      console.error('Error getting tile class name:', err);
      return "";
    }
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

  // If there's an error, show it
  if (error) {
    return (
      <div className="calendar-selection step-content">
        <h3>Избери Дата</h3>
        <div className="error-message">
          <p>Възникна грешка: {error}</p>
          <button onClick={() => {
            setError(null);
            checkFullyBookedDates();
          }}>
            Опитай отново
          </button>
        </div>
      </div>
    );
  }

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

export default StandaloneDateSelection; 