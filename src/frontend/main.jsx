import "./react-import-helper.js";
// Import React loader first to ensure React is globally available
import './react-loader.js';

// Import React directly to ensure it's available
import React from 'react';

// Import the ReactProvider
import ReactProvider from './ReactProvider';

// Then import other modules
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Add a loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen w-screen bg-gray-900">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
  </div>
);

// Create a performance measurement
const reportWebVitals = () => {
  if (window.performance) {
    const perfEntries = window.performance.getEntriesByType('navigation');
    if (perfEntries.length > 0) {
      const timing = perfEntries[0];
      console.log(`App loaded in: ${Math.round(timing.domComplete - timing.startTime)}ms`);
    }
  }
};

// Ensure React is loaded before rendering
if (typeof window !== 'undefined' && window.isReactLoaded && window.isReactLoaded()) {
  console.log('React is loaded, rendering app');
  
  // Render the app with ReactProvider to ensure React is loaded
  const root = createRoot(document.getElementById('root'));
  root.render(
    <StrictMode>
      <ReactProvider>
        <App />
      </ReactProvider>
    </StrictMode>
  );
  
  // Measure performance after load
  window.addEventListener('load', reportWebVitals);
} else {
  console.error('React is not loaded, cannot render app');
  
  // Try to load React again
  import('./react-loader.js').then(() => {
    console.log('React loader loaded, checking if React is available');
    
    if (typeof window !== 'undefined' && window.isReactLoaded && window.isReactLoaded()) {
      console.log('React is now loaded, rendering app');
      
      // Render the app with ReactProvider to ensure React is loaded
      const root = createRoot(document.getElementById('root'));
      root.render(
        <StrictMode>
          <ReactProvider>
            <App />
          </ReactProvider>
        </StrictMode>
      );
      
      // Measure performance after load
      window.addEventListener('load', reportWebVitals);
    } else {
      console.error('React is still not loaded, showing error message');
      
      // Show error message
      const rootElement = document.getElementById('root');
      if (rootElement) {
        rootElement.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: center; height: 100vh; width: 100vw; background-color: #1f2937;">
            <div style="text-align: center; color: white;">
              <h1 style="margin-bottom: 20px;">Error Loading Application</h1>
              <p>There was an error loading React. Please try refreshing the page.</p>
              <button style="margin-top: 20px; padding: 10px 20px; background-color: #f59e0b; color: black; border: none; border-radius: 5px; cursor: pointer;" onclick="window.location.reload()">
                Refresh Page
              </button>
            </div>
          </div>
        `;
      }
    }
  }).catch(error => {
    console.error('Error loading React loader:', error);
    
    // Show error message
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; height: 100vh; width: 100vw; background-color: #1f2937;">
          <div style="text-align: center; color: white;">
            <h1 style="margin-bottom: 20px;">Error Loading Application</h1>
            <p>There was an error loading React. Please try refreshing the page.</p>
            <button style="margin-top: 20px; padding: 10px 20px; background-color: #f59e0b; color: black; border: none; border-radius: 5px; cursor: pointer;" onclick="window.location.reload()">
              Refresh Page
            </button>
          </div>
        </div>
      `;
    }
  });
}

// Enable prefetching in production
if (import.meta.env.PROD) {
  // Prefetch other chunks when idle
  window.addEventListener('load', () => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        // Prefetch additional routes that might be needed soon
        import('./HomePage.jsx');
        import('./CalendarComponent.jsx');
      });
    }
  });
}
