import { NextResponse } from 'next/server';

const GHL_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2NhdGlvbl9pZCI6IjZLVEM2S0pNZUNhT25CVkhzdGlzIiwidmVyc2lvbiI6MSwiaWF0IjoxNzUxNDcwNTY1OTA1LCJzdWIiOiJJblFHTUM1MXFLbUkwQzMzVFRZMCJ9.-XT16wR4MwRi7brSOW105H5bezCImedheTbwOPj19HI";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const contactId = searchParams.get('id');
    const searchName = searchParams.get('name');
    
    if (!contactId && !searchName) {
      return NextResponse.json({ 
        error: 'Please provide either ?id=contactId or ?name=firstName to debug' 
      }, { status: 400 });
    }
    
    let contact = null;
    
    if (contactId) {
      // Fetch specific contact by ID
      const response = await fetch(
        `https://rest.gohighlevel.com/v1/contacts/${contactId}`,
        {
          headers: { 'Authorization': `Bearer ${GHL_API_KEY}` },
          signal: AbortSignal.timeout(10000)
        }
      );
      
      if (response.ok) {
        contact = await response.json();
      }
    } else if (searchName) {
      // Search for contact by name
      const response = await fetch(
        'https://rest.gohighlevel.com/v1/contacts?limit=100',
        {
          headers: { 'Authorization': `Bearer ${GHL_API_KEY}` },
          signal: AbortSignal.timeout(30000)
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        const contacts = data.contacts || [];
        contact = contacts.find((c: any) => 
          c.firstName?.toLowerCase().includes(searchName.toLowerCase()) ||
          c.lastName?.toLowerCase().includes(searchName.toLowerCase())
        );
      }
    }
    
    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }
    
    // Extract all fields with detailed info
    const allFields = contact.customField?.map((field: any) => ({
      id: field.id,
      key: field.key || 'NO_KEY',
      name: field.name || 'NO_NAME',
      value: field.value || 'NO_VALUE',
      type: typeof field.value,
      isUTM: field.name?.toLowerCase().includes('utm') || 
             field.key?.toLowerCase().includes('utm') ||
             field.value?.toLowerCase()?.includes('utm'),
      isCampaign: field.name?.toLowerCase().includes('campaign') || 
                  field.key?.toLowerCase().includes('campaign') ||
                  field.value?.toLowerCase()?.includes('campaign'),
      isTracking: field.name?.toLowerCase().includes('ad') || 
                  field.name?.toLowerCase().includes('source') ||
                  field.name?.toLowerCase().includes('fbclid') ||
                  field.name?.toLowerCase().includes('gclid')
    })) || [];
    
    // Group fields by type
    const fieldGroups = {
      utmFields: allFields.filter((f: any) => f.isUTM),
      campaignFields: allFields.filter((f: any) => f.isCampaign && !f.isUTM),
      trackingFields: allFields.filter((f: any) => f.isTracking && !f.isUTM && !f.isCampaign),
      otherFields: allFields.filter((f: any) => !f.isUTM && !f.isCampaign && !f.isTracking)
    };
    
    // Look for fields that might contain UTM data in their values
    const fieldsWithPotentialUTM = allFields.filter((f: any) => 
      f.value && typeof f.value === 'string' && (
        f.value.includes('?') ||
        f.value.includes('utm_') ||
        f.value.includes('fbclid') ||
        f.value.includes('gclid')
      )
    );
    
    return NextResponse.json({
      contact: {
        id: contact.id,
        name: `${contact.firstName} ${contact.lastName}`,
        email: contact.email,
        dateAdded: contact.dateAdded,
        tags: contact.tags || []
      },
      fieldsSummary: {
        totalFields: allFields.length,
        fieldsWithValues: allFields.filter((f: any) => f.value).length,
        utmFields: fieldGroups.utmFields.length,
        campaignFields: fieldGroups.campaignFields.length,
        trackingFields: fieldGroups.trackingFields.length
      },
      fieldGroups,
      fieldsWithPotentialUTM,
      allFieldsRaw: allFields,
      recommendation: 'Check the field IDs above and add any missing ones to ghl-field-mappings.ts'
    }, { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('❌ Contact field debug error:', error);
    return NextResponse.json(
      { error: 'Failed to debug contact fields' },
      { status: 500 }
    );
  }
}