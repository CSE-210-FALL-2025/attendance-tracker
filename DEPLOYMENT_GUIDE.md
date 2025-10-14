# Vercel Deployment Guide

This project has been converted to use Vercel's serverless functions architecture for optimal deployment.

## Project Structure

```
├── api/
│   ├── forms.js      # Handles form CRUD operations
│   ├── pages.js      # Serves HTML pages
│   └── assets.js     # Serves static assets (JS, CSS, images)
├── public/
│   ├── index.html    # Student view
│   ├── admin-dashboard/
│   ├── instructor-dashboard/
│   ├── *.js          # Client-side JavaScript
│   ├── styles.css    # Styles
│   └── config.json   # Configuration
├── vercel.json       # Vercel configuration
└── db.json          # Database file (auto-created)
```

## Deployment Steps

1. **Install Vercel CLI** (if not already installed):

   ```bash
   npm install -g vercel
   ```

2. **Deploy to Vercel**:

   ```bash
   vercel
   ```

   Follow the prompts to link your project to Vercel.

3. **For production deployment**:
   ```bash
   vercel --prod
   ```

## Local Development

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Start local development server**:
   ```bash
   npm run dev
   ```
   This will start Vercel's development server at `http://localhost:3000`

## Key Changes Made

### Serverless Architecture

- Converted Express server to Vercel serverless functions
- Each API endpoint is now a separate function in the `/api` directory
- Static files are served through the `/api/assets` endpoint

### API Endpoints

- `GET /api/forms` - Get all forms and settings
- `POST /api/forms` - Add a new form
- `PUT /api/forms` - Update form settings or set active form
- `DELETE /api/forms` - Remove a form
- `GET /api/pages?page=student|instructor|admin` - Serve HTML pages
- `GET /api/assets?asset=filename` - Serve static assets

### Routing

- `/` → Student view (QR code scanner)
- `/instructor-dashboard/` → Instructor dashboard
- `/admin-dashboard/` → Admin dashboard

## Environment Variables

No environment variables are required for basic functionality. The Google Sheets API key is stored in `public/config.json`.

## Database

The application uses a simple JSON file (`db.json`) for data storage. This file is automatically created when the first API call is made.

## Troubleshooting

1. **Assets not loading**: Ensure all static files are in the `/public` directory
2. **API errors**: Check the Vercel function logs in the dashboard
3. **CORS issues**: CORS headers are set in each serverless function

## Performance Notes

- Serverless functions have cold start delays
- Static assets are cached for 1 hour
- Database operations are synchronous (consider upgrading to a proper database for production)
