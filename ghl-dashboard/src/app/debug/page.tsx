import { env } from '@/config/env';

export default async function DebugPage() {
  // Server-side environment check
  const envCheck = {
    META_ACCESS_TOKEN: env.META_ACCESS_TOKEN ? `SET (${env.META_ACCESS_TOKEN.substring(0, 10)}...)` : 'NOT SET',
    META_ACCOUNT_ID: env.META_ACCOUNT_ID ? `SET (${env.META_ACCOUNT_ID})` : 'NOT SET',
    GHL_API_KEY: env.GHL_API_KEY ? `SET (${env.GHL_API_KEY.substring(0, 20)}...)` : 'NOT SET',
    NODE_ENV: env.NODE_ENV,
    isConfigured: env.isConfigured()
  };

  // Test Meta API
  let metaTest: any = { status: 'not tested', error: null };
  if (env.META_ACCESS_TOKEN && env.META_ACCOUNT_ID) {
    try {
      const metaResponse = await fetch(
        `https://graph.facebook.com/v18.0/${env.META_ACCOUNT_ID}/insights?fields=spend&time_range=${JSON.stringify({since: '2025-07-01', until: '2025-07-08'})}&level=account&access_token=${env.META_ACCESS_TOKEN}`,
        { cache: 'no-store' }
      );
      
      if (!metaResponse.ok) {
        const errorData = await metaResponse.json();
        metaTest = { 
          status: 'error', 
          httpStatus: metaResponse.status,
          error: errorData.error || `HTTP ${metaResponse.status}`
        };
      } else {
        const data = await metaResponse.json();
        metaTest = { status: 'success', hasData: !!data.data };
      }
    } catch (e: any) {
      metaTest = { status: 'error', error: e.message };
    }
  } else {
    metaTest = { status: 'skipped', reason: 'Missing META credentials' };
  }

  // Test GHL API
  let ghlTest: any = { status: 'not tested', error: null };
  if (env.GHL_API_KEY) {
    try {
      const ghlResponse = await fetch(
        'https://rest.gohighlevel.com/v1/contacts?limit=1',
        {
          headers: { 'Authorization': `Bearer ${env.GHL_API_KEY}` },
          cache: 'no-store'
        }
      );
      
      if (!ghlResponse.ok) {
        const errorText = await ghlResponse.text();
        ghlTest = { 
          status: 'error', 
          httpStatus: ghlResponse.status,
          error: errorText.substring(0, 200)
        };
      } else {
        const data = await ghlResponse.json();
        ghlTest = { status: 'success', hasContacts: !!data.contacts };
      }
    } catch (e: any) {
      ghlTest = { status: 'error', error: e.message };
    }
  } else {
    ghlTest = { status: 'skipped', reason: 'Missing GHL_API_KEY' };
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-8">Debug Information</h1>
      
      <div className="space-y-8">
        {/* Environment Variables */}
        <div className="bg-slate-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(envCheck, null, 2)}
          </pre>
        </div>

        {/* Meta API Test */}
        <div className="bg-slate-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Meta API Test</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(metaTest, null, 2)}
          </pre>
        </div>

        {/* GHL API Test */}
        <div className="bg-slate-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">GHL API Test</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(ghlTest, null, 2)}
          </pre>
        </div>

        {/* Instructions */}
        <div className="bg-blue-900 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">What to check:</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>If environment variables show "NOT SET", they need to be added in Vercel</li>
            <li>If API tests show "error", check the error message for details</li>
            <li>If everything shows "success" but dashboard still doesn't work, the issue is in the dashboard route logic</li>
          </ul>
        </div>
      </div>
    </div>
  );
}