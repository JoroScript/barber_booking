import React, { useState, useEffect } from 'react';

// This component ensures React is properly loaded before rendering children
const ReactProvider = ({ children }) => {
  const [isReactLoaded, setIsReactLoaded] = useState(false);

  useEffect(() => {
    // Check if React is properly loaded
    if (window.React && window.React.useState) {
      console.log('React is properly loaded in ReactProvider');
      setIsReactLoaded(true);
    } else {
      console.error('React is not properly loaded in ReactProvider');
      
      // Try to load React again
      import('./react-import-helper.js').then(() => {
        console.log('React import helper loaded in ReactProvider');
        if (window.React && window.React.useState) {
          console.log('React is now properly loaded in ReactProvider');
          setIsReactLoaded(true);
        } else {
          console.error('React is still not properly loaded after import helper');
        }
      }).catch(error => {
        console.error('Error loading React import helper:', error);
      });
    }
  }, []);

  // Show loading indicator while React is loading
  if (!isReactLoaded) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-gray-900">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p>Loading React...</p>
        </div>
      </div>
    );
  }

  // Render children once React is loaded
  return <>{children}</>;
};

export default ReactProvider; 