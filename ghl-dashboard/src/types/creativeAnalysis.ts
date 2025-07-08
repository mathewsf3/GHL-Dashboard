export interface CreativeMetrics {
  // Creative Identity
  adId: string;
  adName: string;
  adSetId?: string; // Facebook Ad Set ID
  adSetName?: string;
  campaignId?: string;
  campaignName?: string;
  campaignType?: 'prospecting' | 'retargeting-r1' | 'retargeting-r2' | 'retargeting-r3' | 'retargeting-r4' | 'other';
  creativeId: string;
  creativeName: string;
  creativeTitle: string;
  creativeBody: string;
  creativeThumbnail?: string;
  utmContent: string; // Extracted from ad name or mapped from GHL
  
  // Meta Metrics
  spend: number;
  impressions: number;
  reach: number;
  frequency: number;
  clicks: number;
  uniqueClicks: number;
  cpc: number;
  cpm: number;
  ctr: number;
  linkClicks: number;
  
  // Main KPIs - GHL Funnel Metrics (matched by UTM content & Ad Set ID)
  applications: number;
  costPerApplication: number;
  mqls: number;
  costPerMQL: number;
  
  // Core KPIs
  callsBooked: number;
  costPerCallBooked: number; // CPBC - Primary metric
  
  callsTaken: number; // Intros Taken
  costPerCallTaken: number;
  callTakenRate: number; // callsTaken / callsBooked
  
  contractsSent: number;
  costPerContractSent: number;
  contractSentRate: number; // contractsSent / callsTaken
  
  dealsWon: number;
  costPerDealWon: number;
  dealWonRate: number; // dealsWon / contractsSent
  
  // Calculated Metrics
  conversionRate: number; // applications / clicks
  mqlRate: number; // mqls / applications
  callBookingRate: number; // callsBooked / mqls
  overallConversionRate: number; // dealsWon / clicks
  
  // Performance Score based on CPBC and conversion rates
  performanceScore?: number;
  qualityRanking?: string;
  engagementRanking?: string;
  conversionRanking?: string;
  
  // Special flag for unmatched contacts
  isUnmatched?: boolean;
}

export interface CreativeAnalysisData {
  creatives: CreativeMetrics[];
  campaignOverviews?: CampaignOverview[];
  summary: {
    totalSpend: number;
    totalApplications: number;
    totalCallsBooked: number;
    totalCallsTaken: number;
    totalContractsSent: number;
    totalDealsWon: number;
    avgCPBC: number; // Average Cost Per Call Booked
    avgCostPerDeal: number;
    topPerformingCreatives: CreativeMetrics[]; // Based on CPBC
    worstPerformingCreatives: CreativeMetrics[];
  };
  dateRange: {
    startDate: string;
    endDate: string;
  };
  lastUpdated: string;
}

export interface CampaignOverview {
  campaignType: 'prospecting' | 'retargeting-r1' | 'retargeting-r2' | 'retargeting-r3' | 'retargeting-r4';
  campaignName: string;
  creativeCount: number;
  totalSpend: number;
  impressions: number;
  clicks: number;
  applications: number;
  mqls: number;
  callsBooked: number;
  callsTaken: number;
  contractsSent: number;
  dealsWon: number;
  // Cost per metrics
  cpc: number;
  cpm: number;
  costPerApplication: number;
  costPerMQL: number;
  costPerCallBooked: number;
  costPerCallTaken: number;
  costPerContractSent: number;
  costPerDealWon: number;
  // Conversion rates
  ctr: number;
  applicationRate: number;
  mqlRate: number;
  callBookingRate: number;
  callTakenRate: number;
  contractSentRate: number;
  dealWonRate: number;
}

export interface CreativeGroupMetrics {
  groupName: string; // e.g., "Sophie - Creatify AI", "Video Ads", etc.
  creatives: CreativeMetrics[];
  aggregateMetrics: {
    totalSpend: number;
    totalImpressions: number;
    totalClicks: number;
    totalApplications: number;
    totalDealsWon: number;
    avgCPC: number;
    avgCPM: number;
    avgCTR: number;
    avgConversionRate: number;
    avgROAS: number;
  };
}

// Helper to determine campaign type from campaign name
export function getCampaignType(campaignName: string): CreativeMetrics['campaignType'] {
  if (!campaignName) return 'other';
  
  const name = campaignName.toUpperCase();
  
  // Check for exact prospecting pattern: "01 | FA | Matt | P | Website | Conversions | ABO"
  if (name.includes('01 | FA | MATT | P |')) {
    return 'prospecting';
  }
  
  // Check for exact retargeting patterns: "B0 | FA | Matt | R1/R2/R3/R4 | Website-v4 | Conversions | ABO |"
  if (name.includes('B0 | FA | MATT | R1 |')) return 'retargeting-r1';
  if (name.includes('B0 | FA | MATT | R2 |')) return 'retargeting-r2';
  if (name.includes('B0 | FA | MATT | R3 |')) return 'retargeting-r3';
  if (name.includes('B0 | FA | MATT | R4 |')) return 'retargeting-r4';
  
  return 'other';
}

// Helper to get campaign type display name
export function getCampaignTypeDisplayName(type: CreativeMetrics['campaignType']): string {
  switch (type) {
    case 'prospecting': return 'Prospecting';
    case 'retargeting-r1': return 'Retargeting R1';
    case 'retargeting-r2': return 'Retargeting R2';
    case 'retargeting-r3': return 'Retargeting R3';
    case 'retargeting-r4': return 'Retargeting R4';
    default: return 'Other';
  }
}

// Helper to extract UTM content from Meta ad name
export function extractUTMFromAdName(adName: string): string {
  // Ad names look like: "01 | 142 | 01 | FA-Matt-P-Website-v4 | Creative Description | CO-01C | HE-01C |"
  // We want to extract a unique identifier, possibly "142" or "FA-Matt-P-Website-v4"
  const parts = adName.split('|').map(p => p.trim());
  
  // Try to find the most meaningful identifier
  // Option 1: Use the number in position 2 (e.g., "142")
  if (parts[1] && /^\d+$/.test(parts[1])) {
    return parts[1];
  }
  
  // Option 2: Use the campaign/version identifier (e.g., "FA-Matt-P-Website-v4")
  if (parts[3]) {
    return parts[3];
  }
  
  // Fallback: Use the full ad name
  return adName;
}

// Helper to group creatives by type/campaign
export function groupCreativesByType(creatives: CreativeMetrics[]): CreativeGroupMetrics[] {
  const groups = new Map<string, CreativeMetrics[]>();
  
  creatives.forEach(creative => {
    // Extract group name from ad name or creative title
    const adNameParts = creative.adName.split('|').map(p => p.trim());
    let groupName = 'Other';
    
    // Try to identify the creative type/source
    if (creative.adName.includes('Creatify AI')) {
      groupName = 'AI Generated Videos';
    } else if (creative.adName.includes('Image')) {
      groupName = 'Image Ads';
    } else if (creative.adName.includes('Video')) {
      groupName = 'Video Ads';
    } else if (adNameParts[4]) {
      // Use the creative description part
      groupName = adNameParts[4].split('-')[0].trim();
    }
    
    if (!groups.has(groupName)) {
      groups.set(groupName, []);
    }
    groups.get(groupName)!.push(creative);
  });
  
  // Calculate aggregate metrics for each group
  return Array.from(groups.entries()).map(([groupName, creatives]) => {
    const aggregateMetrics = creatives.reduce((acc, creative) => ({
      totalSpend: acc.totalSpend + creative.spend,
      totalImpressions: acc.totalImpressions + creative.impressions,
      totalClicks: acc.totalClicks + creative.clicks,
      totalApplications: acc.totalApplications + creative.applications,
      totalDealsWon: acc.totalDealsWon + creative.dealsWon,
      avgCPC: 0, // Calculate after
      avgCPM: 0, // Calculate after
      avgCTR: 0, // Calculate after
      avgConversionRate: 0, // Calculate after
      avgROAS: 0, // Calculate after
    }), {
      totalSpend: 0,
      totalImpressions: 0,
      totalClicks: 0,
      totalApplications: 0,
      totalDealsWon: 0,
      avgCPC: 0,
      avgCPM: 0,
      avgCTR: 0,
      avgConversionRate: 0,
      avgROAS: 0,
    });
    
    // Calculate averages
    aggregateMetrics.avgCPC = aggregateMetrics.totalClicks > 0 
      ? aggregateMetrics.totalSpend / aggregateMetrics.totalClicks : 0;
    aggregateMetrics.avgCPM = aggregateMetrics.totalImpressions > 0 
      ? (aggregateMetrics.totalSpend / aggregateMetrics.totalImpressions) * 1000 : 0;
    aggregateMetrics.avgCTR = aggregateMetrics.totalImpressions > 0 
      ? (aggregateMetrics.totalClicks / aggregateMetrics.totalImpressions) * 100 : 0;
    aggregateMetrics.avgConversionRate = aggregateMetrics.totalClicks > 0 
      ? (aggregateMetrics.totalApplications / aggregateMetrics.totalClicks) * 100 : 0;
    aggregateMetrics.avgROAS = aggregateMetrics.totalSpend > 0 
      ? (aggregateMetrics.totalDealsWon * 5000) / aggregateMetrics.totalSpend : 0; // Assuming $5000 per deal
    
    return {
      groupName,
      creatives,
      aggregateMetrics,
    };
  });
}