export default function ApiTest() {
  // Server-side environment check
  const envCheck = {
    META_ACCESS_TOKEN: process.env.META_ACCESS_TOKEN ? 'SET' : 'NOT SET',
    META_ACCOUNT_ID: process.env.META_ACCOUNT_ID ? 'SET' : 'NOT SET', 
    GHL_API_KEY: process.env.GHL_API_KEY ? 'SET' : 'NOT SET',
    DASHBOARD_AUTH_TOKEN: process.env.DASHBOARD_AUTH_TOKEN ? 'SET' : 'NOT SET',
    NODE_ENV: process.env.NODE_ENV,
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-4">API Environment Test</h1>
      <div className="bg-slate-800 p-4 rounded">
        <pre>{JSON.stringify(envCheck, null, 2)}</pre>
      </div>
      <div className="mt-4">
        <a href="/login" className="text-blue-400 hover:underline">Back to Login</a>
      </div>
    </div>
  );
}