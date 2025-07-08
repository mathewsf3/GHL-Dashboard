import { NextRequest, NextResponse } from 'next/server';
import { extractUTMFromAdName } from '@/types/creativeAnalysis';

async function fetchMetaCreativeInsights(dateRange: any) {
  const META_ACCESS_TOKEN = "EAA5tn96zDjABO5HtIZBVpN5aMNgfq9KKjF6JCJfjRKZAxic6H9jmZASNHgNuCb8uTcuv1rjXbtBUCQOQwVwGPBVJouR3ar2C56KxY3Ul69GbQEUECQyxO9BFeXuZAlL0ZBZC6CZBTk3UH5EKYlfG4oMiodr7lbLmFv2WWUd521yTvZBGZB0hottGG3Wnx4ZCnTv4b4aOg7";
  const META_ACCOUNT_ID = "act_586708888754645";
  
  const adsUrl = `https://graph.facebook.com/v18.0/${META_ACCOUNT_ID}/ads?` +
    new URLSearchParams({
      fields: 'id,name,status,adset{id,name},campaign{id,name},creative{id,name,title,body,thumbnail_url,url_tags}',
      limit: '5',
      access_token: META_ACCESS_TOKEN
    });
  
  const adsResponse = await fetch(adsUrl);
  const adsData = await adsResponse.json();
  
  return adsData.data || [];
}

export async function GET(request: NextRequest) {
  try {
    const dateRange = {
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate: new Date()
    };
    
    // Fetch Meta ads
    const metaAds = await fetchMetaCreativeInsights(dateRange);
    
    // Debug: Show how Meta ads are being parsed
    const metaDebug = metaAds.map((ad: any) => ({
      adId: ad.id,
      adName: ad.name,
      adSetId: ad.adset?.id,
      adSetName: ad.adset?.name,
      creativeTitle: ad.creative?.title,
      urlTags: ad.creative?.url_tags,
      extractedUTM: ad.creative?.url_tags ? 
        new URLSearchParams(ad.creative.url_tags).get('utm_content') : 
        'NO URL TAGS',
    }));
    
    return NextResponse.json({
      metaAds: {
        total: metaAds.length,
        sample: metaDebug
      },
      message: 'Debug data showing Meta ads and their UTM content'
    });
  } catch (error: any) {
    console.error('Debug creative matching error:', error);
    return NextResponse.json({ 
      error: 'Failed to debug creative matching',
      details: error.message 
    }, { status: 500 });
  }
}