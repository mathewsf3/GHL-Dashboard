import { NextRequest, NextResponse } from 'next/server';
import { FIELD_IDS } from '@/config/ghl-field-mappings';

const GHL_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2NhdGlvbl9pZCI6IjZLVEM2S0pNZUNhT25CVkhzdGlzIiwidmVyc2lvbiI6MSwiaWF0IjoxNzUxNDcwNTY1OTA1LCJzdWIiOiJJblFHTUM1MXFLbUkwQzMzVFRZMCJ9.-XT16wR4MwRi7brSOW105H5bezCImedheTbwOPj19HI";
const META_ACCESS_TOKEN = "EAA5tn96zDjABO5HtIZBVpN5aMNgfq9KKjF6JCJfjRKZAxic6H9jmZASNHgNuCb8uTcuv1rjXbtBUCQOQwVwGPBVJouR3ar2C56KxY3Ul69GbQEUECQyxO9BFeXuZAlL0ZBZC6CZBTk3UH5EKYlfG4oMiodr7lbLmFv2WWUd521yTvZBGZB0hottGG3Wnx4ZCnTv4b4aOg7";
const META_ACCOUNT_ID = "act_586708888754645";

export async function GET(request: NextRequest) {
  try {
    // Last 7 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    
    // Fetch GHL contacts
    const ghlUrl = `https://rest.gohighlevel.com/v1/contacts/?limit=20`;
    const ghlResponse = await fetch(ghlUrl, {
      headers: {
        'Authorization': `Bearer ${GHL_API_KEY}`,
        'Version': '2021-07-28'
      }
    });
    const ghlData = await ghlResponse.json();
    
    // Get GHL UTM values
    const ghlUTMs = ghlData.contacts
      .map((contact: any) => {
        const utmField = contact.customField?.find((f: any) => f.id === FIELD_IDS.UTM_CONTENT);
        const appDateField = contact.customField?.find((f: any) => f.id === FIELD_IDS.FA_APPLICATION_DATE);
        return {
          name: contact.name,
          utmContent: utmField?.value || 'NO UTM',
          appDate: appDateField?.value ? new Date(parseInt(appDateField.value)).toISOString() : 'NO DATE',
          utmLength: utmField?.value?.length || 0
        };
      })
      .filter((c: any) => c.utmContent !== 'NO UTM');
    
    // Fetch Meta ads with spend in last 7 days
    const metaUrl = `https://graph.facebook.com/v18.0/${META_ACCOUNT_ID}/insights?` +
      new URLSearchParams({
        fields: 'ad_id,ad_name,spend',
        time_range: JSON.stringify({
          since: startDate.toISOString().split('T')[0],
          until: endDate.toISOString().split('T')[0]
        }),
        level: 'ad',
        limit: '20',
        access_token: META_ACCESS_TOKEN
      });
    
    const metaResponse = await fetch(metaUrl);
    const metaData = await metaResponse.json();
    
    // Get Meta ad names
    const metaAds = (metaData.data || [])
      .filter((ad: any) => parseFloat(ad.spend) > 0)
      .map((ad: any) => ({
        id: ad.ad_id,
        name: ad.ad_name,
        spend: ad.spend,
        nameLength: ad.ad_name?.length || 0
      }));
    
    // Check for exact matches
    const matches = [];
    for (const ghl of ghlUTMs) {
      for (const meta of metaAds) {
        if (ghl.utmContent === meta.name) {
          matches.push({
            matched: true,
            ghlName: ghl.name,
            metaAdId: meta.id,
            spend: meta.spend
          });
        }
      }
    }
    
    // Also check for near matches (same length but not exact)
    const nearMatches = [];
    for (const ghl of ghlUTMs) {
      for (const meta of metaAds) {
        if (ghl.utmContent !== meta.name && ghl.utmLength === meta.nameLength) {
          nearMatches.push({
            ghl: ghl.utmContent.substring(0, 50) + '...',
            meta: meta.name.substring(0, 50) + '...',
            lengthMatch: true
          });
        }
      }
    }
    
    return NextResponse.json({
      dateRange: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0]
      },
      ghl: {
        total: ghlUTMs.length,
        sample: ghlUTMs.slice(0, 3)
      },
      meta: {
        total: metaAds.length,
        sample: metaAds.slice(0, 3)
      },
      exactMatches: matches,
      nearMatches: nearMatches.slice(0, 3),
      summary: {
        totalGHLWithUTM: ghlUTMs.length,
        totalMetaWithSpend: metaAds.length,
        totalExactMatches: matches.length
      }
    });
  } catch (error: any) {
    return NextResponse.json({ 
      error: 'Debug failed',
      details: error.message 
    }, { status: 500 });
  }
}