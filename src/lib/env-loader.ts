/**
 * Environment variable loader for Vercel subdirectory deployments
 */

// Force load environment variables at runtime
export function getEnvVar(key: string): string {
  const value = process.env[key];
  
  if (!value && process.env.NODE_ENV === 'production') {
    console.error(`Missing required environment variable: ${key}`);
    // Return empty string instead of throwing to prevent app crash
    return '';
  }
  
  return value || '';
}

export const runtimeEnv = {
  META_ACCESS_TOKEN: getEnvVar('META_ACCESS_TOKEN'),
  META_ACCOUNT_ID: getEnvVar('META_ACCOUNT_ID'),
  GHL_API_KEY: getEnvVar('GHL_API_KEY'),
  DASHBOARD_AUTH_TOKEN: getEnvVar('DASHBOARD_AUTH_TOKEN'),
};