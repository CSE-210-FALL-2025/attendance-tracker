# CSE 210 Attendance Server

This is the serverless backend for the CSE 210 Attendance System, designed to be deployed on Vercel.

## Structure

```
server/
├── api/
│   ├── forms.js          # Main forms API endpoint
│   └── forms/
│       └── [id].js       # Individual form operations
├── db.json               # Database file
├── package.json          # Dependencies
├── vercel.json          # Vercel configuration
└── README.md            # This file
```

## API Endpoints

### Forms API (`/api/forms`)

- **GET** `/api/forms` - Get all forms and settings
- **POST** `/api/forms` - Add a new form
- **PUT** `/api/forms` - Update settings or set active form
- **DELETE** `/api/forms` - Delete a form (with ID in query)

### Individual Form API (`/api/forms/[id]`)

- **GET** `/api/forms/[id]` - Get specific form
- **PUT** `/api/forms/[id]` - Update specific form
- **DELETE** `/api/forms/[id]` - Delete specific form

## Deployment to Vercel

### Prerequisites

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

### Deploy

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Deploy to Vercel:
   ```bash
   vercel --prod
   ```

3. Follow the prompts to configure your deployment

### Environment Variables

No environment variables are required for this deployment.

## Local Development

1. Install dependencies:
   ```bash
   cd server
   npm install
   ```

2. Start local development server:
   ```bash
   vercel dev
   ```

3. The API will be available at `http://localhost:3000/api`

## Database

The system uses a simple JSON file (`db.json`) as the database. The file structure is:

```json
{
  "forms": [
    {
      "id": 1,
      "name": "Form Name",
      "url": "https://form.url",
      "sheetUrl": "https://sheet.url",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "isActive": true
    }
  ],
  "settings": {
    "currentFormIndex": 0,
    "qrRefreshInterval": 5000,
    "autoRefreshEnabled": true
  },
  "sessions": [],
  "attendance": []
}
```

## CORS

The API includes CORS headers to allow cross-origin requests from your frontend application.

## Error Handling

All endpoints include proper error handling and return JSON responses with success/error status.

## Frontend Integration

After deployment, update the `baseURL` in your frontend `api-client.js` file:

```javascript
this.baseURL = 'https://your-vercel-app.vercel.app/api';
```

## Limitations

- The database is stored as a JSON file, so it's not suitable for high-traffic applications
- File system operations are used, which work well with Vercel's serverless functions
- No authentication is implemented (add if needed for production)

## Support

For issues or questions, please check the main project documentation or create an issue in the repository.
