import "./react-import-helper.js";
import "./react-import-helper.js";
import "./react-import-helper.js";
import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import './CalendarComponent.jsx'

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
      
      // Send to analytics if needed
      // sendToAnalytics({
      //   id: 'page-load',
      //   value: Math.round(timing.domComplete - timing.startTime)
      // });
    }
  }
};

// Render the app with Suspense for code splitting
const root = createRoot(document.getElementById('root'));
root.render(
  <StrictMode>
    <Suspense fallback={<LoadingFallback />}>
      <App />
    </Suspense>
  </StrictMode>
);

// Measure performance after load
window.addEventListener('load', reportWebVitals);

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
