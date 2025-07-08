import { NextRequest, NextResponse } from 'next/server';
import { FIELD_IDS } from '@/config/ghl-field-mappings';

const GHL_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2NhdGlvbl9pZCI6IjZLVEM2S0pNZUNhT25CVkhzdGlzIiwidmVyc2lvbiI6MSwiaWF0IjoxNzUxNDcwNTY1OTA1LCJzdWIiOiJJblFHTUM1MXFLbUkwQzMzVFRZMCJ9.-XT16wR4MwRi7brSOW105H5bezCImedheTbwOPj19HI";
const META_ACCESS_TOKEN = "EAA5tn96zDjABO5HtIZBVpN5aMNgfq9KKjF6JCJfjRKZAxic6H9jmZASNHgNuCb8uTcuv1rjXbtBUCQOQwVwGPBVJouR3ar2C56KxY3Ul69GbQEUECQyxO9BFeXuZAlL0ZBZC6CZBTk3UH5EKYlfG4oMiodr7lbLmFv2WWUd521yTvZBGZB0hottGG3Wnx4ZCnTv4b4aOg7";
const META_ACCOUNT_ID = "act_586708888754645";

export async function GET(request: NextRequest) {
  try {
    // Fetch some GHL contacts
    const ghlUrl = `https://rest.gohighlevel.com/v1/contacts/?limit=5`;
    const ghlResponse = await fetch(ghlUrl, {
      headers: {
        'Authorization': `Bearer ${GHL_API_KEY}`,
        'Version': '2021-07-28'
      }
    });
    const ghlData = await ghlResponse.json();
    
    // Fetch some Meta ads
    const metaUrl = `https://graph.facebook.com/v18.0/${META_ACCOUNT_ID}/ads?` +
      new URLSearchParams({
        fields: 'id,name',
        limit: '5',
        access_token: META_ACCESS_TOKEN
      });
    const metaResponse = await fetch(metaUrl);
    const metaData = await metaResponse.json();
    
    // Extract UTM values from GHL
    const ghlUTMs = ghlData.contacts.map((contact: any) => {
      const utmField = contact.customField?.find((f: any) => f.id === FIELD_IDS.UTM_CONTENT);
      return {
        name: contact.name,
        utmContent: utmField?.value || 'NO UTM',
        // Show first 50 chars
        utmPreview: utmField?.value ? utmField.value.substring(0, 50) + '...' : 'NO UTM'
      };
    });
    
    // Show Meta ad names
    const metaAds = metaData.data?.map((ad: any) => ({
      id: ad.id,
      name: ad.name,
      // Show first 50 chars
      namePreview: ad.name.substring(0, 50) + '...'
    })) || [];
    
    // Test matching
    const matches = [];
    for (const ghl of ghlUTMs) {
      for (const meta of metaAds) {
        if (ghl.utmContent === meta.name) {
          matches.push({
            ghlName: ghl.name,
            metaAdId: meta.id,
            matchedOn: 'Full ad name'
          });
        }
      }
    }
    
    return NextResponse.json({
      ghlSample: ghlUTMs,
      metaSample: metaAds,
      matches: matches,
      matchCount: matches.length,
      note: 'This shows if GHL UTM content matches Meta ad names'
    });
  } catch (error: any) {
    return NextResponse.json({ 
      error: 'Test failed',
      details: error.message 
    }, { status: 500 });
  }
}