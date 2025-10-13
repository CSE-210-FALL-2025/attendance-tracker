# Secure QR Attendance System

A complete web application for managing attendance using QR codes with both client and server logic. Students scan QR codes to mark their attendance through a secure, time-limited system.

## Features

- 🔄 **Dynamic QR Codes**: QR codes refresh every 5 seconds for security
- 🔒 **Secure Sessions**: Each session has unique, time-limited tokens
- 📱 **Mobile Friendly**: Students can scan with their phone camera
- 🎨 **Modern UI**: Beautiful, responsive design with glassmorphism effects
- ⚡ **Real-time**: Live attendance tracking and session management
- 👨‍💼 **Admin Panel**: View attendance records for all sessions
- 🛡️ **Duplicate Prevention**: Prevents students from marking attendance twice
- 📊 **Session Management**: Create new sessions and track attendance

## Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm (comes with Node.js)
- Vercel CLI (for deployment): `npm install -g vercel`

### Installation & Setup

#### Option 1: Deploy to Vercel (Recommended)

1. **Clone or download this repository**

   ```bash
   git clone <your-repo-url>
   cd attendance-tracker
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Deploy to Vercel**

   ```bash
   # Login to Vercel
   vercel login

   # Deploy
   vercel

   # Deploy to production
   vercel --prod
   ```

4. **Access your deployed application**
   - Your app will be available at `https://your-app-name.vercel.app`
   - **Main App**: `/` (Student QR Scanner)
   - **Instructor Dashboard**: `/instructor-dashboard/`
   - **Admin Dashboard**: `/admin-dashboard/`

#### Option 2: Local Development

1. **Clone or download this repository**

   ```bash
   git clone <your-repo-url>
   cd attendance-tracker
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start local development server**

   ```bash
   vercel dev
   # Access at http://localhost:3000
   ```

4. **Access the application**
   - **Main App**: `http://localhost:3000` (Student QR Scanner)
   - **Instructor Dashboard**: `http://localhost:3000/instructor-dashboard/`
   - **Admin Dashboard**: `http://localhost:3000/admin-dashboard/`

### Alternative Setup Methods

#### Option A: Using the Startup Script

```bash
chmod +x start.sh
./start.sh
```

#### Option B: Manual Start

```bash
npm install
npm start
```

#### Option C: Development Mode (with auto-restart)

```bash
npm install
npm run dev
```

## How It Works

### For Instructors:

1. **Start Session**: Open the main app and create a new session
2. **Display QR Code**: Show the QR code on a screen/projector
3. **Monitor**: QR codes automatically refresh every 5 seconds
4. **View Results**: Check the admin panel to see attendance records

### For Students:

1. **Scan QR Code**: Use phone camera to scan the displayed QR code
2. **Fill Form**: Complete the attendance form with name, student ID, and email
3. **Submit**: Confirm attendance submission
4. **Done**: Receive confirmation and close the page

### Security Features:

- **Time-limited QR codes**: Each QR code expires after 5 seconds
- **Single-use tokens**: Each QR code can only be used once
- **Session isolation**: Each session has unique, non-reusable identifiers
- **Duplicate prevention**: Students cannot mark attendance twice in the same session

## API Endpoints

The server provides several REST API endpoints:

- `POST /api/session/new` - Create a new attendance session
- `GET /api/session/:sessionId/nonce` - Get a new QR code for a session
- `GET /api/session/:sessionId/attendance` - Get attendance records for a session
- `GET /api/sessions` - Get all sessions
- `GET /attend?nonce=...` - Student attendance form (accessed via QR code)
- `POST /submit-attendance` - Submit attendance data
- `GET /admin` - Admin panel for viewing attendance

## Configuration

### Google Sheets API Setup

1. **Get a Google Sheets API Key**:

   - Go to [Google Cloud Console](https://console.developers.google.com/)
   - Create a new project or select an existing one
   - Enable the Google Sheets API
   - Create credentials (API Key)
   - Copy your API key

2. **Configure the application**:

   ```bash
   # Copy the example configuration
   cp config.example.json config.json

   # Edit config.json and replace YOUR_GOOGLE_SHEETS_API_KEY_HERE with your actual API key
   ```

3. **Configure your Google Sheets**:
   - Make sure your Google Sheets are publicly viewable or shared with the service account
   - The API key needs read access to your Google Sheets

### Configuration File Structure

The `config.json` file contains:

```json
{
  "googleSheets": {
    "apiKey": "your_api_key_here"
  },
  "app": {
    "name": "CSE 210 Attendance System",
    "version": "1.0.0",
    "qrRefreshInterval": 5000
  }
}
```

## Customization

### Changing QR Code Refresh Rate

Edit `config.json` and modify the refresh interval:

```json
{
  "app": {
    "qrRefreshInterval": 10000 // Change to 10 seconds
  }
}
```

Or edit the HTML files directly:

```javascript
this.refreshInterval = 5000; // Change from 5 seconds to desired time
```

### Modifying Session Duration

Edit `server.js` and change the nonce TTL:

```javascript
function generateNonceForSession(sessionId, ttlMs = 5000) {
  // Change 5000 to desired milliseconds
}
```

### Styling

Modify `styles.css` to change colors, fonts, or layout. The app uses a modern glassmorphism design with CSS gradients and backdrop filters.

### Database Integration

Currently, the app uses in-memory storage. To persist data, you can:

1. Replace the Map objects with a database (MongoDB, PostgreSQL, etc.)
2. Add database connection logic in `server.js`
3. Update the session and attendance storage functions

## File Structure

```
├── server.js           # Express server with API endpoints
├── package.json        # Node.js dependencies and scripts
├── start.sh           # Startup script for easy deployment
├── public/
│   └── index.html     # Main client application
├── styles.css         # CSS styling (served by Express)
└── README.md          # This documentation
```

## Dependencies

### Server Dependencies:

- **express**: Web server framework
- **cors**: Cross-origin resource sharing
- **uuid**: Unique identifier generation
- **body-parser**: Request body parsing

### Client Dependencies:

- **QRCode.js**: QR code generation (loaded via CDN)

## Browser Compatibility

- ✅ Chrome/Chromium (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting

### Server Won't Start

- Ensure Node.js is installed (`node --version`)
- Check if port 3000 is available
- Verify all dependencies are installed (`npm install`)

### QR Code Not Generating

- Check browser console for errors
- Ensure QRCode library is loading from CDN
- Verify server is running and accessible

### Students Can't Access Attendance Form

- Check that the server is accessible from student devices
- Verify the QR code contains the correct URL
- Ensure students are on the same network (for local development)

### Mobile Scanning Issues

- Ensure good lighting conditions
- Hold phone steady and at appropriate distance
- Try different angles if QR code doesn't scan
- Use phone's built-in camera app for best results

### Attendance Not Recording

- Check server console for error messages
- Verify all form fields are filled correctly
- Ensure the QR code hasn't expired (5-second limit)

## Deployment

### Vercel Deployment (Recommended)

This application is optimized for deployment on Vercel. See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for detailed instructions.

**Quick Deploy:**

```bash
# Install Vercel CLI
npm install -g vercel

# Login and deploy
vercel login
vercel
vercel --prod
```

### Other Deployment Options

- **Netlify**: Can be deployed as static site with serverless functions
- **Railway**: Can deploy the Express app directly
- **Heroku**: Traditional hosting with buildpacks

## Development

### Running in Development Mode

```bash
# Using Vercel CLI (recommended)
vercel dev

# Or using npm scripts
npm run dev
```

### Environment Variables

- `PORT`: Server port (default: 3000)
- Set with: `PORT=8080 npm start`

## License

This project is open source and available under the MIT License.
