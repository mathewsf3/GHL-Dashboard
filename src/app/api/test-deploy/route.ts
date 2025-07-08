import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'GHL Dashboard is deployed successfully!',
    timestamp: new Date().toISOString(),
    endpoints: {
      landing: '/landing',
      login: '/login',
      dashboard: '/',
      health: '/api/health'
    }
  });
}