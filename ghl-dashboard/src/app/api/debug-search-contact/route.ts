import { NextResponse } from 'next/server';

const GHL_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2NhdGlvbl9pZCI6IjZLVEM2S0pNZUNhT25CVkhzdGlzIiwidmVyc2lvbiI6MSwiaWF0IjoxNzUxNDcwNTY1OTA1LCJzdWIiOiJJblFHTUM1MXFLbUkwQzMzVFRZMCJ9.-XT16wR4MwRi7brSOW105H5bezCImedheTbwOPj19HI";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || searchParams.get('query') || 'george';
    
    console.log(`🔍 Searching for contacts with query: ${query}`);
    
    // Fetch contacts
    const response = await fetch(
      'https://rest.gohighlevel.com/v1/contacts?limit=100',
      {
        headers: { 'Authorization': `Bearer ${GHL_API_KEY}` },
        signal: AbortSignal.timeout(30000)
      }
    );
    
    if (!response.ok) {
      throw new Error(`GHL API error: ${response.status}`);
    }

    const data = await response.json();
    const contacts = data.contacts || [];
    
    // Search for contacts matching the query
    const matchingContacts = contacts.filter((c: any) => {
      const searchLower = query.toLowerCase();
      return (
        (c.firstName && c.firstName.toLowerCase().includes(searchLower)) ||
        (c.lastName && c.lastName.toLowerCase().includes(searchLower)) ||
        (c.email && c.email.toLowerCase().includes(searchLower))
      );
    });
    
    if (matchingContacts.length === 0) {
      return NextResponse.json({ 
        error: 'No contacts found matching query',
        query,
        totalContactsSearched: contacts.length
      }, { status: 404 });
    }
    
    // Analyze the first matching contact in detail
    const contact = matchingContacts[0];
    
    // Find UTM fields specifically
    const utmFields = [];
    if (contact.customField) {
      contact.customField.forEach((field: any) => {
        // Check all possible UTM field patterns
        if (
          // Check field ID
          field.id === 'dydJfZGjUkyTmGm4OIef' ||
          // Check field key
          field.key === 'utm_content' ||
          field.key === 'contact.utm_content' ||
          // Check field name
          (field.name && field.name.toLowerCase().includes('utm')) ||
          // Check if value looks like UTM data
          (field.value && typeof field.value === 'string' && field.value.includes(' | ')) ||
          // Check for campaign-related fields
          (field.name && field.name.toLowerCase().includes('campaign')) ||
          (field.id === 'phPaAW2mN1KrjtQuSSew') // Ad Set ID
        ) {
          utmFields.push({
            id: field.id,
            key: field.key || 'NO_KEY',
            name: field.name || 'NO_NAME',
            value: field.value,
            valuePreview: field.value ? String(field.value).substring(0, 100) + (String(field.value).length > 100 ? '...' : '') : 'NO_VALUE'
          });
        }
      });
    }
    
    // Get all fields with values
    const fieldsWithValues = contact.customField?.filter((f: any) => f.value).map((f: any) => ({
      id: f.id,
      key: f.key || 'NO_KEY',
      name: f.name || 'NO_NAME',
      valueType: typeof f.value,
      valueLength: f.value ? String(f.value).length : 0,
      valuePreview: f.value ? String(f.value).substring(0, 50) + (String(f.value).length > 50 ? '...' : '') : ''
    })) || [];
    
    return NextResponse.json({
      contact: {
        id: contact.id,
        name: `${contact.firstName} ${contact.lastName}`,
        email: contact.email,
        dateAdded: contact.dateAdded,
        tags: contact.tags || []
      },
      utmFieldsFound: utmFields.length,
      utmFields,
      totalCustomFields: contact.customField?.length || 0,
      fieldsWithValues: fieldsWithValues.length,
      sampleFields: fieldsWithValues.slice(0, 10),
      matchingContactsCount: matchingContacts.length,
      otherMatches: matchingContacts.slice(1, 5).map((c: any) => ({
        name: `${c.firstName} ${c.lastName}`,
        email: c.email
      }))
    }, { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('❌ Contact search debug error:', error);
    return NextResponse.json(
      { error: 'Failed to search contacts', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}