import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if the request is for a protected route
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard') || 
                          request.nextUrl.pathname === '/' ||
                          request.nextUrl.pathname.startsWith('/creative-analysis') ||
                          request.nextUrl.pathname.startsWith('/lead-finder');
  
  // Allow public routes
  const isPublicRoute = request.nextUrl.pathname === '/landing' ||
                       request.nextUrl.pathname === '/login' ||
                       request.nextUrl.pathname.startsWith('/api/health');
  
  if (isPublicRoute) {
    return NextResponse.next();
  }
  
  // Check for authentication
  const authHeader = request.headers.get('authorization');
  const authCookie = request.cookies.get('auth-token');
  
  // Simple token-based auth - in production, use proper JWT or session management
  // Note: Middleware runs on Edge runtime, so we can't access process.env directly
  const validToken = 'ghl-dashboard-2025-secure-token-xyz123'; // Update this to match your DASHBOARD_AUTH_TOKEN in Vercel
  
  if (isProtectedRoute) {
    // Check if user has valid auth token
    if (!authCookie || authCookie.value !== validToken) {
      // Redirect to login page
      return NextResponse.redirect(new URL('/landing', request.url));
    }
  }
  
  // For API routes, check authorization header
  if (request.nextUrl.pathname.startsWith('/api/') && !request.nextUrl.pathname.startsWith('/api/health')) {
    if (!authHeader || authHeader !== `Bearer ${validToken}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};