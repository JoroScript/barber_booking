// This file ensures React is available globally
import React from 'react';
window.React = React;

// Make React hooks available globally
window.useState = React.useState;
window.useEffect = React.useEffect;
window.useContext = React.useContext;
window.useCallback = React.useCallback;
window.useMemo = React.useMemo;
window.useRef = React.useRef;
