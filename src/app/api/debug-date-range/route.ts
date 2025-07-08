import { NextRequest, NextResponse } from 'next/server';
import { FIELD_IDS } from '@/config/ghl-field-mappings';

const GHL_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2NhdGlvbl9pZCI6IjZLVEM2S0pNZUNhT25CVkhzdGlzIiwidmVyc2lvbiI6MSwiaWF0IjoxNzUxNDcwNTY1OTA1LCJzdWIiOiJJblFHTUM1MXFLbUkwQzMzVFRZMCJ9.-XT16wR4MwRi7brSOW105H5bezCImedheTbwOPj19HI";
const META_ACCESS_TOKEN = "EAA5tn96zDjABO5HtIZBVpN5aMNgfq9KKjF6JCJfjRKZAxic6H9jmZASNHgNuCb8uTcuv1rjXbtBUCQOQwVwGPBVJouR3ar2C56KxY3Ul69GbQEUECQyxO9BFeXuZAlL0ZBZC6CZBTk3UH5EKYlfG4oMiodr7lbLmFv2WWUd521yTvZBGZB0hottGG3Wnx4ZCnTv4b4aOg7";
const META_ACCOUNT_ID = "act_586708888754645";

export async function GET(request: NextRequest) {
  try {
    // Use exactly 7 days ago to today
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    startDate.setHours(0, 0, 0, 0);
    
    console.log('📅 Analyzing date range:', {
      start: startDate.toISOString(),
      end: endDate.toISOString()
    });
    
    // Fetch GHL contacts with FA Application Date in range
    const ghlUrl = `https://rest.gohighlevel.com/v1/contacts/?limit=100`;
    const ghlResponse = await fetch(ghlUrl, {
      headers: {
        'Authorization': `Bearer ${GHL_API_KEY}`,
        'Version': '2021-07-28'
      }
    });
    const ghlData = await ghlResponse.json();
    
    // Filter contacts by FA Application Date
    const contactsInRange = [];
    const utmContentByDate = new Map();
    
    ghlData.contacts.forEach((contact: any) => {
      const appDateField = contact.customField?.find((f: any) => f.id === FIELD_IDS.FA_APPLICATION_DATE);
      const utmField = contact.customField?.find((f: any) => f.id === FIELD_IDS.UTM_CONTENT);
      
      if (appDateField?.value) {
        const appDate = new Date(parseInt(appDateField.value));
        if (appDate >= startDate && appDate <= endDate && utmField?.value) {
          contactsInRange.push({
            name: contact.name,
            appDate: appDate.toISOString(),
            utmContent: utmField.value
          });
          
          // Track UTM content values
          if (!utmContentByDate.has(utmField.value)) {
            utmContentByDate.set(utmField.value, 0);
          }
          utmContentByDate.set(utmField.value, utmContentByDate.get(utmField.value) + 1);
        }
      }
    });
    
    // Fetch Meta ads with spend in the same range
    const metaUrl = `https://graph.facebook.com/v18.0/${META_ACCOUNT_ID}/insights?` +
      new URLSearchParams({
        fields: 'ad_id,ad_name,spend,impressions,clicks,actions',
        time_range: JSON.stringify({
          since: startDate.toISOString().split('T')[0],
          until: endDate.toISOString().split('T')[0]
        }),
        level: 'ad',
        limit: '500',
        access_token: META_ACCESS_TOKEN
      });
    
    const metaResponse = await fetch(metaUrl);
    const metaData = await metaResponse.json();
    
    // Filter ads with spend > 0
    const adsWithSpend = (metaData.data || []).filter((ad: any) => parseFloat(ad.spend) > 0);
    const adNamesBySpend = new Map();
    
    adsWithSpend.forEach((ad: any) => {
      adNamesBySpend.set(ad.ad_name, {
        spend: parseFloat(ad.spend),
        clicks: parseInt(ad.clicks || 0),
        impressions: parseInt(ad.impressions || 0)
      });
    });
    
    // Find matches
    const matches = [];
    const mismatches = {
      ghlOnly: [],
      metaOnly: []
    };
    
    // Check GHL UTMs against Meta ad names
    for (const [utmContent, count] of utmContentByDate) {
      if (adNamesBySpend.has(utmContent)) {
        const metaData = adNamesBySpend.get(utmContent);
        matches.push({
          value: utmContent,
          ghlApplications: count,
          metaSpend: metaData.spend,
          metaClicks: metaData.clicks
        });
        // Remove from Meta map since we found a match
        adNamesBySpend.delete(utmContent);
      } else {
        mismatches.ghlOnly.push({
          utmContent: utmContent,
          applications: count
        });
      }
    }
    
    // Remaining Meta ads are ones without GHL matches
    for (const [adName, data] of adNamesBySpend) {
      mismatches.metaOnly.push({
        adName: adName,
        spend: data.spend,
        clicks: data.clicks
      });
    }
    
    return NextResponse.json({
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        startFormatted: startDate.toISOString().split('T')[0],
        endFormatted: endDate.toISOString().split('T')[0]
      },
      ghl: {
        totalContactsInRange: contactsInRange.length,
        uniqueUTMsInRange: utmContentByDate.size,
        sampleContacts: contactsInRange.slice(0, 3)
      },
      meta: {
        totalAdsWithSpend: adsWithSpend.length,
        totalSpend: adsWithSpend.reduce((sum: number, ad: any) => sum + parseFloat(ad.spend), 0).toFixed(2),
        sampleAds: adsWithSpend.slice(0, 3).map((ad: any) => ({
          name: ad.ad_name,
          spend: ad.spend,
          clicks: ad.clicks
        }))
      },
      matching: {
        exactMatches: matches.length,
        matchRate: `${(matches.length / Math.max(utmContentByDate.size, adsWithSpend.length) * 100).toFixed(1)}%`,
        matches: matches.slice(0, 5)
      },
      mismatches: {
        ghlOnlyCount: mismatches.ghlOnly.length,
        metaOnlyCount: mismatches.metaOnly.length,
        ghlOnlySample: mismatches.ghlOnly.slice(0, 3),
        metaOnlySample: mismatches.metaOnly.slice(0, 3)
      }
    });
  } catch (error: any) {
    console.error('Debug error:', error);
    return NextResponse.json({ 
      error: 'Debug failed',
      details: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}