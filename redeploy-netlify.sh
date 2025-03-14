#!/bin/bash

# Check if debug mode is enabled
DEBUG_MODE=0
if [ "$1" == "--debug" ]; then
  DEBUG_MODE=1
  echo "Running in DEBUG mode"
fi

echo "Preparing for Netlify deployment..."

# Ensure the vite.config.js has the correct path for BookingContext
echo "Checking vite.config.js..."
if grep -q "'/src/frontend/contexts/BookingContext.jsx'" vite.config.js; then
  echo "Fixing path in vite.config.js..."
  sed -i "s|'/src/frontend/contexts/BookingContext.jsx'|'./contexts/BookingContext.jsx'|g" vite.config.js
  echo "Path fixed in vite.config.js"
fi

# If in debug mode, create a backup of App.jsx and use the debug version
if [ $DEBUG_MODE -eq 1 ]; then
  echo "Creating debug version of the application..."
  if [ ! -f "src/frontend/App.jsx.bak" ]; then
    cp src/frontend/App.jsx src/frontend/App.jsx.bak
    echo "Backup of App.jsx created"
  fi
  
  # Create a debug version of App.jsx
  cat > src/frontend/App.jsx << EOL
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
      setError(\`Error loading env vars: \${err.message}\`);
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
EOL
  echo "Debug version of App.jsx created"
fi

# Ensure netlify.toml exists and is correct
echo "Checking netlify.toml..."
cat > netlify.toml << EOL
[build]
  base = "/"
  command = "cd src/frontend && npm install && npm run build"
  publish = "src/frontend/dist"

[build.environment]
  NODE_VERSION = "16"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "*.css"
  [headers.values]
    Content-Type = "text/css"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    Cache-Control = "public, max-age=3600"
EOL
echo "netlify.toml updated"

# Building frontend
echo "Building frontend for Netlify deployment..."
cd src/frontend
npm install
npm run build

echo "Ensuring _redirects file is in the dist directory..."
cp _redirects dist/ 2>/dev/null || cp public/_redirects dist/ 2>/dev/null || echo "/* /index.html 200" > dist/_redirects

echo "Ensuring netlify.toml is in the dist directory..."
cp ../netlify.toml dist/ 2>/dev/null || cat > dist/netlify.toml << EOL
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
EOL

# If in debug mode, add a debug.html file
if [ $DEBUG_MODE -eq 1 ]; then
  echo "Adding debug.html to dist directory..."
  cat > dist/debug.html << EOL
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Debug Info</title>
  <style>
    body { font-family: monospace; padding: 20px; }
    .container { max-width: 800px; margin: 0 auto; }
    .card { border: 1px solid #ccc; padding: 15px; margin-bottom: 15px; border-radius: 5px; }
    pre { background: #f5f5f5; padding: 10px; overflow: auto; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Deployment Debug Info</h1>
    
    <div class="card">
      <h2>Environment Variables</h2>
      <p>Check if your environment variables are correctly set in Netlify:</p>
      <ul>
        <li>VITE_API_URL: Should point to your Railway backend URL</li>
      </ul>
    </div>
    
    <div class="card">
      <h2>Common Issues</h2>
      <ul>
        <li>White screen: Check browser console for JavaScript errors</li>
        <li>404 errors: Make sure _redirects file is in the dist directory</li>
        <li>API connection issues: Verify CORS settings in your backend</li>
      </ul>
    </div>
    
    <div class="card">
      <h2>Navigation</h2>
      <ul>
        <li><a href="/">Home Page</a></li>
        <li><a href="/booking">Booking Page</a></li>
      </ul>
    </div>
  </div>
  
  <script>
    // Log environment variables
    console.log('Debug page loaded');
    document.addEventListener('DOMContentLoaded', function() {
      const envSection = document.querySelector('.card:first-of-type');
      const envInfo = document.createElement('pre');
      envInfo.textContent = 'Checking environment variables...';
      envSection.appendChild(envInfo);
      
      try {
        // This will only work if the script is loaded as a module
        const envVars = {
          'VITE_API_URL': window.VITE_API_URL || 'Not available in this context'
        };
        envInfo.textContent = JSON.stringify(envVars, null, 2);
      } catch (err) {
        envInfo.textContent = 'Error checking environment variables: ' + err.message;
      }
    });
  </script>
</body>
</html>
EOL
  echo "debug.html added to dist directory"
fi

echo "Build complete. Deploy the 'dist' directory to Netlify."
echo "You can do this by:"
echo "1. Using the Netlify CLI: netlify deploy --dir=src/frontend/dist --prod"
echo "2. Pushing to your GitHub repository if you've set up automatic deployments"
echo "3. Manually deploying through the Netlify dashboard"
echo ""
echo "IMPORTANT: Make sure to set the VITE_API_URL environment variable in Netlify to point to your Railway backend URL"

# If in debug mode, provide instructions to restore the original App.jsx
if [ $DEBUG_MODE -eq 1 ]; then
  echo ""
  echo "DEBUG MODE: To restore the original App.jsx, run:"
  echo "mv src/frontend/App.jsx.bak src/frontend/App.jsx"
fi 