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

echo "Backend preparation complete."
echo "Deploy to Railway using one of these methods:"
echo "1. Push to your GitHub repository if you've set up automatic deployments"
echo "2. Use Railway CLI: railway up"
echo "3. Use the Railway dashboard to manually deploy" 