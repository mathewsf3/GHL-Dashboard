import { NextResponse } from 'next/server';
import { CreativeMetrics, CreativeAnalysisData, CampaignOverview, extractUTMFromAdName, groupCreativesByType, getCampaignType, getCampaignTypeDisplayName } from '@/types/creativeAnalysis';
import { getFieldName, FIELD_IDS } from '@/config/ghl-field-mappings';
import { env } from '@/config/env';

// Average deal value for ROAS calculation
const AVERAGE_DEAL_VALUE = 5000;

// Special key for tracking unmatched contacts
const UNMATCHED_KEY = '__UNMATCHED__';

async function fetchMetaCreativeInsights(dateRange: { startDate: Date; endDate: Date }) {
  console.log('🎨 Fetching Meta creative insights...');
  
  try {
    // First, get all ads with their creative details and hierarchy
    const adsUrl = `https://graph.facebook.com/v18.0/${env.META_ACCOUNT_ID}/ads?` +
      new URLSearchParams({
        fields: 'id,name,status,adset{id,name},campaign{id,name},creative{id,name,title,body,thumbnail_url,url_tags}',
        limit: '100',
        access_token: env.META_ACCESS_TOKEN
      });
    
    const adsResponse = await fetch(adsUrl);
    if (!adsResponse.ok) {
      throw new Error(`Meta ads API error: ${adsResponse.status}`);
    }
    const adsData = await adsResponse.json();
    
    // Then get insights for these ads with ad set information
    const insightsUrl = `https://graph.facebook.com/v18.0/${env.META_ACCOUNT_ID}/insights?` +
      new URLSearchParams({
        fields: 'ad_id,ad_name,adset_id,adset_name,campaign_id,campaign_name,spend,impressions,reach,frequency,clicks,unique_clicks,cpc,cpm,ctr,inline_link_clicks,outbound_clicks,actions,cost_per_action_type',
        time_range: JSON.stringify({
          since: dateRange.startDate.toISOString().split('T')[0],
          until: dateRange.endDate.toISOString().split('T')[0]
        }),
        level: 'ad',
        limit: '100',
        access_token: env.META_ACCESS_TOKEN
      });
    
    const insightsResponse = await fetch(insightsUrl);
    if (!insightsResponse.ok) {
      throw new Error(`Meta insights API error: ${insightsResponse.status}`);
    }
    const insightsData = await insightsResponse.json();
    
    // Create a map of ad details
    const adDetailsMap = new Map(
      adsData.data?.map((ad: any) => [ad.id, ad]) || []
    );
    
    // Process insights and merge with ad details
    const creativeInsights = insightsData.data?.map((insight: any) => {
      const adDetails: any = adDetailsMap.get(insight.ad_id);
      
      // Extract UTM content from url_tags if available
      let utmContent = '';
      if (adDetails?.creative?.url_tags) {
        const urlParams = new URLSearchParams(adDetails.creative.url_tags);
        utmContent = urlParams.get('utm_content') || '';
      }
      
      return {
        adId: insight.ad_id,
        adName: insight.ad_name,
        adSetId: insight.adset_id || adDetails?.adset?.id || '',
        adSetName: insight.adset_name || adDetails?.adset?.name || '',
        campaignId: insight.campaign_id || adDetails?.campaign?.id || '',
        campaignName: insight.campaign_name || adDetails?.campaign?.name || '',
        creativeId: adDetails?.creative?.id || '',
        creativeName: adDetails?.creative?.name || '',
        creativeTitle: adDetails?.creative?.title || '',
        creativeBody: adDetails?.creative?.body || '',
        creativeThumbnail: adDetails?.creative?.thumbnail_url || '',
        utmContent, // Add UTM content from URL tags
        spend: parseFloat(insight.spend || 0),
        impressions: parseInt(insight.impressions || 0),
        reach: parseInt(insight.reach || 0),
        frequency: parseFloat(insight.frequency || 0),
        clicks: parseInt(insight.clicks || 0),
        uniqueClicks: parseInt(insight.unique_clicks || 0),
        cpc: parseFloat(insight.cpc || 0),
        cpm: parseFloat(insight.cpm || 0),
        ctr: parseFloat(insight.ctr || 0),
        linkClicks: parseInt(insight.inline_link_clicks || 0),
        actions: insight.actions || [],
        costPerActionType: insight.cost_per_action_type || [],
      };
    }) || [];
    
    console.log(`✅ Fetched ${creativeInsights.length} creative insights from Meta`);
    
    // Debug: Log sample of UTM content values
    const sampleUTMs = creativeInsights.slice(0, 5).map((c: any) => ({
      adName: c.adName,
      utmContent: c.utmContent,
      adSetId: c.adSetId
    }));
    console.log('Sample Meta UTM values:', sampleUTMs);
    
    return creativeInsights;
    
  } catch (error) {
    console.error('❌ Error fetching Meta creative insights:', error);
    throw error;
  }
}

async function fetchGHLMetricsByCreative(dateRange: { startDate: Date; endDate: Date }) {
  console.log('📊 Fetching GHL metrics by creative identifiers...');
  
  try {
    // Fetch all contacts with tracking data
    let allContacts: any[] = [];
    let page = 1;
    let hasMore = true;
    
    while (hasMore && page <= 50) {
      const response = await fetch(
        'https://rest.gohighlevel.com/v1/contacts?' + 
        new URLSearchParams({
          limit: '100',
          page: page.toString()
        }), 
        {
          headers: { 'Authorization': `Bearer ${env.GHL_API_KEY}` },
          signal: AbortSignal.timeout(30000)
        }
      );
      
      if (!response.ok) {
        throw new Error(`GHL API error: ${response.status}`);
      }

      const data = await response.json();
      const pageContacts = data.contacts || [];
      
      if (pageContacts.length === 0) {
        hasMore = false;
      } else {
        allContacts = allContacts.concat(pageContacts);
        page++;
        if (pageContacts.length < 100) {
          hasMore = false;
        }
      }
    }
    
    // Group contacts by creative identifier (UTM content and/or Ad Set ID)
    const creativeMetrics = new Map<string, any>();
    
    allContacts.forEach((contact: any) => {
      if (!contact.customField) return;
      
      // Get creative identifiers
      const utmField = contact.customField.find((f: any) => f.id === FIELD_IDS.UTM_CONTENT);
      const adSetIdField = contact.customField.find((f: any) => f.id === 'phPaAW2mN1KrjtQuSSew'); // Ad Set ID
      
      // Use full UTM content as primary identifier, fallback to Ad Set ID
      let creativeId = utmField?.value || adSetIdField?.value;
      
      // If no creative identifier, use "No UTMs" as the identifier
      if (!creativeId) {
        creativeId = 'NO_UTMS';
      }
      
      // Initialize metrics for this creative if not exists
      if (!creativeMetrics.has(creativeId)) {
        creativeMetrics.set(creativeId, {
          creativeId,
          utmContent: creativeId === 'NO_UTMS' ? 'No UTMs' : (utmField?.value || ''),
          adSetId: adSetIdField?.value || '',
          applications: 0,
          mqls: 0,
          callsBooked: 0,
          callsTaken: 0,
          contractsSent: 0,
          dealsWon: 0,
          isNoUTM: creativeId === 'NO_UTMS'
        });
      }
      
      const metrics = creativeMetrics.get(creativeId)!;
      
      // Check application date
      const appField = contact.customField.find((f: any) => f.id === FIELD_IDS.FA_APPLICATION_DATE);
      if (appField && appField.value) {
        const appDate = new Date(parseInt(appField.value));
        if (appDate >= dateRange.startDate && appDate <= dateRange.endDate) {
          metrics.applications++;
          
          // Check MQL qualification
          const capitalField = contact.customField.find((f: any) => f.id === FIELD_IDS.CAPITAL_AVAILABLE);
          const creditField = contact.customField.find((f: any) => f.id === FIELD_IDS.CREDIT_SCORE);
          const liquidityField = contact.customField.find((f: any) => f.id === FIELD_IDS.LIQUIDITY_AVAILABLE);
          
          // MQL Logic: Applications + qualification filters
          // MQL = Application + (Capital Available ≠ "Less than $1k") + (Credit Score ≠ "Less than 680") + (Liquidity Available ≠ "Low 4 - $1,000 - $3,999")
          // Treat missing fields as qualifying - only disqualify if field exists AND has disqualifying value
          const hasQualifyingCapital = !capitalField || capitalField.value !== 'Less than $1k';
          const hasQualifyingCredit = !creditField || creditField.value !== 'Less than 680';
          // If liquidity field is missing, treat as qualifying. Only disqualify if explicitly "Low 4 - $1,000 - $3,999"
          const hasQualifyingLiquidity = !liquidityField || liquidityField.value !== 'Low 4 - $1,000 - $3,999';
          
          if (hasQualifyingCapital && hasQualifyingCredit && hasQualifyingLiquidity) {
            metrics.mqls++;
          }
        }
      }
      
      // Check calls booked - using same logic as dashboard
      // Booked Call Date in range OR Schedule Call Date in range
      const bookedCallField = contact.customField.find((f: any) => f.id === FIELD_IDS.BOOKED_CALL_DATE);
      const scheduleCallField = contact.customField.find((f: any) => f.id === FIELD_IDS.SCHEDULE_CALL_DATE);
      
      let hasCallBooked = false;
      
      // Check booked date in range
      if (bookedCallField && bookedCallField.value) {
        const bookedDate = new Date(parseInt(bookedCallField.value));
        if (bookedDate >= dateRange.startDate && bookedDate <= dateRange.endDate) {
          metrics.callsBooked++;
          hasCallBooked = true;
        }
      }
      
      // OR check schedule date in range
      if (!hasCallBooked && scheduleCallField && scheduleCallField.value) {
        const scheduleDate = new Date(parseInt(scheduleCallField.value));
        if (scheduleDate >= dateRange.startDate && scheduleDate <= dateRange.endDate) {
          metrics.callsBooked++;
          hasCallBooked = true;
        }
      }
      
      // Check calls taken (Intros Taken) - using FA | Intro Call Taken date field
      const introField = contact.customField.find((f: any) => f.id === FIELD_IDS.INTRO_TAKEN_DATE);
      if (introField && introField.value) {
        const introDate = new Date(parseInt(introField.value));
        if (introDate >= dateRange.startDate && introDate <= dateRange.endDate) {
          metrics.callsTaken++;
        }
      }
      
      // Check contracts sent
      const contractField = contact.customField.find((f: any) => f.id === FIELD_IDS.CONTRACT_SENT);
      if (contractField && contractField.value) {
        const contactDate = new Date(contact.dateAdded);
        if (contactDate >= dateRange.startDate && contactDate <= dateRange.endDate) {
          metrics.contractsSent++;
        }
      }
      
      // Check deals won
      const dealWonDateField = contact.customField.find((f: any) => f.id === FIELD_IDS.DEAL_WON_DATE);
      if (dealWonDateField && dealWonDateField.value) {
        const dealWonDate = new Date(parseInt(dealWonDateField.value));
        if (dealWonDate >= dateRange.startDate && dealWonDate <= dateRange.endDate) {
          metrics.dealsWon++;
        }
      }
    });
    
    console.log(`✅ Analyzed ${creativeMetrics.size} unique creative identifiers`);
    
    // Debug: Log sample of GHL creative identifiers
    const sampleGHL = Array.from(creativeMetrics.entries()).slice(0, 5).map(([key, value]) => ({
      key,
      utmContent: value.utmContent,
      adSetId: value.adSetId,
      applications: value.applications
    }));
    console.log('Sample GHL creative identifiers:', sampleGHL);
    
    return creativeMetrics;
    
  } catch (error) {
    console.error('❌ Error fetching GHL metrics:', error);
    throw error;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    console.log('🚀 Fetching creative analysis data...');
    
    // Parse date range or use defaults
    const dateRange = {
      startDate: startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate: endDate ? new Date(endDate) : new Date()
    };
    
    // Fetch data from both sources
    const [metaInsights, ghlMetrics] = await Promise.all([
      fetchMetaCreativeInsights(dateRange),
      fetchGHLMetricsByCreative(dateRange)
    ]);
    
    // Log summary of data fetched
    console.log(`✅ Fetched ${metaInsights.length} Meta ads and ${ghlMetrics.size} GHL creative groups`);
    console.log('Sample GHL keys:', Array.from(ghlMetrics.keys()).slice(0, 3));
    console.log('Sample Meta ad names:', metaInsights.slice(0, 3).map((m: any) => m.adName));
    
    // Check if we have "No UTMs" data
    const noUTMData = ghlMetrics.get('NO_UTMS');
    const noUTMCreatives: CreativeMetrics[] = [];
    
    if (noUTMData && (
      noUTMData.applications > 0 ||
      noUTMData.callsBooked > 0 ||
      noUTMData.callsTaken > 0 ||
      noUTMData.contractsSent > 0 ||
      noUTMData.dealsWon > 0
    )) {
      // Create a special creative entry for contacts without UTMs
      noUTMCreatives.push({
        adId: 'no-utms',
        adName: 'No UTMs',
        adSetId: '',
        adSetName: 'No Campaign Attribution',
        campaignId: '',
        campaignName: 'Unknown',
        campaignType: 'other',
        creativeId: 'no-utms',
        creativeName: 'No UTMs',
        creativeTitle: 'Leads without UTM tracking',
        creativeBody: '',
        creativeThumbnail: '',
        utmContent: 'No UTMs',
        spend: 0, // No spend data for untracked leads
        impressions: 0,
        reach: 0,
        frequency: 0,
        clicks: 0,
        uniqueClicks: 0,
        cpc: 0,
        cpm: 0,
        ctr: 0,
        linkClicks: 0,
        actions: [],
        costPerActionType: [],
        applications: noUTMData.applications,
        costPerApplication: 0,
        mqls: noUTMData.mqls,
        costPerMQL: 0,
        callsBooked: noUTMData.callsBooked,
        costPerCallBooked: 0,
        callsTaken: noUTMData.callsTaken,
        costPerCallTaken: 0,
        callTakenRate: noUTMData.callsBooked > 0 ? (noUTMData.callsTaken / noUTMData.callsBooked) * 100 : 0,
        contractsSent: noUTMData.contractsSent,
        costPerContractSent: 0,
        contractSentRate: noUTMData.callsTaken > 0 ? (noUTMData.contractsSent / noUTMData.callsTaken) * 100 : 0,
        dealsWon: noUTMData.dealsWon,
        costPerDealWon: 0,
        dealWonRate: noUTMData.contractsSent > 0 ? (noUTMData.dealsWon / noUTMData.contractsSent) * 100 : 0,
        conversionRate: 0,
        mqlRate: noUTMData.applications > 0 ? (noUTMData.mqls / noUTMData.applications) * 100 : 0,
        callBookingRate: noUTMData.mqls > 0 ? (noUTMData.callsBooked / noUTMData.mqls) * 100 : 0,
        overallConversionRate: 0,
        performanceScore: 0,
        isUnmatched: true
      });
    }
    
    // Remove the NO_UTMS key from the map to avoid double counting
    ghlMetrics.delete('NO_UTMS');
    
    // Merge Meta and GHL data by exact matching of ad name to UTM content
    let matchCount = 0;
    let noMatchSamples: string[] = [];
    const matchedCreatives: CreativeMetrics[] = metaInsights.map((metaData: any) => {
      // Try to find GHL data by exact match with full ad name
      // User confirmed: Meta ad name === GHL UTM content (exact match)
      let ghlData = ghlMetrics.get(metaData.adName);
      
      // Log first 5 non-matches for debugging
      if (!ghlData && metaData.adName && noMatchSamples.length < 5) {
        noMatchSamples.push(metaData.adName);
      }
      
      // If no match, create empty metrics
      if (!ghlData) {
        ghlData = {
          applications: 0,
          mqls: 0,
          callsBooked: 0,
          callsTaken: 0,
          contractsSent: 0,
          dealsWon: 0,
        };
      } else {
        matchCount++;
      }
      
      // Calculate cost metrics - Focus on main KPIs
      const costPerApplication = ghlData.applications > 0 ? metaData.spend / ghlData.applications : 0;
      const costPerMQL = ghlData.mqls > 0 ? metaData.spend / ghlData.mqls : 0;
      const costPerCallBooked = ghlData.callsBooked > 0 ? metaData.spend / ghlData.callsBooked : 0;
      const costPerCallTaken = ghlData.callsTaken > 0 ? metaData.spend / ghlData.callsTaken : 0;
      const costPerContractSent = ghlData.contractsSent > 0 ? metaData.spend / ghlData.contractsSent : 0;
      const costPerDealWon = ghlData.dealsWon > 0 ? metaData.spend / ghlData.dealsWon : 0;
      
      // Calculate rates
      const conversionRate = metaData.clicks > 0 ? (ghlData.applications / metaData.clicks) * 100 : 0;
      const mqlRate = ghlData.applications > 0 ? (ghlData.mqls / ghlData.applications) * 100 : 0;
      const callBookingRate = ghlData.mqls > 0 ? (ghlData.callsBooked / ghlData.mqls) * 100 : 0;
      const callTakenRate = ghlData.callsBooked > 0 ? (ghlData.callsTaken / ghlData.callsBooked) * 100 : 0;
      const contractSentRate = ghlData.callsTaken > 0 ? (ghlData.contractsSent / ghlData.callsTaken) * 100 : 0;
      const dealWonRate = ghlData.contractsSent > 0 ? (ghlData.dealsWon / ghlData.contractsSent) * 100 : 0;
      const overallConversionRate = metaData.clicks > 0 ? (ghlData.dealsWon / metaData.clicks) * 100 : 0;
      
      // Extract simplified UTM for display
      const displayUTM = extractUTMFromAdName(metaData.adName);
      
      // Determine campaign type
      const campaignType = getCampaignType(metaData.campaignName);
      
      return {
        ...metaData,
        campaignType,
        utmContent: displayUTM, // Use simplified UTM for display
        applications: ghlData.applications,
        costPerApplication,
        mqls: ghlData.mqls,
        costPerMQL,
        callsBooked: ghlData.callsBooked,
        costPerCallBooked, // CPBC - Primary metric
        callsTaken: ghlData.callsTaken,
        costPerCallTaken,
        callTakenRate,
        contractsSent: ghlData.contractsSent,
        costPerContractSent,
        contractSentRate,
        dealsWon: ghlData.dealsWon,
        costPerDealWon,
        dealWonRate,
        conversionRate,
        mqlRate,
        callBookingRate,
        overallConversionRate,
        // Performance score based on CPBC (lower is better) and conversion rates
        performanceScore: ghlData.callsBooked > 0 ? 
          (1000 / costPerCallBooked) * callBookingRate : 0,
      };
    });
    
    // Combine matched and no UTM creatives
    const creatives = [...matchedCreatives, ...noUTMCreatives];
    
    // Sort by performance
    creatives.sort((a, b) => (b.performanceScore || 0) - (a.performanceScore || 0));
    
    console.log(`✅ Matched ${matchCount} out of ${metaInsights.length} Meta ads with GHL data`);
    
    // Log no UTM data stats
    if (noUTMData) {
      console.log(`📊 No UTM contacts stats:`);
      console.log(`  - Applications: ${noUTMData.applications}`);
      console.log(`  - Calls Booked: ${noUTMData.callsBooked}`);
      console.log(`  - Intros Taken: ${noUTMData.callsTaken}`);
      console.log(`  - Contracts Sent: ${noUTMData.contractsSent}`);
      console.log(`  - Deals Won: ${noUTMData.dealsWon}`);
    }
    
    // If we have very few matches, log debugging info
    if (matchCount < metaInsights.length * 0.1 && noMatchSamples.length > 0) {
      console.log('⚠️  Low match rate detected. Sample of unmatched Meta ad names:');
      noMatchSamples.forEach(name => console.log(`  - "${name}"`));
      console.log('Sample of available GHL UTM content values:');
      Array.from(ghlMetrics.keys()).slice(0, 5).forEach(key => console.log(`  - "${key}"`));
    }
    
    // Calculate summary metrics - including unmatched contacts
    const totalCallsBooked = creatives.reduce((sum, c) => sum + (c.callsBooked || 0), 0);
    const totalSpend = creatives.reduce((sum, c) => sum + (c.spend || 0), 0);
    const totalDealsWon = creatives.reduce((sum, c) => sum + (c.dealsWon || 0), 0);
    
    console.log(`📊 Summary totals:`);
    console.log(`  - Total Calls Booked: ${totalCallsBooked}`);
    console.log(`  - Total Spend: ${totalSpend.toFixed(2)}`);
    
    // Generate campaign overviews
    const campaignTypes: Array<CreativeMetrics['campaignType']> = ['prospecting', 'retargeting-r1', 'retargeting-r2', 'retargeting-r3', 'retargeting-r4'];
    const campaignOverviews: CampaignOverview[] = [];
    
    // Add Prospecting overview
    const prospectingCreatives = creatives.filter(c => c.campaignType === 'prospecting' && !c.isUnmatched);
    if (prospectingCreatives.length > 0) {
      const totalSpend = prospectingCreatives.reduce((sum, c) => sum + (c.spend || 0), 0);
      const impressions = prospectingCreatives.reduce((sum, c) => sum + (c.impressions || 0), 0);
      const clicks = prospectingCreatives.reduce((sum, c) => sum + (c.clicks || 0), 0);
      const applications = prospectingCreatives.reduce((sum, c) => sum + (c.applications || 0), 0);
      const mqls = prospectingCreatives.reduce((sum, c) => sum + (c.mqls || 0), 0);
      const callsBooked = prospectingCreatives.reduce((sum, c) => sum + (c.callsBooked || 0), 0);
      const callsTaken = prospectingCreatives.reduce((sum, c) => sum + (c.callsTaken || 0), 0);
      const contractsSent = prospectingCreatives.reduce((sum, c) => sum + (c.contractsSent || 0), 0);
      const dealsWon = prospectingCreatives.reduce((sum, c) => sum + (c.dealsWon || 0), 0);
      
      campaignOverviews.push({
        campaignType: 'prospecting',
        campaignName: 'Prospecting',
        creativeCount: prospectingCreatives.length,
        totalSpend,
        impressions,
        clicks,
        applications,
        mqls,
        callsBooked,
        callsTaken,
        contractsSent,
        dealsWon,
        // Cost per metrics
        cpc: clicks > 0 ? totalSpend / clicks : 0,
        cpm: impressions > 0 ? (totalSpend / impressions) * 1000 : 0,
        costPerApplication: applications > 0 ? totalSpend / applications : 0,
        costPerMQL: mqls > 0 ? totalSpend / mqls : 0,
        costPerCallBooked: callsBooked > 0 ? totalSpend / callsBooked : 0,
        costPerCallTaken: callsTaken > 0 ? totalSpend / callsTaken : 0,
        costPerContractSent: contractsSent > 0 ? totalSpend / contractsSent : 0,
        costPerDealWon: dealsWon > 0 ? totalSpend / dealsWon : 0,
        // Conversion rates
        ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
        applicationRate: clicks > 0 ? (applications / clicks) * 100 : 0,
        mqlRate: applications > 0 ? (mqls / applications) * 100 : 0,
        callBookingRate: mqls > 0 ? (callsBooked / mqls) * 100 : 0,
        callTakenRate: callsBooked > 0 ? (callsTaken / callsBooked) * 100 : 0,
        contractSentRate: callsTaken > 0 ? (contractsSent / callsTaken) * 100 : 0,
        dealWonRate: contractsSent > 0 ? (dealsWon / contractsSent) * 100 : 0,
      });
    }
    
    // Add combined Remarketing overview (R1-R4)
    const remarketingCreatives = creatives.filter(c => 
      ['retargeting-r1', 'retargeting-r2', 'retargeting-r3', 'retargeting-r4'].includes(c.campaignType || '') && !c.isUnmatched
    );
    if (remarketingCreatives.length > 0) {
      const totalSpend = remarketingCreatives.reduce((sum, c) => sum + (c.spend || 0), 0);
      const impressions = remarketingCreatives.reduce((sum, c) => sum + (c.impressions || 0), 0);
      const clicks = remarketingCreatives.reduce((sum, c) => sum + (c.clicks || 0), 0);
      const applications = remarketingCreatives.reduce((sum, c) => sum + (c.applications || 0), 0);
      const mqls = remarketingCreatives.reduce((sum, c) => sum + (c.mqls || 0), 0);
      const callsBooked = remarketingCreatives.reduce((sum, c) => sum + (c.callsBooked || 0), 0);
      const callsTaken = remarketingCreatives.reduce((sum, c) => sum + (c.callsTaken || 0), 0);
      const contractsSent = remarketingCreatives.reduce((sum, c) => sum + (c.contractsSent || 0), 0);
      const dealsWon = remarketingCreatives.reduce((sum, c) => sum + (c.dealsWon || 0), 0);
      
      campaignOverviews.push({
        campaignType: 'retargeting-r1' as any, // Use r1 as a placeholder for combined
        campaignName: 'Remarketing (R1/R2/R3/R4)',
        creativeCount: remarketingCreatives.length,
        totalSpend,
        impressions,
        clicks,
        applications,
        mqls,
        callsBooked,
        callsTaken,
        contractsSent,
        dealsWon,
        // Cost per metrics
        cpc: clicks > 0 ? totalSpend / clicks : 0,
        cpm: impressions > 0 ? (totalSpend / impressions) * 1000 : 0,
        costPerApplication: applications > 0 ? totalSpend / applications : 0,
        costPerMQL: mqls > 0 ? totalSpend / mqls : 0,
        costPerCallBooked: callsBooked > 0 ? totalSpend / callsBooked : 0,
        costPerCallTaken: callsTaken > 0 ? totalSpend / callsTaken : 0,
        costPerContractSent: contractsSent > 0 ? totalSpend / contractsSent : 0,
        costPerDealWon: dealsWon > 0 ? totalSpend / dealsWon : 0,
        // Conversion rates
        ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
        applicationRate: clicks > 0 ? (applications / clicks) * 100 : 0,
        mqlRate: applications > 0 ? (mqls / applications) * 100 : 0,
        callBookingRate: mqls > 0 ? (callsBooked / mqls) * 100 : 0,
        callTakenRate: callsBooked > 0 ? (callsTaken / callsBooked) * 100 : 0,
        contractSentRate: callsTaken > 0 ? (contractsSent / callsTaken) * 100 : 0,
        dealWonRate: contractsSent > 0 ? (dealsWon / contractsSent) * 100 : 0,
      });
    }
    
    const summary = {
      totalSpend,
      totalApplications: creatives.reduce((sum, c) => sum + (c.applications || 0), 0),
      totalCallsBooked,
      totalCallsTaken: creatives.reduce((sum, c) => sum + (c.callsTaken || 0), 0),
      totalContractsSent: creatives.reduce((sum, c) => sum + (c.contractsSent || 0), 0),
      totalDealsWon,
      avgCPBC: totalCallsBooked > 0 ? totalSpend / totalCallsBooked : 0,
      avgCostPerDeal: totalDealsWon > 0 ? totalSpend / totalDealsWon : 0,
      topPerformingCreatives: creatives.slice(0, 5),
      worstPerformingCreatives: creatives.slice(-5).reverse(),
    };
    
    const analysisData: CreativeAnalysisData = {
      creatives,
      campaignOverviews,
      summary,
      dateRange: {
        startDate: dateRange.startDate.toISOString(),
        endDate: dateRange.endDate.toISOString(),
      },
      lastUpdated: new Date().toISOString(),
    };
    
    return NextResponse.json(analysisData);
    
  } catch (error) {
    console.error('❌ Creative analysis API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch creative analysis data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}