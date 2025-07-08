import { NextResponse } from 'next/server';

/**
 * Standard API error response
 */
export function apiError(
  message: string,
  status: number = 500,
  details?: any
) {
  console.error(`API Error [${status}]: ${message}`, details);
  
  return NextResponse.json(
    {
      error: message,
      status,
      timestamp: new Date().toISOString(),
      ...(details && { details })
    },
    { status }
  );
}

/**
 * Wrap API route handlers with error handling
 */
export function withErrorHandler(
  handler: (request: Request) => Promise<Response>
) {
  return async (request: Request) => {
    try {
      return await handler(request);
    } catch (error) {
      console.error('Unhandled API error:', error);
      
      if (error instanceof Error) {
        // Check for specific error types
        if (error.message.includes('Meta API error')) {
          return apiError('Failed to fetch data from Meta API', 503, error.message);
        }
        if (error.message.includes('GHL API error')) {
          return apiError('Failed to fetch data from GoHighLevel', 503, error.message);
        }
        if (error.message.includes('Missing required environment variables')) {
          return apiError('Server configuration error', 500, 'Missing API credentials');
        }
        
        return apiError(error.message, 500);
      }
      
      return apiError('An unexpected error occurred', 500);
    }
  };
}

/**
 * Rate limiting configuration
 */
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function rateLimitCheck(
  identifier: string,
  limit: number = 100,
  windowMs: number = 60000
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const record = requestCounts.get(identifier);
  
  if (!record || now > record.resetTime) {
    // New window
    const resetTime = now + windowMs;
    requestCounts.set(identifier, { count: 1, resetTime });
    return { allowed: true, remaining: limit - 1, resetTime };
  }
  
  if (record.count >= limit) {
    return { allowed: false, remaining: 0, resetTime: record.resetTime };
  }
  
  record.count++;
  return { allowed: true, remaining: limit - record.count, resetTime: record.resetTime };
}

/**
 * Add rate limiting headers to response
 */
export function addRateLimitHeaders(
  response: NextResponse,
  limit: number,
  remaining: number,
  resetTime: number
): NextResponse {
  response.headers.set('X-RateLimit-Limit', limit.toString());
  response.headers.set('X-RateLimit-Remaining', remaining.toString());
  response.headers.set('X-RateLimit-Reset', resetTime.toString());
  return response;
}