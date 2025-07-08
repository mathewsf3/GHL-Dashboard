import { NextResponse } from 'next/server';
import { env } from '@/config/env';

export async function GET() {
  try {
    // Check environment variables
    const envCheck = {
      META_ACCESS_TOKEN: env.META_ACCESS_TOKEN ? `SET (${env.META_ACCESS_TOKEN.substring(0, 10)}...)` : 'NOT SET',
      META_ACCOUNT_ID: env.META_ACCOUNT_ID ? `SET (${env.META_ACCOUNT_ID})` : 'NOT SET',
      GHL_API_KEY: env.GHL_API_KEY ? `SET (${env.GHL_API_KEY.substring(0, 20)}...)` : 'NOT SET',
      NODE_ENV: env.NODE_ENV,
      isConfigured: env.isConfigured()
    };

    // Test Meta API
    let metaTest = { status: 'not tested', error: null };
    if (env.META_ACCESS_TOKEN && env.META_ACCOUNT_ID) {
      try {
        const metaUrl = `https://graph.facebook.com/v18.0/${env.META_ACCOUNT_ID}/insights?fields=spend&time_range=${JSON.stringify({since: '2025-07-01', until: '2025-07-08'})}&level=account&access_token=${env.META_ACCESS_TOKEN}`;
        
        const metaResponse = await fetch(metaUrl);
        const metaData = await metaResponse.json();
        
        if (!metaResponse.ok) {
          metaTest = { 
            status: 'error', 
            error: metaData.error || `HTTP ${metaResponse.status}`,
            url: metaUrl.replace(env.META_ACCESS_TOKEN, 'HIDDEN')
          };
        } else {
          metaTest = { status: 'success', data: metaData };
        }
      } catch (e) {
        metaTest = { status: 'error', error: e.message };
      }
    } else {
      metaTest = { status: 'skipped', reason: 'Missing META credentials' };
    }

    // Test GHL API
    let ghlTest = { status: 'not tested', error: null };
    if (env.GHL_API_KEY) {
      try {
        const ghlResponse = await fetch(
          'https://rest.gohighlevel.com/v1/contacts?limit=1',
          {
            headers: { 'Authorization': `Bearer ${env.GHL_API_KEY}` }
          }
        );
        
        if (!ghlResponse.ok) {
          const errorText = await ghlResponse.text();
          ghlTest = { 
            status: 'error', 
            error: `HTTP ${ghlResponse.status}: ${errorText}` 
          };
        } else {
          const ghlData = await ghlResponse.json();
          ghlTest = { status: 'success', contactsFound: ghlData.contacts?.length || 0 };
        }
      } catch (e) {
        ghlTest = { status: 'error', error: e.message };
      }
    } else {
      ghlTest = { status: 'skipped', reason: 'Missing GHL_API_KEY' };
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      environment: envCheck,
      apiTests: {
        meta: metaTest,
        ghl: ghlTest
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}