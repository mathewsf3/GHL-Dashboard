import { NextResponse } from 'next/server';
import { getFieldName, parseFieldValue, FIELD_IDS } from '@/config/ghl-field-mappings';

const GHL_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2NhdGlvbl9pZCI6IjZLVEM2S0pNZUNhT25CVkhzdGlzIiwidmVyc2lvbiI6MSwiaWF0IjoxNzUxNDcwNTY1OTA1LCJzdWIiOiJJblFHTUM1MXFLbUkwQzMzVFRZMCJ9.-XT16wR4MwRi7brSOW105H5bezCImedheTbwOPj19HI";
const META_ACCESS_TOKEN = "EAA5tn96zDjABO5HtIZBVpN5aMNgfq9KKjF6JCJfjRKZAxic6H9jmZASNHgNuCb8uTcuv1rjXbtBUCQOQwVwGPBVJouR3ar2C56KxY3Ul69GbQEUECQyxO9BFeXuZAlL0ZBZC6CZBTk3UH5EKYlfG4oMiodr7lbLmFv2WWUd521yTvZBGZB0hottGG3Wnx4ZCnTv4b4aOg7";
const META_ACCOUNT_ID = "act_586708888754645";

// Additional field IDs for tracking
const TRACKING_FIELD_IDS = {
  AD_ACCOUNT_ID: 'uy0zwqA52VW1JlLfZ6a6',
  CAMPAIGN_ID: 'ezTpZWktcRZAFX2gvuaG',
  AD_SET_ID: 'phPaAW2mN1KrjtQuSSew',
  UTM_SOURCE: 'XipmrnXqV46DDxVrDiYS',
  CAMPAIGN_INFO: 'Q0KWavjuX7YuGrtJaC6k',
  CAMPAIGN_TYPE: 'cj09pOhxqE4WOOKqQVhK',
  IP_ADDRESS: 'FSIc6ju162mN3K8IUbD8'
};

interface ContactDetails {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateAdded: string;
  dateUpdated: string;
  source?: string;
  tags: string[];
  customFields: Array<{
    id: string;
    name: string;
    value: any;
    displayValue: string;
  }>;
  campaignData?: {
    adName: string;
    adSetName: string;
    campaignName: string;
    spend: number;
    impressions: number;
    clicks: number;
  };
  journey: {
    application: boolean;
    applicationDate?: string;
    mql: boolean;
    mqlReason?: string;
    callBooked: boolean;
    callBookedDate?: string;
    introTaken: boolean;
    introTakenDate?: string;
    contractSent: boolean;
    contractSentDate?: string;
    contractUrl?: string;
    dealWon: boolean;
    dealWonDate?: string;
    dealValue?: string;
  };
  activities: Array<{
    type: string;
    date: string;
    description: string;
  }>;
}

async function fetchMetaAdData(contact: any): Promise<any> {
  try {
    // Get all tracking fields from the contact
    const utmContent = contact.customField?.find((f: any) => f.id === FIELD_IDS.UTM_CONTENT)?.value;
    const campaignId = contact.customField?.find((f: any) => f.id === TRACKING_FIELD_IDS.CAMPAIGN_ID)?.value;
    const adSetId = contact.customField?.find((f: any) => f.id === TRACKING_FIELD_IDS.AD_SET_ID)?.value;
    
    // Try multiple methods to find the ad
    let matchingAd = null;
    let method = '';
    
    // Method 1: Try to match by Campaign ID (most accurate)
    if (campaignId && !matchingAd) {
      const campaignResponse = await fetch(
        `https://graph.facebook.com/v18.0/${campaignId}?` +
        new URLSearchParams({
          fields: 'id,name,ads{id,name,adset{id,name}}',
          access_token: META_ACCESS_TOKEN
        }),
        { signal: AbortSignal.timeout(10000) }
      );
      
      if (campaignResponse.ok) {
        const campaignData = await campaignResponse.json();
        // Find the specific ad that matches UTM content if available
        if (utmContent && campaignData.ads?.data) {
          matchingAd = campaignData.ads.data.find((ad: any) => ad.name === utmContent);
          if (matchingAd) {
            matchingAd.campaign = { id: campaignData.id, name: campaignData.name };
            method = 'campaign_id';
          }
        }
      }
    }
    
    // Method 2: Try to match by Ad Set ID
    if (adSetId && !matchingAd) {
      const adSetResponse = await fetch(
        `https://graph.facebook.com/v18.0/${adSetId}?` +
        new URLSearchParams({
          fields: 'id,name,campaign{id,name},ads{id,name}',
          access_token: META_ACCESS_TOKEN
        }),
        { signal: AbortSignal.timeout(10000) }
      );
      
      if (adSetResponse.ok) {
        const adSetData = await adSetResponse.json();
        if (utmContent && adSetData.ads?.data) {
          matchingAd = adSetData.ads.data.find((ad: any) => ad.name === utmContent);
          if (matchingAd) {
            matchingAd.adset = { id: adSetData.id, name: adSetData.name };
            matchingAd.campaign = adSetData.campaign;
            method = 'adset_id';
          }
        }
      }
    }
    
    // Method 3: Search by UTM content (fallback)
    if (utmContent && !matchingAd) {
      const adsResponse = await fetch(
        `https://graph.facebook.com/v18.0/${META_ACCOUNT_ID}/ads?` +
        new URLSearchParams({
          fields: 'id,name,adset{id,name},campaign{id,name}',
          filtering: JSON.stringify([{field: 'name', operator: 'CONTAIN', value: utmContent}]),
          limit: '100',
          access_token: META_ACCESS_TOKEN
        }),
        { signal: AbortSignal.timeout(10000) }
      );
      
      if (adsResponse.ok) {
        const adsData = await adsResponse.json();
        matchingAd = adsData.data?.find((ad: any) => ad.name === utmContent);
        if (matchingAd) method = 'utm_search';
      }
    }
    
    if (matchingAd) {
      // Fetch detailed insights for the matching ad
      const insightsResponse = await fetch(
        `https://graph.facebook.com/v18.0/${matchingAd.id}/insights?` +
        new URLSearchParams({
          fields: 'spend,impressions,clicks,ctr,cpc,cpm,reach,frequency',
          access_token: META_ACCESS_TOKEN
        }),
        { signal: AbortSignal.timeout(10000) }
      );
      
      if (insightsResponse.ok) {
        const insightsData = await insightsResponse.json();
        const insights = insightsData.data?.[0] || {};
        
        return {
          adId: matchingAd.id,
          adName: matchingAd.name,
          adSetId: matchingAd.adset?.id || '',
          adSetName: matchingAd.adset?.name || '',
          campaignId: matchingAd.campaign?.id || '',
          campaignName: matchingAd.campaign?.name || '',
          spend: parseFloat(insights.spend || 0),
          impressions: parseInt(insights.impressions || 0),
          clicks: parseInt(insights.clicks || 0),
          ctr: parseFloat(insights.ctr || 0),
          cpc: parseFloat(insights.cpc || 0),
          cpm: parseFloat(insights.cpm || 0),
          reach: parseInt(insights.reach || 0),
          frequency: parseFloat(insights.frequency || 0),
          matchMethod: method
        };
      }
    }
  } catch (error) {
    console.error('Error fetching Meta ad data:', error);
  }
  
  return null;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const contactId = searchParams.get('id');
    
    if (!contactId) {
      return NextResponse.json({ error: 'Contact ID required' }, { status: 400 });
    }
    
    console.log(`📋 Fetching detailed info for contact: ${contactId}`);
    
    // Fetch contact details from GHL
    const response = await fetch(
      `https://rest.gohighlevel.com/v1/contacts/${contactId}`,
      {
        headers: { 'Authorization': `Bearer ${GHL_API_KEY}` },
        signal: AbortSignal.timeout(10000)
      }
    );
    
    if (!response.ok) {
      throw new Error(`GHL API error: ${response.status}`);
    }
    
    const contact = await response.json();
    
    // Log UTM fields for debugging
    const utmFields = contact.customField?.filter((f: any) => {
      // Check multiple ways to find UTM fields
      const hasUTMValue = f.value && typeof f.value === 'string' && (
        f.value.includes('|') || // Structured UTM format
        f.value.toLowerCase().includes('utm') ||
        f.value.toLowerCase().includes('campaign')
      );
      
      const hasUTMKey = f.key && typeof f.key === 'string' && (
        f.key.toLowerCase().includes('utm') ||
        f.key.toLowerCase().includes('campaign')
      );
      
      const hasUTMName = f.name && typeof f.name === 'string' && (
        f.name.toLowerCase().includes('utm') ||
        f.name.toLowerCase().includes('campaign')
      );
      
      const isKnownUTMField = [
        'dydJfZGjUkyTmGm4OIef', // UTM Content
        'XipmrnXqV46DDxVrDiYS', // UTM Source
        'phPaAW2mN1KrjtQuSSew', // Ad Set ID
      ].includes(f.id);
      
      return hasUTMValue || hasUTMKey || hasUTMName || isKnownUTMField;
    });
    
    if (utmFields?.length > 0) {
      console.log(`📊 UTM fields found for ${contact.firstName} ${contact.lastName}:`);
      utmFields.forEach((f: any) => {
        console.log(`  - ID: ${f.id}`);
        console.log(`    Key: ${f.key || 'none'}, Name: ${f.name || 'none'}`);
        console.log(`    Value: ${f.value?.substring(0, 100)}${f.value?.length > 100 ? '...' : ''}`);
      });
    } else {
      console.log(`⚠️ No UTM fields found for ${contact.firstName} ${contact.lastName}`);
      console.log(`  Total custom fields: ${contact.customField?.length || 0}`);
      
      // Log first 5 custom fields for debugging
      if (contact.customField?.length > 0) {
        console.log('  Sample custom fields:');
        contact.customField.slice(0, 5).forEach((f: any, i: number) => {
          console.log(`    ${i + 1}. ID: ${f.id}, Key: ${f.key || 'none'}, Value: ${f.value ? 'has value' : 'empty'}`);
        });
      }
    }
    
    // Process custom fields - include ALL fields with better error handling
    const customFields = contact.customField?.map((field: any) => {
      const fieldName = getFieldName(field.id);
      const parsedValue = parseFieldValue(field.id, field.value);
      
      let displayValue = field.value || '';
      if (parsedValue instanceof Date) {
        displayValue = parsedValue.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      } else if (typeof parsedValue === 'string') {
        displayValue = parsedValue;
      }
      
      // For debugging - if field name is unknown, try to use field key
      const finalName = fieldName.includes('Unknown Field') && field.key ? 
        field.key : fieldName;
      
      // Special handling for utm_content field
      if (field.key === 'utm_content' || field.key === 'contact.utm_content') {
        console.log(`🎯 Found UTM field by key: ${field.key}, value: ${field.value?.substring(0, 100)}`);
      }
      
      return {
        id: field.id,
        name: finalName,
        value: field.value,
        displayValue,
        // Include raw field data for debugging
        rawField: {
          id: field.id,
          key: field.key || null,
          value: field.value,
          name: field.name || null
        }
      };
    }) || [];
    
    // Build journey data
    const journey: ContactDetails['journey'] = {
      application: false,
      mql: false,
      callBooked: false,
      introTaken: false,
      contractSent: false,
      dealWon: false
    };
    
    // Application check
    const appField = contact.customField?.find((f: any) => f.id === FIELD_IDS.FA_APPLICATION_DATE);
    if (appField?.value) {
      journey.application = true;
      journey.applicationDate = new Date(parseInt(appField.value)).toLocaleDateString();
    }
    
    // MQL check
    if (journey.application) {
      const capitalField = contact.customField?.find((f: any) => f.id === FIELD_IDS.CAPITAL_AVAILABLE);
      const creditField = contact.customField?.find((f: any) => f.id === FIELD_IDS.CREDIT_SCORE);
      const personaField = contact.customField?.find((f: any) => f.id === FIELD_IDS.EVER_GONE_THROUGH_PERSONA);
      
      const hasQualifyingCapital = capitalField?.value !== 'Less than $1k';
      const hasQualifyingCredit = creditField?.value !== 'Less than 680';
      const hasNotGoneThroughPersona = personaField?.value !== 'Yes';
      
      if (hasQualifyingCapital && hasQualifyingCredit && hasNotGoneThroughPersona) {
        journey.mql = true;
      } else {
        const reasons = [];
        if (!hasQualifyingCapital) reasons.push('Low capital');
        if (!hasQualifyingCredit) reasons.push('Low credit');
        if (!hasNotGoneThroughPersona) reasons.push('Gone through persona');
        journey.mqlReason = reasons.join(', ');
      }
    }
    
    // Call booked check
    const hasCallBookingTags = contact.tags?.some((tag: string) => {
      const t = tag.toLowerCase();
      return t.includes('call booked') || t.includes('intro booked') || t.includes('demo booked');
    });
    
    const bookedCallField = contact.customField?.find((f: any) => f.id === FIELD_IDS.BOOKED_CALL_DATE);
    const scheduleCallField = contact.customField?.find((f: any) => f.id === FIELD_IDS.SCHEDULE_CALL_DATE);
    
    if (hasCallBookingTags || bookedCallField?.value || scheduleCallField?.value) {
      journey.callBooked = true;
      if (bookedCallField?.value) {
        journey.callBookedDate = new Date(parseInt(bookedCallField.value)).toLocaleDateString();
      } else if (scheduleCallField?.value) {
        journey.callBookedDate = new Date(parseInt(scheduleCallField.value)).toLocaleDateString();
      }
    }
    
    // Intro taken check - using correct field ID
    const introField = contact.customField?.find((f: any) => f.id === 'rq6fbGioNYeOwLQQpB9Z');
    if (introField?.value) {
      journey.introTaken = true;
      journey.introTakenDate = new Date(parseInt(introField.value)).toLocaleDateString();
    }
    
    // Contract sent check
    const contractField = contact.customField?.find((f: any) => f.id === FIELD_IDS.CONTRACT_SENT);
    if (contractField?.value) {
      journey.contractSent = true;
      journey.contractUrl = contractField.value;
      journey.contractSentDate = new Date(contact.dateAdded).toLocaleDateString();
    }
    
    // Deal won check
    const dealValueField = contact.customField?.find((f: any) => f.id === FIELD_IDS.DEAL_VALUE);
    const dealWonDateField = contact.customField?.find((f: any) => f.id === FIELD_IDS.DEAL_WON_DATE);
    if (dealValueField?.value) {
      journey.dealWon = true;
      journey.dealValue = dealValueField.value;
      if (dealWonDateField?.value) {
        journey.dealWonDate = new Date(parseInt(dealWonDateField.value)).toLocaleDateString();
      }
    }
    
    // Try to fetch Meta campaign data using multiple matching methods
    const campaignData = await fetchMetaAdData(contact);
    
    // Build activities timeline
    const activities: ContactDetails['activities'] = [];
    
    // Add contact creation as first activity
    activities.push({
      type: 'contact_created',
      date: contact.dateAdded,
      description: 'Contact created in system'
    });
    
    // Add journey milestones as activities
    if (journey.application) {
      activities.push({
        type: 'application',
        date: journey.applicationDate || contact.dateAdded,
        description: 'Submitted FA application'
      });
    }
    
    if (journey.mql) {
      activities.push({
        type: 'qualification',
        date: journey.applicationDate || contact.dateAdded,
        description: 'Qualified as Marketing Qualified Lead (MQL)'
      });
    } else if (journey.application && journey.mqlReason) {
      activities.push({
        type: 'disqualified',
        date: journey.applicationDate || contact.dateAdded,
        description: `Did not qualify as MQL: ${journey.mqlReason}`
      });
    }
    
    // Add tag-based activities
    if (contact.tags && contact.tags.length > 0) {
      // Check for specific tag patterns that indicate activities
      contact.tags.forEach((tag: string) => {
        const tagLower = tag.toLowerCase();
        
        if (tagLower.includes('no show')) {
          activities.push({
            type: 'no_show',
            date: contact.dateAdded, // Tags don't have timestamps, use contact date
            description: 'Marked as no-show for scheduled call'
          });
        }
        
        if (tagLower.includes('hot lead') || tagLower.includes('priority')) {
          activities.push({
            type: 'priority',
            date: contact.dateAdded,
            description: `Tagged as ${tag}`
          });
        }
        
        if (tagLower.includes('nurture') || tagLower.includes('follow up')) {
          activities.push({
            type: 'nurture',
            date: contact.dateAdded,
            description: `Added to nurture sequence: ${tag}`
          });
        }
      });
    }
    
    if (journey.callBooked) {
      activities.push({
        type: 'call_booked',
        date: journey.callBookedDate || contact.dateAdded,
        description: 'Call booked with FA advisor'
      });
    }
    
    if (journey.introTaken) {
      activities.push({
        type: 'intro_taken',
        date: journey.introTakenDate || contact.dateAdded,
        description: 'Completed intro call with advisor'
      });
    }
    
    if (journey.contractSent) {
      activities.push({
        type: 'contract_sent',
        date: journey.contractSentDate || contact.dateAdded,
        description: 'Contract sent via PandaDoc for signature'
      });
    }
    
    if (journey.dealWon) {
      activities.push({
        type: 'deal_won',
        date: journey.dealWonDate || contact.dateAdded,
        description: `Deal closed: ${journey.dealValue}`
      });
    }
    
    // Add campaign attribution as activity if exists
    if (campaignData) {
      activities.push({
        type: 'campaign_matched',
        date: contact.dateAdded,
        description: `Attributed to campaign: ${campaignData.campaignName}`
      });
    }
    
    // Check for any date fields that might indicate other activities
    if (contact.customField) {
      const dateFields = contact.customField.filter((f: any) => {
        const fieldName = getFieldName(f.id);
        if (!f.value || fieldName.includes('Application') || fieldName.includes('Booked') || 
            fieldName.includes('Intro') || fieldName.includes('Contract') || fieldName.includes('Deal')) {
          return false;
        }
        const numValue = parseInt(f.value);
        return !isNaN(numValue) && numValue > 1640000000000 && numValue < 2000000000000;
      });
      
      dateFields.forEach((field: any) => {
        const fieldName = getFieldName(field.id);
        const fieldDate = new Date(parseInt(field.value));
        activities.push({
          type: 'field_update',
          date: fieldDate.toISOString(),
          description: `${fieldName} updated`
        });
      });
    }
    
    // Build final response
    const contactDetails: ContactDetails = {
      id: contact.id,
      firstName: contact.firstName || '',
      lastName: contact.lastName || '',
      email: contact.email || '',
      phone: contact.phone || '',
      dateAdded: contact.dateAdded,
      dateUpdated: contact.dateUpdated || contact.dateAdded,
      source: contact.source || '',
      tags: contact.tags || [],
      customFields,
      campaignData,
      journey,
      activities: activities.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    };
    
    console.log(`✅ Retrieved detailed info for ${contactDetails.firstName} ${contactDetails.lastName}`);
    
    return NextResponse.json(contactDetails);
    
  } catch (error) {
    console.error('❌ Lead details error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lead details' },
      { status: 500 }
    );
  }
}