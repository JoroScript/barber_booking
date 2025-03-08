import React, { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navigation from './Navigation';

export default function Layout() {
  const [useFullHeight, setUseFullHeight] = useState(false);
  const mainRef = useRef(null);
  const location = useLocation();
  
  // Check if we're on the booking confirmation page
  const isBookingConfirmation = location.pathname === '/booking' && 
    location.search.includes('step=5') && 
    location.search.includes('confirmed=true');

  // Function to check if content exceeds viewport height
  const checkContentHeight = () => {
    if (mainRef.current) {
      const contentHeight = mainRef.current.scrollHeight;
      const viewportHeight = window.innerHeight;
      
      // If content is taller than viewport or we're on booking confirmation, use full height
      setUseFullHeight(contentHeight > viewportHeight || isBookingConfirmation);
    }
  };

  useEffect(() => {
    // Check content height on mount and when location changes
    checkContentHeight();
    
    // Add resize listener
    window.addEventListener('resize', checkContentHeight);
    
    // Create a ResizeObserver to detect content size changes
    const resizeObserver = new ResizeObserver(() => {
      checkContentHeight();
    });
    
    // Start observing the main element
    if (mainRef.current) {
      resizeObserver.observe(mainRef.current);
    }
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', checkContentHeight);
      if (mainRef.current) {
        resizeObserver.unobserve(mainRef.current);
      }
      resizeObserver.disconnect();
    };
  }, [location, isBookingConfirmation]); // Re-run when location or isBookingConfirmation changes
  
  return (
    <div className="flex flex-col w-full overflow-x-hidden">
      <Navigation />
      <main 
        ref={mainRef}
        className={`flex flex-col w-full justify-center bg-gradient-to-br from-gray-900 via-black to-gray-800 ${
          useFullHeight || isBookingConfirmation ? 'min-h-screen' : 'h-screen'
        }`}
        style={{
          paddingTop: isBookingConfirmation ? '0' : undefined, // Remove top padding for booking confirmation
          overflow: 'auto', // Ensure content is scrollable if it exceeds viewport height
          maxWidth: '100vw', // Prevent horizontal overflow
          overflowX: 'hidden' // Hide horizontal overflow
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}