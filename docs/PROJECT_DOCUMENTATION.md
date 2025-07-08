# GHL Dashboard - Complete Project Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture & Technology Stack](#architecture--technology-stack)
3. [Custom Field Mappings](#custom-field-mappings)
4. [Data Flow & Integration](#data-flow--integration)
5. [Key Features](#key-features)
6. [API Endpoints](#api-endpoints)
7. [Component Structure](#component-structure)
8. [Metrics & KPIs](#metrics--kpis)
9. [Deployment & Configuration](#deployment--configuration)
10. [Troubleshooting & Debugging](#troubleshooting--debugging)

## Project Overview

The GHL Dashboard is a comprehensive analytics platform that integrates Meta (Facebook) Ads data with GoHighLevel (GHL) CRM data to provide real-time customer journey tracking from ad spend to deal closure.

### Core Purpose
- Track the complete customer journey from Meta ad impressions to closed deals
- Calculate key performance metrics like CPBC (Cost Per Booked Call) and ROAS
- Provide creative-level analysis to optimize ad performance
- Enable data-driven decision making for marketing campaigns

### Key Capabilities
- Real-time data synchronization between Meta Ads and GHL
- Comprehensive funnel visualization (Impressions → Clicks → Applications → MQLs → Calls Booked → Intros Taken → Contracts Sent → Deals Won)
- Creative performance analysis with cost attribution
- Date range filtering and data export functionality

## Architecture & Technology Stack

### Frontend
- **Framework**: Next.js 15.3.4 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom dark theme
- **UI Components**: Custom components with shadcn/ui primitives
- **State Management**: React hooks + SWR for data fetching
- **Charts**: Recharts for data visualization
- **Animations**: Framer Motion

### Backend
- **API Routes**: Next.js API routes (server-side)
- **External APIs**: 
  - Meta Graph API v18.0
  - GoHighLevel REST API v1

### Key Dependencies
```json
{
  "next": "15.3.4",
  "react": "^19.0.0",
  "typescript": "^5.7.3",
  "tailwindcss": "^3.4.1",
  "recharts": "^2.15.0",
  "framer-motion": "^11.18.0",
  "swr": "^2.3.0"
}
```

## Custom Field Mappings

### GHL Custom Field IDs
These are the exact field IDs used in the GoHighLevel integration:

```typescript
export const FIELD_IDS = {
  // Application Fields
  FA_APPLICATION_DATE: 'EXQam01Zms1RjhbjKAgh',      // FA Application Date (Unix timestamp)
  
  // Qualification Fields
  CAPITAL_AVAILABLE: 'phPaAW2mN1KrjtQuSSex',        // Capital Available (dropdown)
  CREDIT_SCORE: 'KZaQy8OFD91vXWUlcXXY',             // Credit Score (dropdown)
  EVER_GONE_THROUGH_PERSONA: 'SXJqxr3TIQWxtIOMJorg', // Ever Gone Through Persona (Yes/No)
  
  // Tracking Fields
  UTM_CONTENT: 'QQtSAjJCvBg0DbGaomXY',             // UTM Content (full ad name)
  
  // Call/Meeting Fields
  BOOKED_CALL_DATE: '8m9lAqEEwvPLJvVPFLFL',        // Booked Call Date (Unix timestamp)
  SCHEDULE_CALL_DATE: 'EobnxvKrBDruagKWcxBz',      // Schedule Call Date (Unix timestamp)
  INTRO_TAKEN_DATE: 'LfEENJhpX2xmqOQMQPJp',        // FA Intro Taken Date (Unix timestamp)
  
  // Deal Fields
  CONTRACT_SENT: 'zP3u2zKui9Ja8rD7Oyqg',           // Contract Sent (URL)
  DEAL_WON_DATE: 'YdVTGCvk8LVycBH8ox5D',           // Deal Won Date (Unix timestamp)
  DEAL_VALUE: 'mZ4lgflvNRW9W6gCQL7E',              // Deal Value (text)
  
  // Income Fields
  ANNUAL_INCOME: 'MqxMATPlhsSDWpP6tkFT',           // Annual Income (dropdown)
  FUNDING_TIMELINE: 'neMGpyOsL85h2gvEkQNF',        // Funding Timeline (dropdown)
  
  // Other Fields
  IP_ADDRESS: 'DJF5FLqgGQy5z8KABnVJ',              // IP Address (text)
  AD_SET_ID: 'phPaAW2mN1KrjtQuSSew'                // Meta Ad Set ID (text)
};
```

### Field Value Mappings

#### Capital Available Options
- "Less than $1k" (disqualifies from MQL)
- "$1k-$10k"
- "$10k-$20k"
- "$20k-$30k"
- "$30k-$50k"
- "$50k+"

#### Credit Score Options
- "Less than 680" (disqualifies from MQL)
- "680-700"
- "700-720"
- "720-750"
- "750+"

#### Annual Income Options
- "Less than $50k Yearly"
- "$50k-$100k Yearly"
- "$100k-$150k Yearly"
- "Above $150k Yearly"

#### Funding Timeline Options
- "Within a week"
- "Within a month"
- "Within 3 months"
- "More than 3 months"

## Data Flow & Integration

### 1. Meta Ads → Dashboard
```
Meta Graph API → /api/creative-analysis → Dashboard UI
```
- Fetches ad insights with spend, impressions, clicks
- Retrieves creative details (names, thumbnails, UTM tags)
- Groups by ad, ad set, and campaign levels

### 2. GHL → Dashboard
```
GHL REST API → /api/dashboard → Dashboard UI
```
- Fetches all contacts with custom field data
- Filters by date ranges and qualification criteria
- Aggregates metrics by UTM content (creative identifier)

### 3. Data Matching Logic
The system matches Meta ads with GHL contacts using:
1. **Primary**: Exact match of Meta ad name === GHL UTM content
2. **Secondary**: Meta Ad Set ID === GHL Ad Set ID field
3. **Fallback**: Shows unmatched creatives with "No GHL Match" indicator

### 4. Calls Booked Logic
Comprehensive detection using multiple methods:
```typescript
// Method 1: Tag-based detection
Tags containing: 'fa intro booked', 'demo booked', 'call booked', etc.

// Method 2: Custom field detection
- Booked Call Date in selected date range
- OR Schedule Call Date is not empty
- AND UTM content exists (valid campaign lead)
```

## Key Features

### 1. Dashboard Page (`/`)
- **Real-time KPI Cards**: Applications, MQLs, Calls Booked, Intros Taken, Contracts Sent, Deals Won
- **Conversion Funnel**: Visual representation of the entire customer journey
- **Performance Metrics**: CPBC, Cost per Deal, conversion rates
- **Date Range Filtering**: Presets (Today, Last 7/30/90 days, MTD, Custom)
- **Auto-refresh**: Updates every 5 minutes

### 2. Creative Analysis Page (`/creative-analysis`)
- **Creative Cards**: 
  - Metrics at top (Spend, CPBC, Calls Booked, Deals Won)
  - Full ad name and campaign details below
  - Performance indicators (High Performer, No GHL Match)
  - Detailed funnel metrics per creative
- **Performance Charts**:
  - CPBC Analysis (sorted by lowest cost)
  - Main KPIs Funnel (stacked area chart)
  - KPI Performance (comparative bar chart)
- **Filtering & Sorting**:
  - Search by creative name
  - Filter by CPBC ranges (Excellent <$100, Good $100-200, Poor $200+)
  - Sort by CPBC, Calls, Intros, Contracts, or Deals
- **CSV Export**: Full data export with all metrics

## API Endpoints

### `/api/dashboard`
**Purpose**: Fetch aggregated metrics for the main dashboard
**Method**: GET
**Query Parameters**: 
- `startDate`: ISO date string
- `endDate`: ISO date string

**Response Structure**:
```typescript
{
  summary: {
    applications: number,
    mqls: number,
    callsBooked: number,
    introsTaken: number,
    contractsSent: number,
    dealsWon: number,
    totalAdSpend: number,
    cpbc: number,
    costPerDeal: number
  },
  recentActivity: Contact[],
  dateRange: { start: string, end: string }
}
```

### `/api/creative-analysis`
**Purpose**: Fetch creative-level performance data
**Method**: GET
**Query Parameters**: 
- `startDate`: ISO date string
- `endDate`: ISO date string

**Response Structure**:
```typescript
{
  creatives: CreativeMetrics[],
  summary: {
    totalSpend: number,
    totalApplications: number,
    totalCallsBooked: number,
    totalCallsTaken: number,
    totalContractsSent: number,
    totalDealsWon: number,
    avgCPBC: number,
    avgCostPerDeal: number,
    topPerformingCreatives: CreativeMetrics[],
    worstPerformingCreatives: CreativeMetrics[]
  },
  dateRange: { startDate: string, endDate: string },
  lastUpdated: string
}
```

### Debug Endpoints (Development)
- `/api/debug-utm`: Check UTM values in GHL contacts
- `/api/debug-matching-detailed`: Detailed matching analysis
- `/api/debug-date-range`: Date range specific debugging
- `/api/test-matching`: Test Meta-GHL data matching

## Component Structure

### Layout Components
```
/src/components/layout/
├── DashboardLayout.tsx    # Main layout wrapper
└── Sidebar.tsx            # Navigation sidebar
```

### Dashboard Components
```
/src/components/dashboard/
├── DashboardContent.tsx   # Main dashboard container
├── DateRangeSelector.tsx  # Date range picker
├── LoadingState.tsx       # Loading skeleton
├── ErrorState.tsx         # Error display
├── MetricCard.tsx         # KPI metric cards
├── ConversionFunnel.tsx   # Funnel visualization
└── RecentActivity.tsx     # Recent contacts table
```

### Creative Analysis Components
```
/src/components/creative-analysis/
└── PerformanceChart.tsx   # Multi-view performance charts
```

### UI Primitives
```
/src/components/ui/
├── button.tsx
├── card.tsx
├── badge.tsx
├── select.tsx
├── input.tsx
└── [other shadcn/ui components]
```

## Metrics & KPIs

### Primary Metrics
1. **CPBC (Cost Per Booked Call)**: Total Ad Spend / Calls Booked
2. **Cost Per Deal**: Total Ad Spend / Deals Won
3. **ROAS**: (Deals Won × $5,000) / Total Ad Spend

### Conversion Rates
1. **Click to Application**: Applications / Clicks
2. **Application to MQL**: MQLs / Applications
3. **MQL to Call Booked**: Calls Booked / MQLs
4. **Call Booked to Intro Taken**: Intros Taken / Calls Booked
5. **Intro to Contract**: Contracts Sent / Intros Taken
6. **Contract to Deal**: Deals Won / Contracts Sent
7. **Overall Conversion**: Deals Won / Clicks

### MQL Qualification Logic
An application becomes an MQL when ALL conditions are met:
- Has FA Application Date
- Capital Available ≠ "Less than $1k"
- Credit Score ≠ "Less than 680"
- Ever Gone Through Persona ≠ "Yes"

## Deployment & Configuration

### Environment Variables
```env
# Meta/Facebook Configuration
META_ACCESS_TOKEN=your_meta_access_token
META_ACCOUNT_ID=act_your_account_id

# GoHighLevel Configuration
GHL_API_KEY=your_ghl_api_key
GHL_LOCATION_ID=your_location_id
```

### Build & Deployment
```bash
# Development
npm run dev

# Production Build
npm run build
npm start

# Windows-specific commands are automatically handled
```

### Production Considerations
1. **API Rate Limits**: 
   - Meta: 200 calls per hour per user
   - GHL: 120 requests per minute
2. **Data Caching**: SWR with 5-minute cache
3. **Error Handling**: Graceful fallbacks for API failures
4. **Performance**: Static generation where possible

## Troubleshooting & Debugging

### Common Issues

#### 1. Zero Conversion Data
**Symptoms**: Dashboard shows ad spend but 0 for all conversions
**Causes**:
- UTM content mismatch between Meta and GHL
- Date range misalignment
- Missing custom field values in GHL

**Solutions**:
- Verify Meta ad names exactly match GHL UTM content
- Check date ranges include recent data
- Use debug endpoints to verify data flow

#### 2. Missing Calls Booked
**Symptoms**: Call count lower than expected
**Causes**:
- Missing tags in GHL contacts
- Empty custom date fields
- No UTM content on contacts

**Solutions**:
- Ensure GHL automation adds proper tags
- Verify date fields are populated
- Check UTM tracking is working

#### 3. Build Errors
**Symptoms**: Next.js build fails
**Causes**:
- Corrupted .next directory
- Missing dependencies
- TypeScript errors

**Solutions**:
```bash
rm -rf .next node_modules/.cache
npm install
npm run build
```

### Debug Tools
1. **Browser DevTools**: Check network requests and console logs
2. **API Debug Endpoints**: Test data flow at each step
3. **Server Logs**: Check build output for errors
4. **Data Validation**: Use CSV export to verify calculations

## Recent Updates (July 2025)

### Creative Analysis Improvements
1. **UI Redesign**: Metrics moved to top, full ad names displayed
2. **Matching Logic**: Fixed calls booked counting to match dashboard
3. **Performance Indicators**: Added "No GHL Match" badges
4. **Chart Updates**: Show ad names instead of UTM codes

### Data Accuracy Enhancements
1. **Tag-based Detection**: Comprehensive call booking tag matching
2. **Field Consistency**: All components use correct terminology
3. **Date Range Alignment**: Consistent date filtering across pages

### Windows Compatibility
- Cross-platform npm scripts
- Proper path handling
- Compatible build process

## Future Enhancements

### Planned Features
1. **AI Insights**: Automated performance recommendations
2. **Predictive Analytics**: Forecast future performance
3. **Multi-account Support**: Manage multiple Meta/GHL accounts
4. **Custom Dashboards**: User-configurable metric views
5. **Advanced Filtering**: Multi-dimension filtering capabilities

### Technical Improvements
1. **Real-time Updates**: WebSocket integration for live data
2. **Performance Optimization**: Implement data virtualization
3. **Enhanced Caching**: Redis integration for faster loads
4. **API Versioning**: Prepare for Meta/GHL API changes

## Maintenance Notes

### Regular Tasks
1. **API Token Refresh**: Meta tokens expire every 60 days
2. **Field Mapping Updates**: Verify GHL field IDs remain valid
3. **Performance Monitoring**: Check API response times
4. **Data Validation**: Monthly audit of metric calculations

### Update Procedures
1. Test all changes in development first
2. Run full build before deployment
3. Verify data accuracy after updates
4. Document any field mapping changes

---

*Last Updated: July 2025*
*Version: 1.0.0*