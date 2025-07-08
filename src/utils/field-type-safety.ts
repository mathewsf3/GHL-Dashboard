/**
 * Type-safe utility functions for working with GHL custom fields
 * Prevents runtime errors when field values are not strings
 */

/**
 * Safely check if a value contains a substring
 */
export function safeIncludes(value: any, searchTerm: string): boolean {
  return value !== null && 
         value !== undefined && 
         typeof value === 'string' && 
         value.includes(searchTerm);
}

/**
 * Safely convert a value to lowercase
 */
export function safeLowerCase(value: any): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value.toLowerCase();
  return String(value).toLowerCase();
}

/**
 * Safely check if a value starts with a substring
 */
export function safeStartsWith(value: any, searchTerm: string): boolean {
  return value !== null && 
         value !== undefined && 
         typeof value === 'string' && 
         value.startsWith(searchTerm);
}

/**
 * Safely split a string value
 */
export function safeSplit(value: any, delimiter: string): string[] {
  if (value === null || value === undefined || typeof value !== 'string') {
    return [];
  }
  return value.split(delimiter);
}

/**
 * Check if a value is a valid string
 */
export function isValidString(value: any): value is string {
  return value !== null && 
         value !== undefined && 
         typeof value === 'string';
}

/**
 * Check if a custom field contains UTM data
 */
export function hasUTMData(field: any): boolean {
  // Check by known field IDs
  const UTM_FIELD_IDS = [
    'dydJfZGjUkyTmGm4OIef', // UTM Content
    'XipmrnXqV46DDxVrDiYS', // UTM Source
    'phPaAW2mN1KrjtQuSSew', // Ad Set ID
  ];
  
  if (UTM_FIELD_IDS.includes(field.id)) {
    return isValidString(field.value) && field.value.length > 0;
  }
  
  // Check by field key
  if (isValidString(field.key)) {
    const keyLower = field.key.toLowerCase();
    if (keyLower.includes('utm') || keyLower.includes('campaign')) {
      return isValidString(field.value) && field.value.length > 0;
    }
  }
  
  // Check by field name
  if (isValidString(field.name)) {
    const nameLower = field.name.toLowerCase();
    if (nameLower.includes('utm') || nameLower.includes('campaign')) {
      return isValidString(field.value) && field.value.length > 0;
    }
  }
  
  // Check by value structure (pipe-delimited UTM format)
  if (isValidString(field.value) && field.value.includes(' | ')) {
    const parts = field.value.split(' | ');
    return parts.length >= 3; // Valid UTM structure has at least 3 parts
  }
  
  return false;
}

/**
 * Safely extract UTM data from a field value
 */
export function parseUTMContent(value: any): {
  campaignCode?: string;
  adId?: string;
  version?: string;
  campaignName?: string;
  adCopy?: string;
  contentCode?: string;
  headlineCode?: string;
  metaId?: string;
  isValid: boolean;
} {
  if (!isValidString(value) || !value.includes(' | ')) {
    return { isValid: false };
  }
  
  const parts = value.split(' | ');
  if (parts.length < 3) {
    return { isValid: false };
  }
  
  return {
    campaignCode: parts[0] || undefined,
    adId: parts[1] || undefined,
    version: parts[2] || undefined,
    campaignName: parts[3] || undefined,
    adCopy: parts[4] || undefined,
    contentCode: parts[5] || undefined,
    headlineCode: parts[6] || undefined,
    metaId: parts[7] || undefined,
    isValid: true
  };
}

/**
 * Find a custom field by multiple criteria with type safety
 */
export function findCustomField(
  customFields: any[], 
  criteria: {
    id?: string;
    key?: string;
    name?: string;
    valueIncludes?: string;
  }
): any | undefined {
  if (!Array.isArray(customFields)) return undefined;
  
  return customFields.find(field => {
    if (criteria.id && field.id === criteria.id) return true;
    
    if (criteria.key && isValidString(field.key) && 
        field.key.toLowerCase() === criteria.key.toLowerCase()) return true;
    
    if (criteria.name && isValidString(field.name) && 
        field.name.toLowerCase() === criteria.name.toLowerCase()) return true;
    
    if (criteria.valueIncludes && safeIncludes(field.value, criteria.valueIncludes)) return true;
    
    return false;
  });
}

/**
 * Get a display-friendly value from a custom field
 */
export function getFieldDisplayValue(field: any): string {
  if (!field || field.value === null || field.value === undefined) {
    return '-';
  }
  
  // Handle Unix timestamps
  if (typeof field.value === 'number' || 
      (typeof field.value === 'string' && /^\d{13}$/.test(field.value))) {
    const timestamp = typeof field.value === 'string' ? parseInt(field.value) : field.value;
    if (timestamp > 1640000000000 && timestamp < 2000000000000) {
      return new Date(timestamp).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  }
  
  // Handle boolean-like values
  if (field.value === true || field.value === 'true' || field.value === 'Yes') {
    return 'Yes';
  }
  if (field.value === false || field.value === 'false' || field.value === 'No') {
    return 'No';
  }
  
  // Default: convert to string
  return String(field.value);
}

/**
 * Safely get a contact's full name
 */
export function getContactFullName(contact: any): string {
  if (!contact) return 'Unknown Contact';
  
  const firstName = contact.firstName || contact.first_name || '';
  const lastName = contact.lastName || contact.last_name || '';
  
  if (!firstName && !lastName) return 'Unknown Contact';
  
  return `${firstName} ${lastName}`.trim();
}

/**
 * Safely get a contact's first name
 */
export function getContactFirstName(contact: any): string {
  if (!contact) return 'Unknown';
  return contact.firstName || contact.first_name || 'Unknown';
}

/**
 * Safely get a contact's last name
 */
export function getContactLastName(contact: any): string {
  if (!contact) return '';
  return contact.lastName || contact.last_name || '';
}

/**
 * Safely get a contact's email
 */
export function getContactEmail(contact: any): string {
  if (!contact) return 'No email';
  return contact.email || 'No email';
}

/**
 * Safely get a contact's phone
 */
export function getContactPhone(contact: any): string {
  if (!contact) return 'No phone';
  return contact.phone || 'No phone';
}

/**
 * Create a safe contact object with all required fields
 */
export function createSafeContact(contact: any): {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  fullName: string;
} {
  return {
    id: contact?.id || '',
    firstName: getContactFirstName(contact),
    lastName: getContactLastName(contact),
    email: getContactEmail(contact),
    phone: getContactPhone(contact),
    fullName: getContactFullName(contact)
  };
}
