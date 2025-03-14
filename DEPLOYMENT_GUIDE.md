# Barber Booking Application Deployment Guide

This guide provides step-by-step instructions for deploying the Barber Booking application, with the frontend on Netlify and the backend on Railway.

## Prerequisites

- GitHub account
- Netlify account
- Railway account
- Node.js and npm installed locally

## Frontend Deployment (Netlify)

### Option 1: Deploy via Netlify Dashboard

1. **Build the frontend**:
   ```bash
   ./redeploy-netlify.sh
   ```
   This script will:
   - Build the frontend application
   - Ensure the `_redirects` file is in the `dist` directory
   - Ensure the `netlify.toml` file is in the `dist` directory

2. **Deploy to Netlify**:
   - Go to [Netlify](https://app.netlify.com/)
   - Drag and drop the `src/frontend/dist` folder to Netlify's deploy area
   - Or use the "Sites" section and click "New site from Git"
   - Connect to your GitHub repository
   - Set build command to `npm run build`
   - Set publish directory to `dist`

3. **Configure environment variables**:
   - In the Netlify dashboard, go to Site settings > Build & deploy > Environment
   - Add the following environment variable:
     - `VITE_API_URL`: Your Railway backend URL (e.g., https://your-app-name.railway.app)

### Option 2: Deploy via Netlify CLI

1. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**:
   ```bash
   netlify login
   ```

3. **Build and deploy**:
   ```bash
   ./redeploy-netlify.sh
   netlify deploy --dir=src/frontend/dist --prod
   ```

## Backend Deployment (Railway)

### Option 1: Deploy via Railway Dashboard

1. **Prepare the backend**:
   ```bash
   ./redeploy-railway.sh
   ```
   This script will:
   - Install dependencies
   - Ensure the Procfile exists
   - Check for the .env file

2. **Deploy to Railway**:
   - Go to [Railway](https://railway.app/)
   - Create a new project
   - Connect to your GitHub repository
   - Set the root directory to `src/backend`
   - Set the start command to `npm start`

3. **Configure environment variables**:
   - In the Railway dashboard, go to your project > Variables
   - Add the following environment variables:
     - `PORT`: 3001
     - `FRONTEND_URL`: Your Netlify frontend URL (e.g., https://your-app.netlify.app)
     - `GOOGLE_CLIENT_ID`: Your Google API client ID
     - `GOOGLE_CLIENT_SECRET`: Your Google API client secret
     - `GOOGLE_REDIRECT_URI`: Your redirect URI
     - `GOOGLE_REFRESH_TOKEN`: Your refresh token
     - `EMAIL_USER`: Your email address for sending notifications
     - `EMAIL_PASS`: Your email password or app password
     - `CALENDAR_ID`: Your Google Calendar ID
     - `GOOGLE_CLIENT_EMAIL`: The client_email from your service-account-key.json
     - `GOOGLE_PRIVATE_KEY`: The private_key from your service-account-key.json (include all newlines and quotes)
     - Add any other environment variables your application needs

4. **Setting up Google Service Account credentials**:
   - Open your `service-account-key.json` file
   - Find the `client_email` field and copy its value to the `GOOGLE_CLIENT_EMAIL` environment variable
   - Find the `private_key` field and copy its entire value (including BEGIN/END lines and newlines) to the `GOOGLE_PRIVATE_KEY` environment variable
   - When adding the private key to Railway:
     - Go to Railway dashboard > Your project > Variables
     - Add a new variable named `GOOGLE_PRIVATE_KEY`
     - Paste the entire private key including BEGIN/END lines and newlines
     - Railway will handle the formatting correctly

### Option 2: Deploy via Railway CLI

1. **Install Railway CLI**:
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway**:
   ```bash
   railway login
   ```

3. **Link to your project**:
   ```bash
   railway link
   ```

4. **Deploy**:
   ```bash
   cd src/backend
   railway up
   ```

## Post-Deployment Steps

1. **Update frontend environment variables**:
   - Update the `VITE_API_URL` in the Netlify environment variables to point to your Railway backend URL

2. **Update backend environment variables**:
   - Update the `FRONTEND_URL` in the Railway environment variables to point to your Netlify frontend URL

3. **Test the application**:
   - Navigate to your Netlify URL
   - Ensure all features are working correctly
   - Test the booking functionality
   - Verify that emails are being sent
   - Check that Google Calendar events are being created

## Troubleshooting

### 404 Errors on Page Refresh
If you encounter 404 errors when refreshing pages on Netlify:
- Ensure the `_redirects` file is in the `dist` directory
- Verify the `netlify.toml` file has the correct redirect rules
- Check Netlify's deploy settings to ensure the publish directory is correct

### Backend Connection Issues
If the frontend cannot connect to the backend:
- Verify the `VITE_API_URL` is set correctly in Netlify
- Check that CORS is properly configured in the backend
- Ensure the Railway service is running

### Environment Variable Issues
If environment variables are not being loaded:
- Check the Railway dashboard to ensure all variables are set
- Verify the `.env` file format if using local development
- Redeploy the application after updating environment variables
- For Google service account issues:
  - Ensure both `GOOGLE_CLIENT_EMAIL` and `GOOGLE_PRIVATE_KEY` are set correctly
  - The private key should include all newlines and quotes
  - Check the server logs for any specific errors related to JWT client creation

## Maintenance

### Updating the Application
1. Make changes to your codebase
2. Push changes to GitHub
3. If automatic deployments are set up, the changes will be deployed automatically
4. Otherwise, run the redeploy scripts and follow the manual deployment steps

### Monitoring
- Use Netlify and Railway dashboards to monitor your application
- Check logs for any errors or issues
- Set up notifications for deployment failures

## Additional Resources
- [Netlify Documentation](https://docs.netlify.com/)
- [Railway Documentation](https://docs.railway.app/)
- [Vite Documentation](https://vitejs.dev/guide/)
- [React Router Documentation](https://reactrouter.com/en/main) 