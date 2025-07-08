# Deployment Guide for GHL Dashboard

This guide covers deploying the GHL Dashboard to Vercel.

## Prerequisites

1. Vercel account
2. Meta (Facebook) API credentials
3. GoHighLevel API credentials

## Environment Variables

Set the following environment variables in your Vercel project settings:

```env
# Meta (Facebook) API Configuration
META_ACCESS_TOKEN=your_meta_access_token
META_ACCOUNT_ID=act_your_account_id

# GoHighLevel API Configuration
GHL_API_KEY=your_ghl_api_key

# Authentication (Required for dashboard access)
DASHBOARD_AUTH_TOKEN=your-secure-access-token
# Optional: For public login form
NEXT_PUBLIC_DASHBOARD_AUTH_TOKEN=your-secure-access-token
```

## Deployment Steps

### 1. Fork/Clone Repository
```bash
git clone <your-repo-url>
cd ghl-dashboard
```

### 2. Install Vercel CLI (Optional)
```bash
npm i -g vercel
```

### 3. Deploy to Vercel

#### Option A: Using Vercel CLI
```bash
vercel
```

Follow the prompts to:
- Link to existing project or create new
- Configure project settings
- Deploy

#### Option B: Using GitHub Integration
1. Push code to GitHub
2. Import project in Vercel Dashboard
3. Configure environment variables
4. Deploy

### 4. Configure Environment Variables

In Vercel Dashboard:
1. Go to Project Settings → Environment Variables
2. Add the required variables from `.env.example`
3. Redeploy to apply changes

## Production Considerations

### API Rate Limits
- Meta API: 200 calls per hour per user
- GoHighLevel: Check your plan limits

### Performance
- Dashboard data refreshes every 5 minutes
- API routes have 30-second timeout
- Caching implemented with SWR

### Security
- All API credentials stored as environment variables
- No credentials exposed to client
- API routes protected server-side
- Dashboard protected with token authentication
- Public landing page at `/landing`
- Login required for dashboard access

## Monitoring

### Key Metrics to Track
1. API response times
2. Error rates
3. Daily active users
4. API quota usage

### Error Handling
- Check Vercel Functions logs for API errors
- Monitor browser console for client errors
- Set up alerts for critical failures

## Troubleshooting

### Common Issues

1. **"Missing environment variables" error**
   - Ensure all variables from `.env.example` are set in Vercel

2. **API timeout errors**
   - Check if Meta/GHL APIs are responding
   - Verify API credentials are valid

3. **Date range issues**
   - Ensure timezone handling is correct
   - Check browser timezone vs server timezone

4. **No data showing**
   - Verify API credentials
   - Check API quota limits
   - Review Vercel Function logs

## Updates and Maintenance

### Updating Dependencies
```bash
npm update
npm audit fix
```

### Database Migrations
Not applicable - this app uses external APIs only

### API Version Updates
Monitor Meta and GoHighLevel API changelogs for breaking changes

## Support

For issues:
1. Check Vercel Function logs
2. Review browser console errors
3. Verify API credentials and quotas
4. Check network tab for failed requests