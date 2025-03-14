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

# Check if server.js has proper error handling
echo "Checking server.js for proper error handling..."
if ! grep -q "process.on('SIGTERM'" server.js; then
  echo "Adding error handling to server.js..."
  
  # Create a backup of server.js
  cp server.js server.js.bak
  
  # Add error handling code to the end of the file
  cat >> server.js << EOL

// Add a global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error', 
    message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message 
  });
});

// Handle process signals gracefully
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received. Closing server gracefully...');
  // Close any database connections or other resources here
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received. Closing server gracefully...');
  // Close any database connections or other resources here
  process.exit(0);
});

// Monitor memory usage
const memoryMonitor = setInterval(() => {
  const memoryUsage = process.memoryUsage();
  console.log(\`Memory usage: RSS=\${Math.round(memoryUsage.rss / 1024 / 1024)}MB, Heap=\${Math.round(memoryUsage.heapUsed / 1024 / 1024)}/\${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB\`);
  
  // If memory usage is too high, log a warning
  if (memoryUsage.rss > 500 * 1024 * 1024) { // 500MB
    console.warn('WARNING: High memory usage detected');
  }
}, 60000); // Check every minute

// Clean up on exit
process.on('exit', () => {
  clearInterval(memoryMonitor);
  console.log('Server shutting down');
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  // Don't exit the process, just log the error
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled promise rejection:', reason);
  // Don't exit the process, just log the error
});
EOL
  
  echo "Error handling added to server.js"
fi

# Ensure CORS is properly configured
echo "Checking CORS configuration..."
if grep -q "app.use(cors(" server.js; then
  echo "CORS is configured. Make sure it includes your Netlify domain."
  echo "Current CORS configuration:"
  grep -A 5 "app.use(cors(" server.js
else
  echo "Warning: CORS configuration not found in server.js."
  echo "Make sure to add proper CORS configuration to allow requests from your Netlify domain."
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

echo "IMPORTANT: Memory and Performance Considerations"
echo "========================================================"
echo "1. Railway may terminate your app if it uses too much memory"
echo "2. Make sure your app responds to health checks at /api/health"
echo "3. Check Railway logs for any SIGTERM signals or memory warnings"
echo "4. Consider adding a memory limit to your Railway configuration"
echo "========================================================"

echo "Backend preparation complete."
echo "Deploy to Railway using one of these methods:"
echo "1. Push to your GitHub repository if you've set up automatic deployments"
echo "2. Use Railway CLI: railway up"
echo "3. Use the Railway dashboard to manually deploy" 