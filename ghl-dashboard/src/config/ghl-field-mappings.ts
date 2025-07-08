/**
 * GoHighLevel Custom Field Mappings
 * 
 * This configuration maps GHL custom field IDs to meaningful names and types.
 * Based on analysis of actual GHL API responses and field usage patterns.
 * 
 * To update: Run the field discovery endpoint to identify new fields
 * and add them to the appropriate category below.
 */

export interface GHLFieldMapping {
  id: string;
  name: string;
  description: string;
  type: 'date' | 'text' | 'number' | 'url' | 'select' | 'array';
  category: 'application' | 'qualification' | 'booking' | 'contract' | 'deal' | 'tracking' | 'other';
}

// Field mappings discovered from actual GHL data analysis
export const GHL_FIELD_MAPPINGS: GHLFieldMapping[] = [
  // Application Fields
  {
    id: 'hWiYPVIxzb8z69ZSqP1j',
    name: 'FA Application Date',
    description: 'Date when the FA application was submitted',
    type: 'date',
    category: 'application'
  },

  // Qualification Fields (MQL)
  {
    id: 'UAkQthswkKrPlIWQ5Mtk',
    name: 'Capital Available',
    description: 'Amount of capital available (e.g., "$1k-$5k", "$30k-$50k")',
    type: 'select',
    category: 'qualification'
  },
  {
    id: 'j4KihL9HZzwqTCEbai8b',
    name: 'Credit Score',
    description: 'Credit score range (e.g., "680-699", "720-750")',
    type: 'select',
    category: 'qualification'
  },
  {
    id: 'OxRcLPgUtGHNecgWSnpB',
    name: 'Ever Gone Through Persona',
    description: 'Has the contact gone through persona (Yes/No)',
    type: 'select',
    category: 'qualification'
  },
  {
    id: 'VVOSFbxXpsppfHox2jhI',
    name: 'Annual Income',
    description: 'Annual income range (e.g., "Under $150k Yearly", "Above $150k Yearly")',
    type: 'select',
    category: 'qualification'
  },
  {
    id: 'UHOFwbbvd6VH0qwASmxX',
    name: 'Funding Timeline',
    description: 'When they need funding (e.g., "Within a week", "Within the next 30 days")',
    type: 'select',
    category: 'qualification'
  },
  {
    id: 'PNm4pD77pFMz6JUkwbf0',
    name: 'Liquidity Available',
    description: 'Liquidity level (e.g., "Low 4 - $1,000 - $3,999", "Mid 4 - $4,000 - $6,999")',
    type: 'select',
    category: 'qualification'
  },

  // Booking/Call Fields
  {
    id: 'w0MiykFb25fTTFQla3bu',
    name: 'Booked Call Date',
    description: 'Date when a call was booked',
    type: 'date',
    category: 'booking'
  },
  {
    id: 'OOoQSSSoCsRSFlaeThRs',
    name: 'Schedule Call Date',
    description: 'Scheduled date for the call',
    type: 'date',
    category: 'booking'
  },
  {
    id: 'rq6fbGioNYeOwLQQpB9Z',
    name: 'Intro Taken Date',
    description: 'Date when intro call was completed',
    type: 'date',
    category: 'booking'
  },

  // Contract/Deal Fields
  {
    id: 'J27nUfp0TcaaxaB0PFKJ',
    name: 'Contract Sent',
    description: 'PandaDoc contract URL',
    type: 'url',
    category: 'contract'
  },
  {
    id: '8XL7uSWZ1Q4YiKZ0IbvT',
    name: 'Deal Value',
    description: 'Deal/program value (e.g., "FA $500 Deposit - $8500 Program")',
    type: 'text',
    category: 'deal'
  },
  {
    id: 'S8vks1fHlmNBwjKKcQFV',
    name: 'Deal Won Date',
    description: 'Date when the deal was won/closed',
    type: 'date',
    category: 'deal'
  },

  // Tracking/Attribution Fields
  {
    id: 'dydJfZGjUkyTmGm4OIef',
    name: 'UTM Content',
    description: 'Full UTM content string for attribution',
    type: 'text',
    category: 'tracking'
  },
  {
    id: 'utm_content', // Alternative field key used in some GHL setups
    name: 'UTM Content',
    description: 'Full UTM content string for attribution (alternate key)',
    type: 'text',
    category: 'tracking'
  },
  {
    id: 'XipmrnXqV46DDxVrDiYS',
    name: 'UTM Source',
    description: 'Traffic source (e.g., "ig_Instagram_Feed")',
    type: 'text',
    category: 'tracking'
  },
  {
    id: 'FSIc6ju162mN3K8IUbD8',
    name: 'IP Address',
    description: 'Contact IP address',
    type: 'text',
    category: 'tracking'
  },
  {
    id: 'Q0KWavjuX7YuGrtJaC6k',
    name: 'Campaign Info',
    description: 'Campaign tracking information',
    type: 'text',
    category: 'tracking'
  },
  {
    id: 'cj09pOhxqE4WOOKqQVhK',
    name: 'Campaign Type',
    description: 'Type of campaign',
    type: 'text',
    category: 'tracking'
  },
  {
    id: 'uy0zwqA52VW1JlLfZ6a6',
    name: 'Ad Account ID',
    description: 'Facebook ad account ID',
    type: 'text',
    category: 'tracking'
  },
  {
    id: 'ezTpZWktcRZAFX2gvuaG',
    name: 'Campaign ID',
    description: 'Facebook campaign ID',
    type: 'text',
    category: 'tracking'
  },
  {
    id: 'phPaAW2mN1KrjtQuSSew',
    name: 'Ad Set ID',
    description: 'Facebook ad set ID',
    type: 'text',
    category: 'tracking'
  },

  // Other Fields
  {
    id: 'klgLSEZH45ChqGWCprJ8',
    name: 'Business Goals',
    description: 'What they want to achieve (array)',
    type: 'array',
    category: 'other'
  },
  {
    id: 'dlLft6RcIbNiHTuDFXaK',
    name: 'Some Yes/No Field',
    description: 'Unknown Yes/No field',
    type: 'select',
    category: 'other'
  },
  {
    id: 'O8NBb6R5CNUfJXka2599',
    name: 'Notes',
    description: 'General notes field',
    type: 'text',
    category: 'other'
  },
  {
    id: 'JrHrEFdQ055Q0HJ3PiDE',
    name: 'Status',
    description: 'Status field (e.g., "Completed", "No Show")',
    type: 'text',
    category: 'other'
  },
  {
    id: 'n5pI8Nnu2YHTgSsL2mOB',
    name: 'Date Field 1',
    description: 'Unknown date field',
    type: 'date',
    category: 'other'
  },
  {
    id: 'cZsCHckmPBPzQV9z9VQ7',
    name: 'Date Field 2',
    description: 'Unknown date field',
    type: 'date',
    category: 'other'
  }
];

// Helper function to get field mapping by ID
export function getFieldMapping(fieldId: string): GHLFieldMapping | undefined {
  return GHL_FIELD_MAPPINGS.find(mapping => mapping.id === fieldId);
}

// Helper function to get field name by ID
export function getFieldName(fieldId: string): string {
  const mapping = getFieldMapping(fieldId);
  
  // Special case: if fieldId is actually a field key like 'utm_content'
  if (!mapping && fieldId === 'utm_content') {
    return 'UTM Content';
  }
  
  return mapping?.name || `Unknown Field (${fieldId})`;
}

// Helper function to get all fields by category
export function getFieldsByCategory(category: GHLFieldMapping['category']): GHLFieldMapping[] {
  return GHL_FIELD_MAPPINGS.filter(mapping => mapping.category === category);
}

// Helper function to parse field value based on type
export function parseFieldValue(fieldId: string, value: any): any {
  const mapping = getFieldMapping(fieldId);
  if (!mapping) return value;

  switch (mapping.type) {
    case 'date':
      // Parse timestamp to Date object
      if (typeof value === 'string' && /^\d+$/.test(value)) {
        return new Date(parseInt(value));
      }
      return value;
    
    case 'number':
      return typeof value === 'string' ? parseFloat(value) : value;
    
    case 'array':
      return Array.isArray(value) ? value : [value];
    
    default:
      return value;
  }
}

// Export field IDs for easy access
export const FIELD_IDS = {
  // Application
  FA_APPLICATION_DATE: 'hWiYPVIxzb8z69ZSqP1j',
  
  // Qualification
  CAPITAL_AVAILABLE: 'UAkQthswkKrPlIWQ5Mtk',
  CREDIT_SCORE: 'j4KihL9HZzwqTCEbai8b',
  EVER_GONE_THROUGH_PERSONA: 'OxRcLPgUtGHNecgWSnpB',
  ANNUAL_INCOME: 'VVOSFbxXpsppfHox2jhI',
  FUNDING_TIMELINE: 'UHOFwbbvd6VH0qwASmxX',
  LIQUIDITY_AVAILABLE: 'PNm4pD77pFMz6JUkwbf0',
  
  // Booking
  BOOKED_CALL_DATE: 'w0MiykFb25fTTFQla3bu',
  SCHEDULE_CALL_DATE: 'OOoQSSSoCsRSFlaeThRs',
  INTRO_TAKEN_DATE: 'rq6fbGioNYeOwLQQpB9Z',
  
  // Contract/Deal
  CONTRACT_SENT: 'J27nUfp0TcaaxaB0PFKJ',
  DEAL_VALUE: '8XL7uSWZ1Q4YiKZ0IbvT',
  DEAL_WON_DATE: 'S8vks1fHlmNBwjKKcQFV',
  
  // Tracking
  UTM_CONTENT: 'dydJfZGjUkyTmGm4OIef',
  UTM_SOURCE: 'XipmrnXqV46DDxVrDiYS'
} as const;