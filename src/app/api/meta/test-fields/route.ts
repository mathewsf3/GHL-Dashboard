import { NextResponse } from 'next/server';

const META_ACCESS_TOKEN = "EAA5tn96zDjABO5HtIZBVpN5aMNgfq9KKjF6JCJfjRKZAxic6H9jmZASNHgNuCb8uTcuv1rjXbtBUCQOQwVwGPBVJouR3ar2C56KxY3Ul69GbQEUECQyxO9BFeXuZAlL0ZBZC6CZBTk3UH5EKYlfG4oMiodr7lbLmFv2WWUd521yTvZBGZB0hottGG3Wnx4ZCnTv4b4aOg7";
const META_ACCOUNT_ID = "act_586708888754645";

export async function GET() {
  try {
    console.log('🔍 Testing Meta API Fields Discovery...');
    
    // Test 1: Get basic account insights with all available fields
    const basicInsightsUrl = `https://graph.facebook.com/v18.0/${META_ACCOUNT_ID}/insights?` +
      new URLSearchParams({
        fields: 'spend,impressions,clicks,actions,action_values,cost_per_action_type,ctr,cpc,cpm,reach,frequency',
        time_range: JSON.stringify({
          since: '2024-06-01',
          until: '2024-06-30'
        }),
        level: 'account',
        access_token: META_ACCESS_TOKEN
      });
    
    const basicResponse = await fetch(basicInsightsUrl);
    const basicData = await basicResponse.json();
    
    // Test 2: Get ad-level breakdown to see creative names
    const adLevelUrl = `https://graph.facebook.com/v18.0/${META_ACCOUNT_ID}/insights?` +
      new URLSearchParams({
        fields: 'ad_id,ad_name,adset_name,campaign_name,spend,impressions,clicks,actions,inline_link_clicks,outbound_clicks',
        time_range: JSON.stringify({
          since: '2024-06-01',
          until: '2024-06-30'
        }),
        level: 'ad',
        limit: '5',
        access_token: META_ACCESS_TOKEN
      });
    
    const adLevelResponse = await fetch(adLevelUrl);
    const adLevelData = await adLevelResponse.json();
    
    // Test 3: Try getting specific ads to see their structure
    const adsUrl = `https://graph.facebook.com/v18.0/${META_ACCOUNT_ID}/ads?` +
      new URLSearchParams({
        fields: 'id,name,status,adset{name},campaign{name},creative{id,name,title,body,image_url,thumbnail_url}',
        limit: '5',
        access_token: META_ACCESS_TOKEN
      });
    
    const adsResponse = await fetch(adsUrl);
    const adsData = await adsResponse.json();
    
    // Test 4: Get available breakdowns
    const breakdownsUrl = `https://graph.facebook.com/v18.0/${META_ACCOUNT_ID}/insights?` +
      new URLSearchParams({
        fields: 'spend,impressions,clicks',
        breakdowns: 'age,gender,publisher_platform,platform_position,device_platform',
        time_range: JSON.stringify({
          since: '2024-06-01',
          until: '2024-06-30'
        }),
        level: 'account',
        access_token: META_ACCESS_TOKEN
      });
    
    const breakdownsResponse = await fetch(breakdownsUrl);
    const breakdownsData = await breakdownsResponse.json();
    
    return NextResponse.json({
      message: 'Meta API Fields Test Results',
      tests: {
        basicInsights: {
          description: 'Basic account-level insights',
          url: basicInsightsUrl,
          response: basicData,
          availableFields: basicData.data?.[0] ? Object.keys(basicData.data[0]) : []
        },
        adLevelInsights: {
          description: 'Ad-level breakdown with creative names',
          url: adLevelUrl,
          response: adLevelData,
          sampleAds: adLevelData.data?.slice(0, 3).map((ad: any) => ({
            ad_name: ad.ad_name,
            adset_name: ad.adset_name,
            campaign_name: ad.campaign_name,
            spend: ad.spend,
            clicks: ad.clicks,
            actions: ad.actions
          }))
        },
        adsStructure: {
          description: 'Direct ads query to see creative details',
          url: adsUrl,
          response: adsData,
          sampleAds: adsData.data?.slice(0, 3).map((ad: any) => ({
            id: ad.id,
            name: ad.name,
            status: ad.status,
            creative: ad.creative
          }))
        },
        breakdowns: {
          description: 'Available breakdown dimensions',
          url: breakdownsUrl,
          response: breakdownsData,
          availableBreakdowns: breakdownsData.data?.[0] ? Object.keys(breakdownsData.data[0]).filter(key => !['spend', 'impressions', 'clicks', 'date_start', 'date_stop'].includes(key)) : []
        }
      },
      summary: {
        availableActionTypes: basicData.data?.[0]?.actions?.map((action: any) => action.action_type) || [],
        availableCostPerActionTypes: basicData.data?.[0]?.cost_per_action_type?.map((cost: any) => cost.action_type) || []
      }
    });
    
  } catch (error) {
    console.error('❌ Meta API test error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to test Meta API fields',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}