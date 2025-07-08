import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test environment variables
    const envCheck = {
      META_ACCESS_TOKEN: !!process.env.META_ACCESS_TOKEN,
      META_ACCOUNT_ID: !!process.env.META_ACCOUNT_ID,
      GHL_API_KEY: !!process.env.GHL_API_KEY,
      NODE_ENV: process.env.NODE_ENV,
      // Show first few characters to verify they're loaded correctly
      META_TOKEN_PREVIEW: process.env.META_ACCESS_TOKEN?.substring(0, 15) + '...' || 'NOT SET',
      GHL_KEY_PREVIEW: process.env.GHL_API_KEY?.substring(0, 15) + '...' || 'NOT SET'
    };

    // Test a simple API call to Meta
    let metaTest = null;
    if (process.env.META_ACCESS_TOKEN && process.env.META_ACCOUNT_ID) {
      try {
        const metaResponse = await fetch(
          `https://graph.facebook.com/v18.0/${process.env.META_ACCOUNT_ID}?access_token=${process.env.META_ACCESS_TOKEN}&fields=name`,
          { signal: AbortSignal.timeout(10000) }
        );

        if (metaResponse.ok) {
          metaTest = { status: 'success', data: await metaResponse.json() };
        } else {
          const errorText = await metaResponse.text();
          metaTest = { status: 'error', error: `HTTP ${metaResponse.status}`, details: errorText };
        }
      } catch (error) {
        metaTest = { status: 'error', error: error instanceof Error ? error.message : 'Unknown error' };
      }
    } else {
      metaTest = { status: 'skipped', reason: 'Missing META_ACCESS_TOKEN or META_ACCOUNT_ID' };
    }

    // Test a simple API call to GHL
    let ghlTest = null;
    if (process.env.GHL_API_KEY) {
      try {
        const ghlResponse = await fetch(
          'https://services.leadconnectorhq.com/locations/',
          {
            headers: {
              'Authorization': `Bearer ${process.env.GHL_API_KEY}`,
              'Version': '2021-07-28'
            },
            signal: AbortSignal.timeout(10000)
          }
        );

        if (ghlResponse.ok) {
          const data = await ghlResponse.json();
          ghlTest = { status: 'success', locationCount: data.locations?.length || 0 };
        } else {
          const errorText = await ghlResponse.text();
          ghlTest = { status: 'error', error: `HTTP ${ghlResponse.status}`, details: errorText };
        }
      } catch (error) {
        ghlTest = { status: 'error', error: error instanceof Error ? error.message : 'Unknown error' };
      }
    } else {
      ghlTest = { status: 'skipped', reason: 'Missing GHL_API_KEY' };
    }

    return NextResponse.json({
      message: 'Deployment test completed',
      timestamp: new Date().toISOString(),
      environment: envCheck,
      apiTests: {
        meta: metaTest,
        ghl: ghlTest
      },
      troubleshooting: {
        nextSteps: [
          'Check environment variables in Vercel dashboard',
          'Verify API keys are valid and not expired',
          'Check API rate limits',
          'Verify network connectivity from Vercel'
        ]
      }
    });

  } catch (error) {
    return NextResponse.json({
      error: 'Test failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}