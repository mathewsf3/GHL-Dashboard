# GHL Dashboard

A real-time dashboard for tracking Meta Ads to GoHighLevel conversion metrics.

## Features

- **Real-time Metrics**: Track applications, MQLs, calls booked, and deals won
- **Creative Analysis**: Analyze performance by individual ad creatives
- **Lead Finder**: Search and filter leads with advanced criteria
- **Date Range Filtering**: View data by custom date ranges or presets
- **Auto-refresh**: Data updates every 5 minutes

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **APIs**: Meta Marketing API, GoHighLevel API
- **Deployment**: Optimized for Vercel

## Quick Start

1. Clone the repository
```bash
git clone <your-repo-url>
cd ghl-dashboard
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env.local
# Edit .env.local with your API credentials
```

4. Run development server
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

Create a `.env.local` file with:

```env
# Meta (Facebook) API
META_ACCESS_TOKEN=your_meta_access_token
META_ACCOUNT_ID=act_your_account_id

# GoHighLevel API
GHL_API_KEY=your_ghl_api_key
```

## API Routes

- `/api/dashboard` - Main dashboard metrics
- `/api/creative-analysis` - Creative performance data
- `/api/lead-finder/search` - Lead search functionality
- `/api/health` - Health check endpoint

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## Dashboard Metrics

### MQL (Marketing Qualified Lead) Logic
An application becomes an MQL when:
- Capital Available ≠ "Less than $1k" AND
- Credit Score ≠ "Less than 680" AND  
- Liquidity Available ≠ "Low 4 - $1,000 - $3,999"

### Call Counting
Calls are counted when either:
- Booked Call Date is in the selected date range OR
- Schedule Call Date is in the selected date range

## Performance

- Dashboard data caches for 5 minutes
- API routes have 30-second timeout
- Optimized for production with Next.js 15

## Support

For issues, check:
1. API credentials are valid
2. Date range is correctly selected
3. Browser console for errors
4. Network tab for failed requests
