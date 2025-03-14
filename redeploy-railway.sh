#!/bin/bash

echo "Preparing backend for Railway deployment..."
cd src/backend

# Ensure all dependencies are installed
echo "Installing dependencies..."
npm install

# Ensure Procfile exists
if [ ! -f "Procfile" ]; then
  echo "Creating Procfile..."
  echo "web: node server.js" > Procfile
fi

# Ensure .env file is properly set up
if [ ! -f ".env" ]; then
  echo "Warning: No .env file found in backend directory."
  echo "Make sure to set up environment variables in Railway dashboard."
fi

echo "========================================================"
echo "IMPORTANT: Google Service Account Setup for Railway"
echo "========================================================"
echo "You need to set the following environment variables in Railway:"
echo "1. GOOGLE_CLIENT_EMAIL - The email from your service account"
echo "2. GOOGLE_PRIVATE_KEY - The private key from your service account"
echo ""
echo "To get these values from your service-account-key.json file:"
echo "- GOOGLE_CLIENT_EMAIL: Use the 'client_email' value"
echo "- GOOGLE_PRIVATE_KEY: Use the 'private_key' value (keep all newlines and quotes)"
echo ""
echo "When adding the GOOGLE_PRIVATE_KEY to Railway:"
echo "1. Go to Railway dashboard > Your project > Variables"
echo "2. Add a new variable named GOOGLE_PRIVATE_KEY"
echo "3. Paste the entire private key including BEGIN/END lines and newlines"
echo "4. Railway will handle the formatting correctly"
echo "========================================================"

echo "Backend preparation complete."
echo "Deploy to Railway using one of these methods:"
echo "1. Push to your GitHub repository if you've set up automatic deployments"
echo "2. Use Railway CLI: railway up"
echo "3. Use the Railway dashboard to manually deploy" 