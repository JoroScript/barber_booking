#!/bin/bash

echo "Building frontend for Netlify deployment..."
cd src/frontend
npm run build

echo "Ensuring _redirects file is in the dist directory..."
cp _redirects dist/ 2>/dev/null || cp public/_redirects dist/ 2>/dev/null || echo "/* /index.html 200" > dist/_redirects

echo "Ensuring netlify.toml is in the dist directory..."
cp netlify.toml dist/ 2>/dev/null || cat > dist/netlify.toml << EOL
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
EOL

echo "Build complete. Deploy the 'dist' directory to Netlify."
echo "You can do this by dragging and dropping the 'src/frontend/dist' folder to Netlify's deploy area."
echo "Or by using the Netlify CLI: netlify deploy --dir=src/frontend/dist --prod" 