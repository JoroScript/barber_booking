#!/bin/bash

echo "Preparing for Netlify deployment..."

# Ensure the vite.config.js has the correct path for BookingContext
echo "Checking vite.config.js..."
if grep -q "'/src/frontend/contexts/BookingContext.jsx'" vite.config.js; then
  echo "Fixing path in vite.config.js..."
  sed -i "s|'/src/frontend/contexts/BookingContext.jsx'|'./contexts/BookingContext.jsx'|g" vite.config.js
  echo "Path fixed in vite.config.js"
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

echo "Build complete. Deploy the 'dist' directory to Netlify."
echo "You can do this by:"
echo "1. Using the Netlify CLI: netlify deploy --dir=src/frontend/dist --prod"
echo "2. Pushing to your GitHub repository if you've set up automatic deployments"
echo "3. Manually deploying through the Netlify dashboard"
echo ""
echo "IMPORTANT: Make sure to set the VITE_API_URL environment variable in Netlify to point to your Railway backend URL" 