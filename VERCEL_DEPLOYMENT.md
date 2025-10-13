# Vercel Deployment Guide

This guide will help you deploy the Secure QR Attendance System to Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Vercel CLI**: Install globally with `npm install -g vercel`
3. **Git Repository**: Your code should be in a Git repository (GitHub, GitLab, or Bitbucket)

## Deployment Steps

### Option 1: Deploy via Vercel CLI (Recommended)

1. **Install Vercel CLI** (if not already installed):

   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:

   ```bash
   vercel login
   ```

3. **Deploy from your project directory**:

   ```bash
   vercel
   ```

4. **Follow the prompts**:

   - Link to existing project? **No**
   - Project name: `attendance-tracker` (or your preferred name)
   - Directory: `.` (current directory)
   - Override settings? **No**

5. **Deploy to production**:
   ```bash
   vercel --prod
   ```

### Option 2: Deploy via Vercel Dashboard

1. **Push your code to GitHub/GitLab/Bitbucket**

2. **Go to [vercel.com/new](https://vercel.com/new)**

3. **Import your repository**

4. **Configure the project**:

   - Framework Preset: **Other**
   - Root Directory: `.`
   - Build Command: (leave empty)
   - Output Directory: (leave empty)

5. **Deploy**

## Project Structure for Vercel

```
attendance-tracker/
├── public/                    # Static files served by Vercel
│   ├── index.html            # Main application
│   ├── styles.css            # Styles
│   ├── api-client.js         # API client
│   ├── instructor-dashboard/ # Instructor dashboard
│   └── admin-dashboard/      # Admin dashboard
├── server/
│   └── api/                  # Vercel Functions
│       ├── forms.js          # Forms API endpoint
│       └── forms/
│           └── [id].js       # Individual form API endpoint
├── vercel.json              # Vercel configuration
├── package.json             # Dependencies
└── index.js                 # Main Express app (fallback)
```

## Configuration Files

### vercel.json

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server/api/**/*.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/public/$1"
    }
  ],
  "functions": {
    "server/api/forms.js": {
      "maxDuration": 10
    },
    "server/api/forms/[id].js": {
      "maxDuration": 10
    }
  }
}
```

### package.json

```json
{
  "name": "attendance-tracker",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vercel dev",
    "deploy": "vercel --prod"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "express": "^5.1.0"
  },
  "devDependencies": {
    "vercel": "^32.0.0"
  }
}
```

## Environment Variables (Optional)

If you need environment variables:

1. **Via Vercel CLI**:

   ```bash
   vercel env add VARIABLE_NAME
   ```

2. **Via Vercel Dashboard**:
   - Go to your project settings
   - Navigate to "Environment Variables"
   - Add your variables

## Local Development

To run the project locally with Vercel:

```bash
# Install dependencies
npm install

# Start local development server
vercel dev
```

This will start the application at `http://localhost:3000`

## API Endpoints

Once deployed, your API will be available at:

- `https://your-app.vercel.app/api/forms` - Forms management
- `https://your-app.vercel.app/api/forms/[id]` - Individual form operations

## Static Files

All static files in the `public/` directory will be served at:

- `https://your-app.vercel.app/` - Main application
- `https://your-app.vercel.app/instructor-dashboard/` - Instructor dashboard
- `https://your-app.vercel.app/admin-dashboard/` - Admin dashboard

## Troubleshooting

### Common Issues

1. **Build Failures**:

   - Ensure all dependencies are in `package.json`
   - Check that Node.js version is compatible (>=18.0.0)

2. **API Not Working**:

   - Verify `vercel.json` routes are correct
   - Check that API functions are in the right directory structure

3. **Static Files Not Loading**:
   - Ensure files are in the `public/` directory
   - Check that routes in `vercel.json` are properly configured

### Debugging

1. **Check Vercel Function Logs**:

   ```bash
   vercel logs
   ```

2. **Local Testing**:

   ```bash
   vercel dev
   ```

3. **Check Deployment Status**:
   ```bash
   vercel ls
   ```

## Custom Domain (Optional)

To use a custom domain:

1. **Add domain in Vercel Dashboard**:

   - Go to project settings
   - Navigate to "Domains"
   - Add your domain

2. **Configure DNS**:
   - Add CNAME record pointing to your Vercel deployment
   - Or use A records as instructed by Vercel

## Performance Optimization

- **Edge Functions**: Consider using Vercel Edge Functions for better performance
- **Caching**: Static files are automatically cached by Vercel's CDN
- **Compression**: Files are automatically compressed

## Security

- **HTTPS**: All deployments use HTTPS by default
- **CORS**: Configured for cross-origin requests
- **Environment Variables**: Use for sensitive data (API keys, etc.)

## Support

- **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **Vercel Community**: [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)
- **Project Issues**: Check the project's GitHub repository
