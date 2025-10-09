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
- Node.js (v14 or higher)
- npm (comes with Node.js)

### Installation & Setup

1. **Clone or download this repository**
   ```bash
   cd "CSE 210 - TA"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm start
   ```
   
   Or use the startup script:
   ```bash
   ./start.sh
   ```

4. **Access the application**
   - **Main App**: http://localhost:3000
   - **Admin Panel**: http://localhost:3000/admin

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

## Customization

### Changing QR Code Refresh Rate

Edit `public/index.html` and modify the refresh interval:
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

## Development

### Running in Development Mode
```bash
npm run dev
```
This uses nodemon to automatically restart the server when files change.

### Environment Variables
- `PORT`: Server port (default: 3000)
- Set with: `PORT=8080 npm start`

## License

This project is open source and available under the MIT License.
