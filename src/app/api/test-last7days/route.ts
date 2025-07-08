import { NextRequest, NextResponse } from 'next/server';
import { FIELD_IDS } from '@/config/ghl-field-mappings';
import { extractUTMFromAdName } from '@/types/creativeAnalysis';

const GHL_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2NhdGlvbl9pZCI6IjZLVEM2S0pNZUNhT25CVkhzdGlzIiwidmVyc2lvbiI6MSwiaWF0IjoxNzUxNDcwNTY1OTA1LCJzdWIiOiJJblFHTUM1MXFLbUkwQzMzVFRZMCJ9.-XT16wR4MwRi7brSOW105H5bezCImedheTbwOPj19HI";
const META_ACCESS_TOKEN = "EAA5tn96zDjABO5HtIZBVpN5aMNgfq9KKjF6JCJfjRKZAxic6H9jmZASNHgNuCb8uTcuv1rjXbtBUCQOQwVwGPBVJouR3ar2C56KxY3Ul69GbQEUECQyxO9BFeXuZAlL0ZBZC6CZBTk3UH5EKYlfG4oMiodr7lbLmFv2WWUd521yTvZBGZB0hottGG3Wnx4ZCnTv4b4aOg7";
const META_ACCOUNT_ID = "act_586708888754645";

export async function GET(request: NextRequest) {
  try {
    // Calculate last 7 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    
    // Fetch GHL contacts with application date in last 7 days
    const ghlUrl = `https://rest.gohighlevel.com/v1/contacts/?limit=100`;
    const ghlResponse = await fetch(ghlUrl, {
      headers: {
        'Authorization': `Bearer ${GHL_API_KEY}`,
        'Version': '2021-07-28'
      }
    });
    const ghlData = await ghlResponse.json();
    
    // Filter contacts with application date in last 7 days
    const recentContacts = ghlData.contacts.filter((contact: any) => {
      const appDateField = contact.customField?.find((f: any) => f.id === FIELD_IDS.FA_APPLICATION_DATE);
      if (appDateField?.value) {
        const appDate = new Date(parseInt(appDateField.value));
        return appDate >= startDate && appDate <= endDate;
      }
      return false;
    });
    
    // Get unique UTM content values from recent contacts
    const ghlUTMs = new Set();
    recentContacts.forEach((contact: any) => {
      const utmField = contact.customField?.find((f: any) => f.id === FIELD_IDS.UTM_CONTENT);
      if (utmField?.value) {
        ghlUTMs.add(utmField.value);
      }
    });
    
    // Fetch Meta ads insights for last 7 days
    const metaUrl = `https://graph.facebook.com/v18.0/${META_ACCOUNT_ID}/insights?` +
      new URLSearchParams({
        fields: 'ad_id,ad_name,spend,impressions,clicks',
        time_range: JSON.stringify({
          since: startDate.toISOString().split('T')[0],
          until: endDate.toISOString().split('T')[0]
        }),
        level: 'ad',
        limit: '100',
        access_token: META_ACCESS_TOKEN
      });
    
    const metaResponse = await fetch(metaUrl);
    const metaData = await metaResponse.json();
    
    // Get unique ad names from Meta
    const metaAdNames = new Set();
    metaData.data?.forEach((ad: any) => {
      if (ad.ad_name && parseFloat(ad.spend) > 0) {
        metaAdNames.add(ad.ad_name);
      }
    });
    
    // Find exact matches
    const exactMatches = [];
    for (const ghlUTM of ghlUTMs) {
      if (metaAdNames.has(ghlUTM)) {
        exactMatches.push(ghlUTM);
      }
    }
    
    return NextResponse.json({
      dateRange: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0]
      },
      ghl: {
        totalContactsInPeriod: recentContacts.length,
        uniqueUTMs: Array.from(ghlUTMs).slice(0, 5), // Show first 5
        totalUniqueUTMs: ghlUTMs.size
      },
      meta: {
        totalAdsWithSpend: metaData.data?.filter((ad: any) => parseFloat(ad.spend) > 0).length || 0,
        adNames: Array.from(metaAdNames).slice(0, 5), // Show first 5
        totalUniqueAdNames: metaAdNames.size
      },
      matches: {
        exactMatches: exactMatches.slice(0, 5), // Show first 5
        totalExactMatches: exactMatches.length
      }
    });
  } catch (error: any) {
    return NextResponse.json({ 
      error: 'Test failed',
      details: error.message 
    }, { status: 500 });
  }
}