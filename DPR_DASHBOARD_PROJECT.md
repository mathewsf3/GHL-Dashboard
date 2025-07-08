# Development Project Requirements (DPR)
## Customer Journey Analytics Dashboard

### 📋 Project Overview

**Project Name**: Meta Ads + GHL Customer Journey Analytics Dashboard  
**Framework**: Next.js 14 with App Router  
**Database**: Supabase PostgreSQL  
**UI Framework**: Tailwind CSS + shadcn/ui  
**Deployment Target**: Vercel  

**Objective**: Create a beautiful, real-time dashboard displaying complete customer acquisition funnel metrics from Meta ads through deal closure with cost attribution.

---

### 🎯 Core Functional Requirements

#### 1. Dashboard Metrics (Primary KPIs)
**Data Sources**: Live API calls to Meta Marketing API + GHL API + Supabase analytics views

| Metric | Data Source | Calculation |
|--------|-------------|-------------|
| **Ad Spend** | Meta Insights API | SUM(spend) last 30 days |
| **Total Applications** | GHL Contacts API | COUNT(fa_application_date IS NOT NULL) |
| **Cost Per Application** | Calculated | Ad Spend / Total Applications |
| **Total MQLs** | Supabase fa_applications | COUNT(is_mql = true) |
| **Cost Per MQL** | Calculated | Ad Spend / Total MQLs |
| **Calls Booked** | GHL Contacts API | COUNT(booked_call_date IS NOT NULL) |
| **Cost Per Call Booked** | Calculated | Ad Spend / Calls Booked |
| **Intros Taken** | Supabase customer_journey_stages | COUNT(stage = 'call_taken') |
| **Cost Per Intro Taken** | Calculated | Ad Spend / Intros Taken |
| **Contracts Sent** | Supabase customer_journey_stages | COUNT(stage = 'contract_sent') |
| **Cost Per Contract Sent** | Calculated | Ad Spend / Contracts Sent |
| **Deals Won** | Supabase customer_journey_stages | COUNT(stage = 'deal_won') |
| **Cost Per Deal Won** | Calculated | Ad Spend / Deals Won |

#### 2. Data Refresh Strategy
- **Real-time**: Direct API calls (no database dependency for deployment)
- **Caching**: Client-side caching with 5-minute refresh intervals
- **Fallback**: Graceful error handling with loading states

#### 3. UI/UX Requirements
- **Responsive Design**: Mobile-first approach
- **Beautiful Aesthetics**: Modern glassmorphism/neumorphism design
- **Color Scheme**: Professional blue/purple gradient theme
- **Typography**: Inter font family for readability
- **Animations**: Smooth transitions and micro-interactions
- **Charts**: Interactive funnel visualization

---

### 🔒 Security Requirements

#### 1. API Key Management
```typescript
// Environment variables (never expose client-side)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
META_ACCESS_TOKEN=server_side_only
GHL_API_KEY=server_side_only
```

#### 2. API Routes Security
- All sensitive API calls via Next.js API routes (`/api/*`)
- No client-side exposure of Meta/GHL API keys
- Rate limiting implementation
- Input validation and sanitization

#### 3. Supabase Security
- Row Level Security (RLS) policies
- Anonymous access restricted to read-only dashboard views
- No direct table access from frontend

#### 4. Content Security Policy
```typescript
// next.config.js CSP headers
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
  }
]
```

---

### 🏗️ Technical Architecture

#### 1. Project Structure
```
ghl-dashboard/
├── app/
│   ├── api/
│   │   ├── meta/
│   │   │   └── route.ts          # Meta API proxy
│   │   ├── ghl/
│   │   │   └── route.ts          # GHL API proxy  
│   │   └── dashboard/
│   │       └── route.ts          # Combined metrics
│   ├── dashboard/
│   │   └── page.tsx              # Main dashboard
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles
├── components/
│   ├── ui/                       # shadcn/ui components
│   ├── dashboard/
│   │   ├── MetricCard.tsx        # Individual metric display
│   │   ├── FunnelChart.tsx       # Conversion funnel
│   │   ├── LiveData.tsx          # Real-time data hook
│   │   └── ErrorBoundary.tsx     # Error handling
├── lib/
│   ├── supabase.ts              # Supabase client
│   ├── api-clients.ts           # API helper functions
│   └── utils.ts                 # Utility functions
├── types/
│   └── dashboard.ts             # TypeScript interfaces
└── public/
    └── favicon.ico
```

#### 2. Data Flow Architecture
```
Frontend → Next.js API Routes → External APIs → Dashboard Display
    ↓
Client-side Cache (5min TTL) → Real-time Updates
```

#### 3. Technology Stack
- **Next.js 14**: App Router, Server Components, API Routes
- **TypeScript**: Full type safety
- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: Pre-built component library  
- **Recharts**: Data visualization
- **SWR**: Data fetching and caching
- **Framer Motion**: Animations

---

### 🎨 Design System

#### 1. Color Palette
```css
:root {
  --primary: 229 84% 75%;        /* Purple */
  --primary-dark: 229 84% 65%;   /* Dark Purple */
  --secondary: 217 91% 75%;      /* Blue */
  --success: 142 76% 56%;        /* Green */
  --warning: 38 92% 50%;         /* Orange */
  --error: 0 84% 60%;            /* Red */
  --background: 0 0% 3.9%;       /* Dark Background */
  --foreground: 0 0% 98%;        /* Light Text */
  --card: 0 0% 7%;               /* Card Background */
  --border: 217 32% 17%;         /* Border Color */
}
```

#### 2. Component Design Patterns
- **Metric Cards**: Glassmorphism effect with gradients
- **Charts**: Interactive with hover states
- **Loading States**: Shimmer effects
- **Error States**: Friendly error messages with retry buttons

#### 3. Responsive Breakpoints
```css
/* Mobile First */
sm: 640px    /* Small devices */
md: 768px    /* Medium devices */  
lg: 1024px   /* Large devices */
xl: 1280px   /* Extra large devices */
2xl: 1536px  /* 2X Extra large devices */
```

---

### 📊 Dashboard Layout

#### 1. Header Section
- **Logo/Title**: "Customer Journey Analytics"
- **Live Indicator**: Green dot showing real-time status
- **Last Updated**: Timestamp of last data refresh
- **Refresh Button**: Manual refresh trigger

#### 2. KPI Overview (Top Row)
```
[Ad Spend]  [Applications]  [MQLs]  [Deals Won]
```

#### 3. Funnel Visualization (Middle)
Interactive funnel chart showing conversion rates between stages

#### 4. Cost Metrics Grid (Bottom)
```
[Cost/App]  [Cost/MQL]  [Cost/Call]  [Cost/Intro]  [Cost/Contract]  [Cost/Deal]
```

#### 5. Mobile Layout
- Stacked single-column layout
- Swipeable metric cards
- Collapsible sections

---

### 🚀 Performance Requirements

#### 1. Core Web Vitals
- **LCP**: < 2.5 seconds
- **FID**: < 100 milliseconds  
- **CLS**: < 0.1

#### 2. API Performance
- **Response Time**: < 3 seconds for all metrics
- **Error Rate**: < 1% API call failures
- **Caching**: 5-minute client-side cache

#### 3. Bundle Size
- **Initial Load**: < 500KB gzipped
- **Tree Shaking**: Remove unused dependencies
- **Code Splitting**: Route-based chunks

---

### 🧪 Testing Strategy

#### 1. Unit Tests
- Component rendering tests
- API route functionality
- Utility function validation

#### 2. Integration Tests  
- API integration with real endpoints
- Data flow validation
- Error handling scenarios

#### 3. E2E Tests
- Full dashboard loading
- Metric calculation accuracy
- Responsive design validation

---

### 🚢 Deployment Strategy

#### 1. Environment Setup
```bash
# Production Environment
NEXT_PUBLIC_SUPABASE_URL=prod_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=prod_key
META_ACCESS_TOKEN=prod_meta_token
GHL_API_KEY=prod_ghl_key
NODE_ENV=production
```

#### 2. Vercel Deployment
- **Domain**: Custom domain setup
- **Environment Variables**: Secure variable storage
- **Analytics**: Vercel Analytics integration
- **Performance Monitoring**: Real User Monitoring

#### 3. CI/CD Pipeline
```yaml
# .github/workflows/deploy.yml
- name: Build & Test
- name: Type Check  
- name: Deploy to Vercel
- name: Health Check
```

---

### 🔍 Monitoring & Analytics

#### 1. Error Tracking
- **Sentry**: Error logging and alerting
- **API Monitoring**: Response time tracking
- **Uptime Monitoring**: Dashboard availability

#### 2. Performance Monitoring
- **Vercel Analytics**: Core Web Vitals
- **User Analytics**: Dashboard usage patterns
- **API Usage**: Rate limiting monitoring

#### 3. Business Metrics
- **Dashboard Views**: Daily active users
- **Metric Accuracy**: Data validation alerts
- **Cost Tracking**: Infrastructure costs

---

### ✅ Definition of Done

#### 1. Functional Requirements ✓
- [ ] All 12 metrics displaying correctly
- [ ] Real-time data updates working
- [ ] Responsive design on all devices
- [ ] Error handling implemented

#### 2. Non-Functional Requirements ✓
- [ ] Page load time < 3 seconds
- [ ] 99.9% uptime target
- [ ] Security audit passed
- [ ] Accessibility compliance (WCAG 2.1)

#### 3. Quality Assurance ✓
- [ ] Unit test coverage > 80%
- [ ] Integration tests passing
- [ ] Cross-browser compatibility
- [ ] Performance benchmarks met

#### 4. Deployment Readiness ✓
- [ ] Production environment configured
- [ ] Domain and SSL setup
- [ ] Monitoring and alerting active
- [ ] Documentation complete

---

### 📋 Project Timeline

#### Phase 1: Setup & Infrastructure (Day 1)
- [ ] Next.js project initialization
- [ ] Supabase integration
- [ ] API route setup
- [ ] Basic UI framework

#### Phase 2: Core Features (Day 1-2)
- [ ] Metric calculation logic
- [ ] Dashboard layout
- [ ] Real-time data integration
- [ ] Error handling

#### Phase 3: UI/UX Polish (Day 2)
- [ ] Beautiful component design
- [ ] Animations and interactions
- [ ] Responsive optimization
- [ ] Performance optimization

#### Phase 4: Testing & Deployment (Day 2-3)
- [ ] Comprehensive testing
- [ ] Security audit
- [ ] Production deployment
- [ ] Monitoring setup

---

### ⚠️ Risk Assessment

#### 1. Technical Risks
- **API Rate Limits**: Implement caching and fallbacks
- **Data Accuracy**: Add validation and error checking
- **Performance**: Optimize API calls and caching

#### 2. Security Risks  
- **API Key Exposure**: Server-side only access
- **Data Privacy**: Anonymize sensitive data
- **CSRF/XSS**: Implement security headers

#### 3. Mitigation Strategies
- Progressive enhancement for degraded performance
- Graceful fallbacks for API failures
- Comprehensive error logging and monitoring

---

**Approval Required**: ✅  
**Security Review**: ✅  
**Architecture Review**: ✅  
**Ready for Development**: ✅