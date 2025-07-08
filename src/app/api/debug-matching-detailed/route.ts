import { NextRequest, NextResponse } from 'next/server';
import { FIELD_IDS } from '@/config/ghl-field-mappings';

const GHL_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2NhdGlvbl9pZCI6IjZLVEM2S0pNZUNhT25CVkhzdGlzIiwidmVyc2lvbiI6MSwiaWF0IjoxNzUxNDcwNTY1OTA1LCJzdWIiOiJJblFHTUM1MXFLbUkwQzMzVFRZMCJ9.-XT16wR4MwRi7brSOW105H5bezCImedheTbwOPj19HI";
const META_ACCESS_TOKEN = "EAA5tn96zDjABO5HtIZBVpN5aMNgfq9KKjF6JCJfjRKZAxic6H9jmZASNHgNuCb8uTcuv1rjXbtBUCQOQwVwGPBVJouR3ar2C56KxY3Ul69GbQEUECQyxO9BFeXuZAlL0ZBZC6CZBTk3UH5EKYlfG4oMiodr7lbLmFv2WWUd521yTvZBGZB0hottGG3Wnx4ZCnTv4b4aOg7";
const META_ACCOUNT_ID = "act_586708888754645";

export async function GET(request: NextRequest) {
  try {
    // Calculate last 7 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    
    console.log('📅 Date range:', {
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0]
    });
    
    // Fetch ALL GHL contacts
    console.log('🔍 Fetching GHL contacts...');
    const ghlUrl = `https://rest.gohighlevel.com/v1/contacts/?limit=100`;
    const ghlResponse = await fetch(ghlUrl, {
      headers: {
        'Authorization': `Bearer ${GHL_API_KEY}`,
        'Version': '2021-07-28'
      }
    });
    const ghlData = await ghlResponse.json();
    
    // Extract all unique UTM content values
    const ghlUTMMap = new Map();
    ghlData.contacts.forEach((contact: any) => {
      const utmField = contact.customField?.find((f: any) => f.id === FIELD_IDS.UTM_CONTENT);
      if (utmField?.value) {
        if (!ghlUTMMap.has(utmField.value)) {
          ghlUTMMap.set(utmField.value, []);
        }
        ghlUTMMap.get(utmField.value).push({
          name: contact.name,
          dateAdded: contact.dateAdded
        });
      }
    });
    
    console.log(`✅ Found ${ghlUTMMap.size} unique UTM values in GHL`);
    
    // Fetch Meta ads with spend in last 7 days
    console.log('🔍 Fetching Meta ads...');
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
    
    // Create map of Meta ad names
    const metaAdMap = new Map();
    metaData.data?.forEach((ad: any) => {
      if (ad.ad_name && parseFloat(ad.spend) > 0) {
        metaAdMap.set(ad.ad_name, {
          adId: ad.ad_id,
          spend: ad.spend,
          clicks: ad.clicks
        });
      }
    });
    
    console.log(`✅ Found ${metaAdMap.size} Meta ads with spend`);
    
    // Find exact matches
    const exactMatches = [];
    for (const [utmContent, ghlContacts] of ghlUTMMap) {
      if (metaAdMap.has(utmContent)) {
        const metaAd = metaAdMap.get(utmContent);
        exactMatches.push({
          value: utmContent,
          ghlContacts: ghlContacts.length,
          metaSpend: metaAd.spend,
          metaClicks: metaAd.clicks
        });
      }
    }
    
    // Find near misses (for debugging)
    const nearMisses = [];
    const ghlKeys = Array.from(ghlUTMMap.keys());
    const metaKeys = Array.from(metaAdMap.keys());
    
    // Check for similar strings (same start or end)
    for (const ghlKey of ghlKeys.slice(0, 10)) {
      for (const metaKey of metaKeys.slice(0, 10)) {
        if (ghlKey !== metaKey) {
          const ghlStart = ghlKey.substring(0, 20);
          const metaStart = metaKey.substring(0, 20);
          const ghlEnd = ghlKey.substring(Math.max(0, ghlKey.length - 20));
          const metaEnd = metaKey.substring(Math.max(0, metaKey.length - 20));
          
          if (ghlStart === metaStart || ghlEnd === metaEnd) {
            nearMisses.push({
              ghl: ghlKey,
              meta: metaKey,
              ghlLength: ghlKey.length,
              metaLength: metaKey.length,
              startMatch: ghlStart === metaStart,
              endMatch: ghlEnd === metaEnd
            });
          }
        }
      }
    }
    
    // Character analysis for debugging
    const charAnalysis = [];
    if (exactMatches.length === 0 && ghlKeys.length > 0 && metaKeys.length > 0) {
      // Take first value from each for detailed comparison
      const ghlSample = ghlKeys[0];
      const metaSample = metaKeys[0];
      
      charAnalysis.push({
        ghl: {
          value: ghlSample,
          length: ghlSample.length,
          charCodes: ghlSample.split('').slice(0, 10).map(c => c.charCodeAt(0)),
          trimmed: ghlSample.trim(),
          trimmedLength: ghlSample.trim().length
        },
        meta: {
          value: metaSample,
          length: metaSample.length,
          charCodes: metaSample.split('').slice(0, 10).map(c => c.charCodeAt(0)),
          trimmed: metaSample.trim(),
          trimmedLength: metaSample.trim().length
        }
      });
    }
    
    return NextResponse.json({
      summary: {
        dateRange: {
          start: startDate.toISOString().split('T')[0],
          end: endDate.toISOString().split('T')[0]
        },
        ghlUniqueUTMs: ghlUTMMap.size,
        metaAdsWithSpend: metaAdMap.size,
        exactMatches: exactMatches.length,
        matchRate: metaAdMap.size > 0 ? (exactMatches.length / metaAdMap.size * 100).toFixed(1) + '%' : '0%'
      },
      exactMatches: exactMatches.slice(0, 5),
      samples: {
        ghlUTMs: ghlKeys.slice(0, 3),
        metaAdNames: metaKeys.slice(0, 3)
      },
      nearMisses: nearMisses.slice(0, 3),
      charAnalysis: charAnalysis,
      debug: {
        message: "If exactMatches is 0, check the charAnalysis section for hidden character differences"
      }
    });
  } catch (error: any) {
    console.error('Debug error:', error);
    return NextResponse.json({ 
      error: 'Debug failed',
      details: error.message 
    }, { status: 500 });
  }
}