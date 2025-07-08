/**
 * Meta/Facebook Marketing API Field Mappings
 * Based on actual API response structure
 * 
 * Key insights:
 * 1. Ad names contain identifiers like: "01 | 142 | 01 | FA-Matt-P-Website-v4 | Creative Description"
 * 2. We can extract creative identifiers from ad names
 * 3. Creative object contains title, body, thumbnail_url
 * 4. Actions array contains conversion events
 */

export const META_INSIGHTS_FIELDS = {
  // Basic Metrics
  spend: 'spend',
  impressions: 'impressions',
  reach: 'reach',
  frequency: 'frequency',
  clicks: 'clicks',
  unique_clicks: 'unique_clicks',
  cpc: 'cpc', // Cost per click
  cpm: 'cpm', // Cost per 1000 impressions
  cpp: 'cpp', // Cost per 1000 people reached
  ctr: 'ctr', // Click-through rate
  unique_ctr: 'unique_ctr', // Unique click-through rate
  
  // Conversion Metrics
  actions: 'actions', // All conversion actions
  action_values: 'action_values', // Revenue from actions
  cost_per_action_type: 'cost_per_action_type',
  website_ctr: 'website_ctr', // Website click-through rate
  
  // Video Metrics (if applicable)
  video_play_actions: 'video_play_actions',
  video_view_percentage: 'video_view_percentage',
  video_avg_time_watched_actions: 'video_avg_time_watched_actions',
  
  // Engagement Metrics
  engagement_rate_ranking: 'engagement_rate_ranking',
  quality_ranking: 'quality_ranking',
  conversion_rate_ranking: 'conversion_rate_ranking',
  
  // Attribution
  inline_link_clicks: 'inline_link_clicks',
  outbound_clicks: 'outbound_clicks',
  landing_page_views: 'landing_page_views',
  
  // Device & Platform
  device_platform: 'device_platform',
  publisher_platform: 'publisher_platform',
  platform_position: 'platform_position',
  impression_device: 'impression_device',
};

export const META_BREAKDOWNS = {
  // Creative Breakdowns
  ad_name: 'ad_name', // This will help us identify specific creatives
  ad_id: 'ad_id',
  adset_name: 'adset_name',
  adset_id: 'adset_id',
  campaign_name: 'campaign_name',
  campaign_id: 'campaign_id',
  
  // Placement Breakdowns
  publisher_platform: 'publisher_platform', // facebook, instagram, messenger, etc.
  platform_position: 'platform_position', // feed, stories, reels, etc.
  device_platform: 'device_platform', // mobile, desktop
  
  // Time Breakdowns
  hourly_stats_aggregated_by_advertiser_time_zone: 'hourly_stats_aggregated_by_advertiser_time_zone',
  hourly_stats_aggregated_by_audience_time_zone: 'hourly_stats_aggregated_by_audience_time_zone',
};

export const META_ACTION_TYPES = {
  // Standard Events
  link_click: 'link_click',
  landing_page_view: 'landing_page_view',
  view_content: 'view_content',
  search: 'search',
  add_to_cart: 'add_to_cart',
  add_to_wishlist: 'add_to_wishlist',
  initiate_checkout: 'initiate_checkout',
  add_payment_info: 'add_payment_info',
  purchase: 'purchase',
  lead: 'lead',
  complete_registration: 'complete_registration',
  contact: 'contact',
  customize_product: 'customize_product',
  donate: 'donate',
  find_location: 'find_location',
  schedule: 'schedule',
  start_trial: 'start_trial',
  submit_application: 'submit_application',
  subscribe: 'subscribe',
  
  // Engagement Actions
  post_engagement: 'post_engagement',
  page_engagement: 'page_engagement',
  post_reaction: 'post_reaction',
  comment: 'comment',
  share: 'share',
  photo_view: 'photo_view',
  video_view: 'video_view',
};

export const META_ATTRIBUTION_WINDOWS = {
  // Click Attribution Windows
  '1d_click': '1 day after clicking',
  '7d_click': '7 days after clicking',
  '28d_click': '28 days after clicking',
  
  // View Attribution Windows
  '1d_view': '1 day after viewing',
  '7d_view': '7 days after viewing',
  
  // Default Attribution
  'default': '7d_click,1d_view', // Facebook's default attribution
};

// Helper to build insights request
export function buildMetaInsightsRequest(params: {
  accountId: string;
  dateRange: { since: string; until: string };
  fields: string[];
  breakdowns?: string[];
  actionBreakdowns?: string[];
  level?: 'account' | 'campaign' | 'adset' | 'ad';
  filtering?: any[];
  timeIncrement?: number | 'monthly' | 'all_days';
}) {
  const queryParams = new URLSearchParams({
    fields: params.fields.join(','),
    time_range: JSON.stringify(params.dateRange),
    level: params.level || 'ad', // Default to ad level for creative analysis
  });

  if (params.breakdowns?.length) {
    queryParams.append('breakdowns', params.breakdowns.join(','));
  }

  if (params.actionBreakdowns?.length) {
    queryParams.append('action_breakdowns', params.actionBreakdowns.join(','));
  }

  if (params.filtering?.length) {
    queryParams.append('filtering', JSON.stringify(params.filtering));
  }

  if (params.timeIncrement) {
    queryParams.append('time_increment', params.timeIncrement.toString());
  }

  return queryParams;
}

// Fields we'll use for creative analysis
export const CREATIVE_ANALYSIS_FIELDS = [
  // Identity
  'ad_id',
  'ad_name',
  'adset_name',
  'campaign_name',
  
  // Spend & Reach
  'spend',
  'impressions',
  'reach',
  'frequency',
  
  // Clicks & CTR
  'clicks',
  'unique_clicks',
  'cpc',
  'ctr',
  'unique_ctr',
  'inline_link_clicks',
  'outbound_clicks',
  
  // Actions (we'll filter for 'lead' and 'submit_application')
  'actions',
  'cost_per_action_type',
  
  // Quality Metrics
  'quality_ranking',
  'engagement_rate_ranking',
  'conversion_rate_ranking',
];

// Map Meta action types to our funnel stages
export const META_TO_FUNNEL_MAPPING = {
  'link_click': 'link_clicks',
  'landing_page_view': 'landing_page_views',
  'lead': 'leads_generated',
  'submit_application': 'applications',
  'complete_registration': 'registrations',
  'contact': 'contacts',
  'schedule': 'appointments_scheduled',
};