// This file ensures React is properly loaded before any components are rendered
import * as ReactModule from 'react';

// Make sure React is available
const React = ReactModule;

// Log React version
console.log('React loader: React version:', React.version);
console.log('React loader: React is available:', !!React);
console.log('React loader: useState is available:', !!React.useState);

// Make React available globally
if (typeof window !== 'undefined') {
  // Ensure React is available globally
  window.React = React;
  
  // Make all React hooks available globally with proper binding
  window.useState = function(...args) {
    if (!React.useState) {
      console.error('React.useState is not available');
      throw new Error('React.useState is not available');
    }
    return React.useState.apply(React, args);
  };
  
  window.useEffect = function(...args) {
    if (!React.useEffect) {
      console.error('React.useEffect is not available');
      throw new Error('React.useEffect is not available');
    }
    return React.useEffect.apply(React, args);
  };
  
  window.useContext = function(...args) {
    if (!React.useContext) {
      console.error('React.useContext is not available');
      throw new Error('React.useContext is not available');
    }
    return React.useContext.apply(React, args);
  };
  
  window.useCallback = function(...args) {
    if (!React.useCallback) {
      console.error('React.useCallback is not available');
      throw new Error('React.useCallback is not available');
    }
    return React.useCallback.apply(React, args);
  };
  
  window.useMemo = function(...args) {
    if (!React.useMemo) {
      console.error('React.useMemo is not available');
      throw new Error('React.useMemo is not available');
    }
    return React.useMemo.apply(React, args);
  };
  
  window.useRef = function(...args) {
    if (!React.useRef) {
      console.error('React.useRef is not available');
      throw new Error('React.useRef is not available');
    }
    return React.useRef.apply(React, args);
  };
  
  window.useReducer = function(...args) {
    if (!React.useReducer) {
      console.error('React.useReducer is not available');
      throw new Error('React.useReducer is not available');
    }
    return React.useReducer.apply(React, args);
  };
  
  window.createContext = function(...args) {
    if (!React.createContext) {
      console.error('React.createContext is not available');
      throw new Error('React.createContext is not available');
    }
    return React.createContext.apply(React, args);
  };
  
  // Create a special function to check if React is loaded
  window.isReactLoaded = function() {
    return !!window.React && !!window.React.useState;
  };
  
  // Create a special function to ensure React is loaded
  window.ensureReactLoaded = function() {
    if (!window.isReactLoaded()) {
      console.error('React is not properly loaded');
      throw new Error('React is not properly loaded');
    }
    return true;
  };
  
  // Log that React is properly loaded
  console.log('React loader: React is properly loaded and available globally');
}

// Export React to ensure it's included in the bundle
export default React; 