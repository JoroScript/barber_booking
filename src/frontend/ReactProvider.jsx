import React from 'react';

// Simple ReactProvider component to ensure React is available
const ReactProvider = ({ children }) => {
  // Log that React is available
  React.useEffect(() => {
    console.log('ReactProvider mounted, React is available');
  }, []);
  
  return <>{children}</>;
};

export default ReactProvider; 