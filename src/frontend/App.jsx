import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './Layout'

// Simple debug component
const DebugComponent = () => {
  const [apiUrl, setApiUrl] = useState('Not set');
  const [error, setError] = useState(null);
  
  useEffect(() => {
    try {
      // Check if environment variables are loaded
      setApiUrl(import.meta.env.VITE_API_URL || 'Not set');
    } catch (err) {
      setError(`Error loading env vars: ${err.message}`);
    }
  }, []);
  
  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Debug Page</h1>
      <p>This is a simplified version of the app to debug deployment issues.</p>
      
      <h2>Environment Variables:</h2>
      <p>VITE_API_URL: {apiUrl}</p>
      
      {error && (
        <div style={{ color: 'red', marginTop: '20px' }}>
          <h2>Error:</h2>
          <p>{error}</p>
        </div>
      )}
      
      <div style={{ marginTop: '20px' }}>
        <h2>Navigation:</h2>
        <ul>
          <li><a href="/" style={{ color: 'blue' }}>Home</a></li>
          <li><a href="/booking" style={{ color: 'blue' }}>Booking</a></li>
        </ul>
      </div>
    </div>
  );
};

// Simple home page
const SimpleHomePage = () => (
  <div style={{ padding: '20px', fontFamily: 'monospace' }}>
    <h1>Home Page</h1>
    <p>This is a simplified home page for debugging.</p>
    <a href="/booking" style={{ color: 'blue' }}>Go to Booking</a>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<SimpleHomePage />} />
          <Route path="/booking" element={<DebugComponent />} />
          <Route path="/debug" element={<DebugComponent />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
