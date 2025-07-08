import { NextResponse } from 'next/server';
import { env } from '@/config/env';

export async function GET() {
  const checks = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    checks: {
      env_vars: {
        meta_configured: !!env.META_ACCESS_TOKEN && !!env.META_ACCOUNT_ID,
        ghl_configured: !!env.GHL_API_KEY,
      },
      apis: {
        meta: 'pending',
        ghl: 'pending',
      }
    }
  };

  // Quick API connectivity checks
  try {
    // Test Meta API
    const metaResponse = await fetch(
      `https://graph.facebook.com/v18.0/${env.META_ACCOUNT_ID}?access_token=${env.META_ACCESS_TOKEN}`,
      { signal: AbortSignal.timeout(5000) }
    );
    checks.checks.apis.meta = metaResponse.ok ? 'connected' : 'error';
  } catch {
    checks.checks.apis.meta = 'timeout';
  }

  try {
    // Test GHL API (lightweight endpoint)
    const ghlResponse = await fetch(
      'https://rest.gohighlevel.com/v1/users/lookup',
      {
        headers: { 'Authorization': `Bearer ${env.GHL_API_KEY}` },
        signal: AbortSignal.timeout(5000)
      }
    );
    checks.checks.apis.ghl = ghlResponse.ok ? 'connected' : 'error';
  } catch {
    checks.checks.apis.ghl = 'timeout';
  }

  // Determine overall health
  const allApisConnected = Object.values(checks.checks.apis).every(
    status => status === 'connected'
  );
  const allEnvConfigured = Object.values(checks.checks.env_vars).every(
    status => status === true
  );

  if (!allEnvConfigured || !allApisConnected) {
    checks.status = 'degraded';
  }

  return NextResponse.json(checks);
}