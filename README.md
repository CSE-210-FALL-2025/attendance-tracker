# 🎯 Student Interaction Tracker

A modern, serverless student interaction tracking system that uses dynamic QR codes with anti-screenshot protection to prevent cheating and ensure accurate class polling and attendance records.

![QR Code Attendance Tracker](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black)
![License](https://img.shields.io/badge/License-MIT-blue)

## ✨ Features

### 🔐 Anti-Cheat Protection

- **Dynamic QR Codes**: Automatically refresh every 5 seconds
- **Unique Patterns**: Each QR code has a unique visual pattern
- **Screenshot Prevention**: Students can't take screenshots to share codes

### 📊 Multiple Dashboard Views

- **Student View**: Clean QR code scanner interface
- **Instructor Dashboard**: Analytics and attendance results
- **Admin Dashboard**: Form management and QR code control

### 🔗 Google Integration

- **Google Forms**: Seamless integration with Google Forms
- **Google Sheets**: Automatic response tracking and analytics
- **Real-time Data**: Live attendance statistics

### 🚀 Modern Architecture

- **Serverless**: Built on Vercel serverless functions
- **No Database Required**: Uses JSON file storage
- **Auto-scaling**: Handles any number of concurrent users
- **Fast Deployment**: One-click deployment to Vercel

## 🚀 Quick Start

### Option 1: Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/attendance-tracker)

1. Click the deploy button above
2. Set up your environment variables (see Configuration section)
3. Access your deployed application

### Option 2: Manual Deployment

```bash
# Clone the repository
git clone https://github.com/your-username/attendance-tracker.git
cd attendance-tracker

# Install dependencies
npm install

# Deploy to Vercel
vercel
```

## 🌐 Application URLs

After deployment, access your application at:

- **Student View**: `https://your-app.vercel.app/` - QR code scanner
- **Instructor Dashboard**: `https://your-app.vercel.app/instructor/` - Analytics & results
- **Admin Dashboard**: `https://your-app.vercel.app/admin/` - Form management

## 🛠️ Local Development

```bash
# Install dependencies
npm install

# Start local development server
vercel dev

# Open in browser
open http://localhost:3000
```

## 📱 How to Use

### For Instructors:

1. **Access Instructor Dashboard**: Go to `/instructor/`
2. **View Results**: Click "Show Results" to see attendance statistics
3. **Analytics**: View response counts and form analytics
4. **Real-time Data**: Refresh to get the latest attendance data

### For Students:

1. **Scan QR Code**: Use your phone camera to scan the displayed QR code
2. **Fill Form**: Complete the Google Form that opens
3. **Submit**: Your attendance is automatically recorded

### For Admins:

1. **Access Admin Dashboard**: Go to `/admin/`
2. **Add Google Forms**:
   - Enter form name (e.g., "Lecture 1", "Quiz 2")
   - Add Google Form URL
   - Optionally add Google Sheet URL for response tracking
3. **Generate QR Codes**: The system automatically generates and refreshes QR codes
4. **Control Sessions**: Start new sessions, refresh codes, or toggle auto-refresh

