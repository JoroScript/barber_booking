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

# Fix React configuration in vite.config.js
echo "Updating React configuration in vite.config.js..."
if ! grep -q "'window.React': 'React'" vite.config.js; then
  # Add React configuration
  sed -i "s|plugins: \[tailwindcss(), react()\],|plugins: [\n    react(),\n    tailwindcss()\n  ],|g" vite.config.js
  
  # Add define section if it doesn't exist
  if ! grep -q "define: {" vite.config.js; then
    sed -i "/experimental: {/a \\\n  // Define global variables\n  define: {\n    // Ensure React is available globally\n    'window.React': 'React',\n    // Make process.env available\n    'process.env': process.env,\n    // Add React.useState and other hooks to global scope\n    'window.useState': 'React.useState',\n    'window.useEffect': 'React.useEffect',\n    'window.useContext': 'React.useContext',\n    'window.useCallback': 'React.useCallback',\n    'window.useMemo': 'React.useMemo',\n    'window.useRef': 'React.useRef'\n  }," vite.config.js
  fi
  
  # Add rollupOptions.external if it doesn't exist
  if ! grep -q "rollupOptions: {" vite.config.js; then
    sed -i "/build: {/a \\\n    rollupOptions: {\n      external: [\n        // External dependencies that should be excluded from the bundle\n      ],\n    }," vite.config.js
  fi
  
  # Enable sourcemaps for debugging
  sed -i "s|sourcemap: false,|sourcemap: true, // Enable for debugging|g" vite.config.js
  
  # Don't remove console logs for debugging
  sed -i "s|drop_console: true,|drop_console: false,|g" vite.config.js
  sed -i "s|drop_debugger: true,|drop_debugger: false,|g" vite.config.js
  sed -i "s|pure_funcs: \['console.log', 'console.info', 'console.debug'\]|pure_funcs: []|g" vite.config.js
  
  # Add react-calendar to optimizeDeps
  if ! grep -q "'react-calendar'" vite.config.js; then
    sed -i "s|include: \['react', 'react-dom', 'react-router-dom', 'luxon', 'axios'\]|include: ['react', 'react-dom', 'react-router-dom', 'luxon', 'axios', 'react-calendar', 'react-toastify']|g" vite.config.js
  fi
  
  echo "React configuration updated in vite.config.js"
fi

# Fix the path to main.jsx in index.html
echo "Checking index.html for correct main.jsx path..."
if grep -q 'src="/src/main.jsx"' src/frontend/index.html; then
  echo "Fixing path to main.jsx in index.html..."
  sed -i 's|src="/src/main.jsx"|src="./main.jsx"|g' src/frontend/index.html
  echo "Path fixed in index.html"
fi

# Fix import.meta usage in index.html
echo "Checking index.html for import.meta usage..."
if grep -q "import.meta.env" src/frontend/index.html && ! grep -q '<script type="module">' src/frontend/index.html; then
  echo "Fixing import.meta usage in index.html..."
  # Move the environment variables logging to a module script
  sed -i '/Log environment variables/,/};/d' src/frontend/index.html
  # Add module script at the end of body
  cat > temp_script.html << EOL
    <!-- Module script for environment variables -->
    <script type="module">
      // Log environment variables (without sensitive data)
      console.log('Environment variables:', {
        VITE_API_URL: import.meta.env.VITE_API_URL || 'Not set'
      });
    </script>
EOL
  sed -i '/<script type="module" src="\.\/main\.jsx"><\/script>/r temp_script.html' src/frontend/index.html
  rm temp_script.html
  echo "import.meta usage fixed in index.html"
fi

# Fix Tailwind CSS import in index.css
echo "Checking index.css for correct Tailwind CSS import..."
if grep -q '@import "tailwindcss"' src/frontend/index.css; then
  echo "Fixing Tailwind CSS import in index.css..."
  sed -i '1s|@import "tailwindcss"|@tailwind base;\n@tailwind components;\n@tailwind utilities|' src/frontend/index.css
  echo "Tailwind CSS import fixed in index.css"
fi

# Fix import order in index.css
echo "Checking index.css for correct import order..."
if ! grep -q '\/\* Import other CSS files \*\/' src/frontend/index.css; then
  echo "Fixing import order in index.css..."
  sed -i 's|@tailwind utilities;\n@import|@tailwind utilities;\n\n/* Import other CSS files */\n@import|g' src/frontend/index.css
  echo "Import order fixed in index.css"
fi

# Fix main.jsx to ensure React is properly loaded
echo "Checking main.jsx for proper React loading..."
if grep -q "import \"./react-import-helper.js\";" src/frontend/main.jsx; then
  echo "Fixing React imports in main.jsx..."
  # Create a new main.jsx file with proper imports
  cat > src/frontend/main.jsx.new << EOL
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
      console.log(\`App loaded in: \${Math.round(timing.domComplete - timing.startTime)}ms\`);
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
        rootElement.innerHTML = \`
          <div style="display: flex; align-items: center; justify-content: center; height: 100vh; width: 100vw; background-color: #1f2937;">
            <div style="text-align: center; color: white;">
              <h1 style="margin-bottom: 20px;">Error Loading Application</h1>
              <p>There was an error loading React. Please try refreshing the page.</p>
              <button style="margin-top: 20px; padding: 10px 20px; background-color: #f59e0b; color: black; border: none; border-radius: 5px; cursor: pointer;" onclick="window.location.reload()">
                Refresh Page
              </button>
            </div>
          </div>
        \`;
      }
    }
  }).catch(error => {
    console.error('Error loading React loader:', error);
    
    // Show error message
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.innerHTML = \`
        <div style="display: flex; align-items: center; justify-content: center; height: 100vh; width: 100vw; background-color: #1f2937;">
          <div style="text-align: center; color: white;">
            <h1 style="margin-bottom: 20px;">Error Loading Application</h1>
            <p>There was an error loading React. Please try refreshing the page.</p>
            <button style="margin-top: 20px; padding: 10px 20px; background-color: #f59e0b; color: black; border: none; border-radius: 5px; cursor: pointer;" onclick="window.location.reload()">
              Refresh Page
            </button>
          </div>
        </div>
      \`;
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
EOL
  mv src/frontend/main.jsx.new src/frontend/main.jsx
  echo "React imports fixed in main.jsx"
fi

# Ensure tailwind.config.js exists
echo "Checking for tailwind.config.js..."
if [ ! -f "src/frontend/tailwind.config.js" ]; then
  echo "Creating tailwind.config.js..."
  cat > src/frontend/tailwind.config.js << EOL
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./contexts/**/*.{js,jsx}",
    "./utilities/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#f59e0b',
        'secondary': '#111827',
      },
    },
  },
  plugins: [],
}
EOL
  echo "tailwind.config.js created"
else
  # Update existing tailwind.config.js to fix content pattern
  echo "Updating tailwind.config.js content pattern..."
  sed -i 's|content: \["./**/*.{js,ts,jsx,tsx}"\]|content: \["./index.html", "./*.{js,jsx}", "./components/**/*.{js,jsx}", "./contexts/**/*.{js,jsx}", "./utilities/**/*.{js,jsx}"\]|g' src/frontend/tailwind.config.js
  echo "tailwind.config.js updated"
fi

# Ensure postcss.config.js exists
echo "Checking for postcss.config.js..."
if [ ! -f "src/frontend/postcss.config.js" ]; then
  echo "Creating postcss.config.js..."
  cat > src/frontend/postcss.config.js << EOL
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOL
  echo "postcss.config.js created"
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
import React from 'react'
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
  NPM_FLAGS = "--legacy-peer-deps"

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

# Create a React import helper file
echo "Creating React import helper..."
cat > react-import-helper.js << EOL
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
EOL
echo "React import helper created"

# Update main.jsx to import the helper
if ! grep -q "import './react-import-helper.js'" main.jsx; then
  sed -i '1s/^/import ".\/react-import-helper.js";\n/' main.jsx
  echo "Added React import helper to main.jsx"
fi

# Create a simplified vite.config.js
echo "Creating simplified vite.config.js..."
cat > vite.config.js << EOL
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from 'tailwindcss'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  
  // Define global variables
  define: {
    // Ensure React is available globally
    'window.React': 'React',
    // Make process.env available
    'process.env': process.env
  },
  
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui': ['react-calendar', 'react-toastify']
        }
      }
    }
  },
  
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'luxon', 'axios', 'react-calendar', 'react-toastify']
  },
  
  resolve: {
    alias: {
      './contexts/BookingContext.jsx': './contexts/BookingContext.jsx'
    }
  }
})
EOL
echo "vite.config.js created"

# Install required dependencies
echo "Installing required dependencies..."
npm install react-toastify@latest --save
npm install @babel/plugin-transform-react-jsx --save-dev

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
        <li>React not defined: Check if React is properly imported</li>
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