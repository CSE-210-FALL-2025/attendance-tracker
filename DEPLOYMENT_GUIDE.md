# Deployment Guide - CSE 210 Attendance System

This guide explains how to deploy both the frontend and backend components of the attendance system.

## Architecture Overview

- **Frontend**: Static HTML/CSS/JS files (deploy to GitHub Pages)
- **Backend**: Serverless API functions (deploy to Vercel)
- **Database**: JSON file stored on Vercel

## Step 1: Deploy Backend to Vercel

### Prerequisites

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Create a Vercel account at https://vercel.com

### Deploy Backend

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy to Vercel:
   ```bash
   vercel --prod
   ```

4. Follow the prompts:
   - Set up and deploy? **Y**
   - Which scope? Choose your account
   - Link to existing project? **N**
   - Project name: `cse210-attendance-server` (or your preferred name)
   - Directory: `./`
   - Override settings? **N**

5. Copy the deployment URL (e.g., `https://cse210-attendance-server.vercel.app`)

### Update Frontend Configuration

1. Open `api-client.js` in your project root
2. Update the `baseURL` to your Vercel deployment URL:

```javascript
this.baseURL = 'https://your-vercel-app.vercel.app/api';
```

Replace `your-vercel-app` with your actual Vercel app name.

## Step 2: Deploy Frontend to GitHub Pages

### Prerequisites

1. Create a GitHub repository
2. Push your frontend files to the repository

### Deploy to GitHub Pages

1. Go to your GitHub repository
2. Click **Settings** tab
3. Scroll down to **Pages** section
4. Under **Source**, select **Deploy from a branch**
5. Choose **main** branch and **/ (root)** folder
6. Click **Save**

Your site will be available at: `https://yourusername.github.io/repository-name`

## Step 3: Test the Integration

1. **Test Backend API**:
   - Visit: `https://your-vercel-app.vercel.app/api/forms`
   - Should return JSON with forms data

2. **Test Frontend**:
   - Visit your GitHub Pages URL
   - Try adding a form in the instructor dashboard
   - Check if it appears in the forms list

## File Structure After Deployment

```
Your Project/
├── Frontend (GitHub Pages)
│   ├── index.html
│   ├── instructor-dashboard/
│   ├── admin-dashboard/
│   ├── styles.css
│   └── api-client.js (updated with Vercel URL)
│
└── Backend (Vercel)
    ├── api/
    │   ├── forms.js
    │   └── forms/[id].js
    ├── db.json
    ├── package.json
    └── vercel.json
```

## API Endpoints

Your Vercel deployment provides these endpoints:

- `GET /api/forms` - Get all forms
- `POST /api/forms` - Add new form
- `PUT /api/forms` - Update settings/set active form
- `DELETE /api/forms?id=123` - Delete form
- `GET /api/forms/123` - Get specific form
- `PUT /api/forms/123` - Update specific form
- `DELETE /api/forms/123` - Delete specific form

## Environment Configuration

### Development
- Frontend: `http://localhost:3000` (if using local server)
- Backend: `http://localhost:3000/api` (Vercel dev)

### Production
- Frontend: `https://yourusername.github.io/repository-name`
- Backend: `https://your-vercel-app.vercel.app/api`

## Troubleshooting

### Common Issues

1. **CORS Errors**:
   - Ensure your Vercel deployment URL is correct in `api-client.js`
   - Check that CORS headers are set in the API functions

2. **API Not Found**:
   - Verify the Vercel deployment is successful
   - Check the API endpoint URLs

3. **Forms Not Loading**:
   - Check browser console for errors
   - Verify the API client is making requests to the correct URL

### Debugging

1. **Check Vercel Logs**:
   ```bash
   vercel logs your-app-name
   ```

2. **Test API Directly**:
   - Use browser or Postman to test API endpoints
   - Check response format and status codes

3. **Frontend Console**:
   - Open browser developer tools
   - Check for JavaScript errors
   - Monitor network requests

## Security Considerations

- The API has no authentication (add if needed for production)
- CORS is configured to allow all origins (restrict for production)
- Database is stored as JSON file (consider database for production)

## Scaling

For production use with many users:
- Consider using a proper database (MongoDB, PostgreSQL)
- Add authentication and authorization
- Implement rate limiting
- Add input validation and sanitization

## Support

If you encounter issues:
1. Check the Vercel deployment logs
2. Verify all URLs are correct
3. Test API endpoints directly
4. Check browser console for frontend errors
