# QR Code Attendance Tracker

A serverless attendance tracking system using QR codes with anti-screenshot protection.

## Features

- **QR Code Generation**: Dynamic QR codes that refresh automatically
- **Anti-Screenshot Protection**: Unique patterns prevent screenshot-based cheating
- **Multiple Dashboards**: Student, Instructor, and Admin views
- **Google Forms Integration**: Seamless integration with Google Forms and Sheets
- **Serverless Architecture**: Deployed on Vercel with automatic scaling

## Quick Start

1. **Deploy to Vercel**:

   ```bash
   vercel
   ```

2. **Access the application**:
   - Student View: `/` (QR code scanner)
   - Instructor Dashboard: `/instructor-dashboard/`
   - Admin Dashboard: `/admin-dashboard/`

## Configuration

1. Add your Google Forms URL in the Instructor Dashboard
2. Optionally add Google Sheets URL for response tracking
3. Configure Google Sheets API key in `public/config.json`

## Local Development

```bash
npm install
vercel dev
```

## Architecture

- **Frontend**: Vanilla JavaScript with modern ES6+ features
- **Backend**: Vercel Serverless Functions
- **Database**: JSON file storage (consider upgrading to a proper database for production)
- **Deployment**: Vercel with automatic CI/CD

## API Endpoints

- `GET /api/forms` - Get all forms and settings
- `POST /api/forms` - Add a new form
- `PUT /api/forms` - Update form settings
- `DELETE /api/forms` - Remove a form
- `GET /api/pages` - Serve HTML pages
- `GET /api/assets` - Serve static assets

For detailed deployment instructions, see [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md).
