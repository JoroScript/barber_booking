import {Outlet} from 'react-router-dom';
import Navigation from './Navigation';
import { useEffect, useRef, useState } from 'react';

export default function Layout() {
  const mainRef = useRef(null);
  const [useFullHeight, setUseFullHeight] = useState(true);
  
  useEffect(() => {
    // Function to check if content exceeds viewport height
    const checkContentHeight = () => {
      if (!mainRef.current) return;
      
      const contentHeight = mainRef.current.scrollHeight;
      const viewportHeight = window.innerHeight;
      const navHeight = document.querySelector('nav')?.offsetHeight || 0;
      const availableHeight = viewportHeight - navHeight;
      
      // If content height is greater than available viewport height, use h-full
      // Otherwise use h-screen
      setUseFullHeight(contentHeight > availableHeight);
    };
    
    // Check on initial render
    checkContentHeight();
    
    // Check on window resize
    window.addEventListener('resize', checkContentHeight);
    
    // Create a ResizeObserver to detect content size changes
    const resizeObserver = new ResizeObserver(() => {
      checkContentHeight();
    });
    
    // Observe the main element
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
  }, []);
  
  return (
    <>
      <Navigation />
      <main 
        ref={mainRef}
        className={`flex flex-col w-full justify-center bg-gradient-to-b from-red-700 via-red-900 to-black ${
          useFullHeight ? 'h-full min-h-screen' : 'h-screen'
        }`}
      >
        <Outlet />
      </main>
    </>
  );
}