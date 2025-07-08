import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: 'Environment debug info',
    env_check: {
      META_ACCESS_TOKEN: process.env.META_ACCESS_TOKEN ? 'SET' : 'NOT SET',
      META_ACCOUNT_ID: process.env.META_ACCOUNT_ID ? 'SET' : 'NOT SET',
      GHL_API_KEY: process.env.GHL_API_KEY ? 'SET' : 'NOT SET',
      DASHBOARD_AUTH_TOKEN: process.env.DASHBOARD_AUTH_TOKEN ? 'SET' : 'NOT SET',
      NODE_ENV: process.env.NODE_ENV,
    },
    // Check first few characters to ensure they're loaded
    token_preview: {
      META_TOKEN_START: process.env.META_ACCESS_TOKEN?.substring(0, 10) || 'EMPTY',
      GHL_KEY_START: process.env.GHL_API_KEY?.substring(0, 10) || 'EMPTY',
    }
  });
}