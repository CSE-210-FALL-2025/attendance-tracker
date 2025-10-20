# Environment Variables Setup

## Required Environment Variables

### 1. GOOGLE_SHEETS_API_KEY
- **Purpose**: API key for accessing Google Sheets API (for reading only)
- **How to get**: 
  1. Go to [Google Cloud Console](https://console.cloud.google.com/)
  2. Create a new project or select existing one
  3. Enable the Google Sheets API
  4. Create credentials (API Key)
  5. Copy the API key

### 2. FORM_TRACKING_SHEET_URL
- **Purpose**: URL of the Google Sheet that will track form submissions
- **Format**: `https://docs.google.com/spreadsheets/d/SHEET_ID/edit#gid=0`
- **Setup**:
  1. Create a new Google Sheet
  2. Add headers in row 1: `Timestamp | Form Name | Form Link | Responses Link`
  3. Make the sheet publicly readable (or share with the service account)
  4. Copy the sheet URL

### 3. GOOGLE_APPS_SCRIPT_WEB_APP_URL (NEW)
- **Purpose**: URL of the Google Apps Script web app that handles writing to the sheet
- **Setup**: Follow the steps below to create the Google Apps Script

## Google Apps Script Setup (Required for Writing to Sheets)

Since Google Sheets API requires OAuth2 for writing (not just API keys), we use Google Apps Script as a bridge:

### Step 1: Create Google Apps Script
1. Go to [Google Apps Script](https://script.google.com/)
2. Click "New Project"
3. Replace the default code with the content from `google-apps-script.js` in this project
4. Save the project with a name like "Form Tracking Web App"

### Step 2: Deploy as Web App
1. Click "Deploy" → "New Deployment"
2. Choose "Web app" as the type
3. Set "Execute as" to "Me"
4. Set "Who has access" to "Anyone"
5. Click "Deploy"
6. Copy the Web App URL (it will look like: `https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec`)

### Step 3: Add Web App URL to Environment Variables
Add the Web App URL to your `.env.local` file as `GOOGLE_APPS_SCRIPT_WEB_APP_URL`

## Local Development Setup

Create a `.env.local` file in the project root:

```env
GOOGLE_SHEETS_API_KEY=your_api_key_here
FORM_TRACKING_SHEET_URL=https://docs.google.com/spreadsheets/d/your_sheet_id/edit#gid=0
GOOGLE_APPS_SCRIPT_WEB_APP_URL=https://script.google.com/macros/s/your_script_id/exec
```

## Vercel Deployment Setup

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add all three variables:
   - `GOOGLE_SHEETS_API_KEY`: your_api_key_here
   - `FORM_TRACKING_SHEET_URL`: https://docs.google.com/spreadsheets/d/your_sheet_id/edit#gid=0
   - `GOOGLE_APPS_SCRIPT_WEB_APP_URL`: https://script.google.com/macros/s/your_script_id/exec

## How It Works

When an instructor adds a new form through the admin dashboard, the system will:

1. Save the form to the local database
2. Send the form data to the Google Apps Script web app
3. The Google Apps Script appends a new row to the tracking Google Sheet with:
   - **Timestamp**: When the form was added
   - **Form Name**: The name entered by the instructor
   - **Form Link**: The Google Form URL
   - **Responses Link**: The Google Sheet URL for responses (if provided)

The Google Sheet update happens asynchronously and won't block the form submission if it fails.
