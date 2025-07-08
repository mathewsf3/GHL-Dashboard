import { NextResponse } from 'next/server';

const GHL_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2NhdGlvbl9pZCI6IjZLVEM2S0pNZUNhT25CVkhzdGlzIiwidmVyc2lvbiI6MSwiaWF0IjoxNzUxNDcwNTY1OTA1LCJzdWIiOiJJblFHTUM1MXFLbUkwQzMzVFRZMCJ9.-XT16wR4MwRi7brSOW105H5bezCImedheTbwOPj19HI";

export async function GET() {
  try {
    console.log('🔍 Discovering UTM and campaign tracking fields...');
    
    // Fetch contacts with UTM data
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
    
    // Collect all field patterns related to UTM/campaign tracking
    const trackingFields = new Map();
    const utmPatterns = ['utm', 'campaign', 'source', 'medium', 'content', 'term', 'fbclid', 'gclid', 'ad', 'creative', 'placement', 'keyword'];
    
    contacts.forEach((contact: any) => {
      if (contact.customField && Array.isArray(contact.customField)) {
        contact.customField.forEach((field: any) => {
          // Check if field name or value contains tracking patterns
          const hasTrackingPattern = utmPatterns.some(pattern => {
            // Ensure field.name is a string before calling toLowerCase()
            const nameMatch = field.name && typeof field.name === 'string' && 
              field.name.toLowerCase().includes(pattern);
            
            // Ensure field.value is a string before calling toLowerCase()
            const valueMatch = field.value !== null && 
              field.value !== undefined && 
              typeof field.value === 'string' && 
              field.value.toLowerCase().includes(pattern);
            
            return nameMatch || valueMatch;
          });
          
          if (hasTrackingPattern || 
              (field.value !== null && 
               field.value !== undefined && 
               typeof field.value === 'string' && 
               field.value.includes('?'))) {
            if (!trackingFields.has(field.id)) {
              trackingFields.set(field.id, {
                id: field.id,
                name: field.name || 'Unknown',
                sampleValues: new Set(),
                count: 0
              });
            }
            
            const fieldData = trackingFields.get(field.id);
            fieldData.count++;
            if (field.value !== null && 
                field.value !== undefined && 
                fieldData.sampleValues.size < 5) {
              fieldData.sampleValues.add(String(field.value));
            }
          }
        });
      }
    });
    
    // Convert to array and sort by count
    const fieldsList = Array.from(trackingFields.values())
      .map(field => ({
        ...field,
        sampleValues: Array.from(field.sampleValues)
      }))
      .sort((a, b) => b.count - a.count);
    
    // Categorize fields with safe string checks
    const categorized = {
      utmFields: fieldsList.filter(f => 
        f.name && typeof f.name === 'string' && f.name.toLowerCase().includes('utm')
      ),
      campaignFields: fieldsList.filter(f => 
        f.name && typeof f.name === 'string' && (
          f.name.toLowerCase().includes('campaign') || 
          f.name.toLowerCase().includes('ad')
        ) && !f.name.toLowerCase().includes('utm')
      ),
      trackingIds: fieldsList.filter(f => 
        f.name && typeof f.name === 'string' && (
          f.name.toLowerCase().includes('fbclid') || 
          f.name.toLowerCase().includes('gclid') ||
          f.name.toLowerCase().includes('click')
        )
      ),
      other: fieldsList.filter(f => 
        f.name && typeof f.name === 'string' && 
        !f.name.toLowerCase().includes('utm') && 
        !f.name.toLowerCase().includes('campaign') && 
        !f.name.toLowerCase().includes('ad') &&
        !f.name.toLowerCase().includes('fbclid') &&
        !f.name.toLowerCase().includes('gclid')
      )
    };
    
    // Check for contacts with recent Meta ad data
    const recentContacts = contacts
      .filter((c: any) => {
        const hasUTM = c.customField?.some((f: any) => 
          f.value && (
            (f.name && typeof f.name === 'string' && f.name.toLowerCase().includes('utm')) || 
            f.id === 'dydJfZGjUkyTmGm4OIef'
          )
        );
        const createdRecently = new Date(c.dateAdded) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return hasUTM && createdRecently;
      })
      .slice(0, 5)
      .map((c: any) => ({
        name: `${c.firstName} ${c.lastName}`,
        dateAdded: c.dateAdded,
        utmFields: c.customField
          ?.filter((f: any) => f.value && f.name && typeof f.name === 'string' && (
            f.name.toLowerCase().includes('utm') || 
            f.name.toLowerCase().includes('campaign') ||
            f.name.toLowerCase().includes('source')
          ))
          ?.map((f: any) => ({
            id: f.id,
            name: f.name || 'Unknown',
            value: f.value
          }))
      }));
    
    return NextResponse.json({
      summary: {
        totalContactsChecked: contacts.length,
        totalTrackingFieldsFound: fieldsList.length,
        utmFieldsCount: categorized.utmFields.length,
        campaignFieldsCount: categorized.campaignFields.length
      },
      categorized,
      recentContactsWithUTM: recentContacts,
      recommendation: 'Add any missing field IDs to ghl-field-mappings.ts'
    }, { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('❌ UTM discovery error:', error);
    return NextResponse.json(
      { error: 'Failed to discover UTM fields' },
      { status: 500 }
    );
  }
}