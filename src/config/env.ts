/**
 * Environment configuration with validation
 * Ensures all required environment variables are present
 */

export const env = {
  // Meta (Facebook) API Configuration
  META_ACCESS_TOKEN: process.env.META_ACCESS_TOKEN || '',
  META_ACCOUNT_ID: process.env.META_ACCOUNT_ID || '',
  
  // GoHighLevel API Configuration
  GHL_API_KEY: process.env.GHL_API_KEY || '',
  GHL_LOCATION_ID: process.env.GHL_LOCATION_ID || '',
  
  // Optional configurations with defaults
  API_RATE_LIMIT: parseInt(process.env.API_RATE_LIMIT || '100'),
  API_RATE_WINDOW: parseInt(process.env.API_RATE_WINDOW || '60000'),
  
  // Environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  
  // Check if variables are available (for runtime checks)
  isConfigured: () => {
    return !!(env.META_ACCESS_TOKEN && env.META_ACCOUNT_ID && env.GHL_API_KEY);
  }
};

/**
 * Validate required environment variables
 * This function should be called at the start of the application
 */
export function validateEnv() {
  const required = [
    'META_ACCESS_TOKEN',
    'META_ACCOUNT_ID',
    'GHL_API_KEY',
  ];
  
  const missing = required.filter(key => !env[key as keyof typeof env]);
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      `Please check your .env.local file or Vercel environment settings.`
    );
  }
}

// Don't validate at build time - Vercel needs to set env vars after build
// Validation will happen at runtime when the functions are called