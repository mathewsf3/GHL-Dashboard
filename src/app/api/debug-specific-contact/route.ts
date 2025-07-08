import { NextResponse } from 'next/server';

const GHL_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2NhdGlvbl9pZCI6IjZLVEM2S0pNZUNhT25CVkhzdGlzIiwidmVyc2lvbiI6MSwiaWF0IjoxNzUxNDcwNTY1OTA1LCJzdWIiOiJJblFHTUM1MXFLbUkwQzMzVFRZMCJ9.-XT16wR4MwRi7brSOW105H5bezCImedheTbwOPj19HI";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email') || 'gpatton@stowsofficefurniture.com';
    
    console.log(`🔍 Debugging contact with email: ${email}`);
    
    // First, fetch all contacts to find the one with this email
    let allContacts: any[] = [];
    let page = 1;
    let hasMore = true;
    let contact = null;
    
    // Search through pages to find the contact
    while (hasMore && page <= 20 && !contact) {
      const response = await fetch(
        'https://rest.gohighlevel.com/v1/contacts?' + 
        new URLSearchParams({
          limit: '100',
          page: page.toString()
        }),
        {
          headers: { 'Authorization': `Bearer ${GHL_API_KEY}` },
          signal: AbortSignal.timeout(30000)
        }
      );
      
      if (!response.ok) {
        throw new Error(`GHL API error: ${response.status}`);
      }

      const data = await response.json();
      const pageContacts = data.contacts || [];
      
      // Search for contact in this page
      contact = pageContacts.find((c: any) => 
        c.email && c.email.toLowerCase() === email.toLowerCase()
      );
      
      if (contact) {
        console.log(`✅ Found contact on page ${page}`);
        break;
      }
      
      allContacts = allContacts.concat(pageContacts);
      
      if (pageContacts.length < 100) {
        hasMore = false;
      } else {
        page++;
      }
    }
    
    if (!contact) {
      // Try partial match as fallback
      console.log(`🔍 Exact match not found, trying partial match...`);
      const searchTerm = email.split('@')[0].toLowerCase();
      contact = allContacts.find((c: any) => 
        (c.email && c.email.toLowerCase().includes(searchTerm)) ||
        (c.firstName && c.firstName.toLowerCase().includes(searchTerm)) ||
        (c.lastName && c.lastName.toLowerCase().includes(searchTerm))
      );
      
      if (!contact) {
        // List some contacts to help debug
        const sampleContacts = allContacts.slice(0, 5).map(c => ({
          name: `${c.firstName} ${c.lastName}`,
          email: c.email
        }));
        
        return NextResponse.json({ 
          error: `Contact not found with email: ${email}`,
          totalContactsSearched: allContacts.length,
          sampleContacts,
          suggestion: 'Try searching with just the first name or a different email format'
        }, { status: 404 });
      }
    }
    
    // Analyze all custom fields
    const customFieldAnalysis = contact.customField?.map((field: any, index: number) => {
      // Check if this might be a UTM field based on value content
      const mightBeUTM = field.value && (
        field.value.includes('|') ||
        field.value.toLowerCase().includes('utm') ||
        field.value.toLowerCase().includes('campaign') ||
        field.value.toLowerCase().includes('fa-') ||
        field.value.includes('_')
      );
      
      return {
        index,
        id: field.id,
        key: field.key || null,
        name: field.name || null,
        value: field.value || null,
        valueLength: field.value ? field.value.length : 0,
        mightBeUTM,
        hasValue: !!field.value,
        valueType: typeof field.value,
        // Check if value looks like a structured UTM
        looksLikeStructuredUTM: field.value && field.value.split(' | ').length > 3,
        // Raw field object for complete inspection
        _raw: field
      };
    }) || [];
    
    // Find potential UTM fields
    const potentialUTMFields = customFieldAnalysis.filter((f: any) => 
      f.mightBeUTM || f.looksLikeStructuredUTM
    );
    
    // Check for any field that might contain campaign data
    const campaignRelatedFields = customFieldAnalysis.filter((f: any) => 
      f.value && (
        f.name?.toLowerCase().includes('utm') ||
        f.name?.toLowerCase().includes('campaign') ||
        f.name?.toLowerCase().includes('source') ||
        f.name?.toLowerCase().includes('medium') ||
        f.name?.toLowerCase().includes('content') ||
        f.key?.toLowerCase().includes('utm') ||
        f.key?.toLowerCase().includes('campaign') ||
        f.id === 'dydJfZGjUkyTmGm4OIef' || // Known UTM Content field ID
        f.id === 'phPaAW2mN1KrjtQuSSew' || // Known Ad Set ID
        f.looksLikeStructuredUTM
      )
    );
    
    // Get all field IDs we're currently checking
    const currentlyCheckedFieldIDs = [
      'dydJfZGjUkyTmGm4OIef', // UTM Content
      'XipmrnXqV46DDxVrDiYS', // UTM Source
      'phPaAW2mN1KrjtQuSSew', // Ad Set ID
      'Q0KWavjuX7YuGrtJaC6k', // Campaign Info
      'cj09pOhxqE4WOOKqQVhK', // Campaign Type
      'uy0zwqA52VW1JlLfZ6a6', // Ad Account ID
      'ezTpZWktcRZAFX2gvuaG', // Campaign ID
    ];
    
    // Check which of our known field IDs this contact has
    const foundKnownFields = currentlyCheckedFieldIDs.map(id => {
      const field = contact.customField?.find((f: any) => f.id === id);
      return {
        id,
        found: !!field,
        value: field?.value || null,
        name: field?.name || null
      };
    });
    
    return NextResponse.json({
      contact: {
        id: contact.id,
        name: `${contact.firstName} ${contact.lastName}`,
        email: contact.email,
        dateAdded: contact.dateAdded
      },
      summary: {
        totalCustomFields: customFieldAnalysis.length,
        fieldsWithValues: customFieldAnalysis.filter((f: any) => f.hasValue).length,
        potentialUTMFields: potentialUTMFields.length,
        campaignRelatedFields: campaignRelatedFields.length
      },
      knownFieldCheck: {
        description: 'Checking if contact has our known UTM field IDs',
        fields: foundKnownFields
      },
      potentialUTMFields,
      campaignRelatedFields,
      allCustomFields: customFieldAnalysis,
      recommendation: potentialUTMFields.length > 0 ? 
        `Found ${potentialUTMFields.length} potential UTM fields. Check the field IDs and add them to ghl-field-mappings.ts` :
        'No UTM fields found. The contact might not have campaign tracking data.',
      debugInfo: {
        searchedEmail: email,
        contactFound: true,
        customFieldCount: contact.customField?.length || 0
      }
    }, { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('❌ Contact UTM debug error:', error);
    return NextResponse.json(
      { error: 'Failed to debug contact UTM fields' },
      { status: 500 }
    );
  }
}