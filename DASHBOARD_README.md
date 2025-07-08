# GHL Dashboard

A comprehensive dashboard for tracking customer journey analytics from Meta Ads to GHL conversions.

## 🚨 IMPORTANT: Vercel Configuration

**Root Directory**: This project should be deployed with the root directory set to `.` (root) in Vercel settings.

**DO NOT** set the root directory to `ghl-dashboard` - all files have been moved to the root level.

## Project Structure

```
/
├── src/                    # Next.js application source
├── public/                 # Static assets
├── docs/                   # Documentation
├── scripts/                # Utility scripts
├── package.json            # Dependencies (at root level)
├── vercel.json             # Vercel configuration
├── next.config.ts          # Next.js configuration
└── README.md               # This file
```

## Features

- Real-time data tracking
- Customer journey funnel visualization
- Meta Ads integration
- GHL CRM integration
- Lead finder functionality
- Creative analysis tools

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Python scripts for data synchronization
- **Database**: Supabase
- **Deployment**: Vercel

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Run development server: `npm run dev`

## Environment Variables

Create a `.env.local` file with the following variables:

```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
GHL_API_KEY=your_ghl_api_key
META_ACCESS_TOKEN=your_meta_access_token
```

## Deployment

This project is configured for deployment on Vercel with the following settings:

- **Framework**: Next.js
- **Root Directory**: `.` (root level)
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

## API Endpoints

- `/api/dashboard` - Main dashboard data
- `/api/creative-analysis` - Creative performance analysis
- `/api/lead-finder/search` - Lead search functionality

## Documentation

See the `/docs` folder for detailed documentation including:

- Deployment guides
- API documentation
- Field mapping guides
- Troubleshooting guides

## Vercel Deployment Fix

If you're getting errors about missing package.json in ghl-dashboard/, follow these steps:

1. Go to your Vercel project settings
2. Navigate to "General" → "Root Directory"
3. Change from `ghl-dashboard` to `.` (root)
4. Redeploy the project
