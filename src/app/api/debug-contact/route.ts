import { NextResponse } from 'next/server';

const GHL_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2NhdGlvbl9pZCI6IjZLVEM2S0pNZUNhT25CVkhzdGlzIiwidmVyc2lvbiI6MSwiaWF0IjoxNzUxNDcwNTY1OTA1LCJzdWIiOiJJblFHTUM1MXFLbUkwQzMzVFRZMCJ9.-XT16wR4MwRi7brSOW105H5bezCImedheTbwOPj19HI";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email') || 'tekmagix@gmail.com';
    
    console.log(`🔍 Searching for contact: ${email}`);
    
    // Fetch ALL contacts using pagination
    let allContacts: any[] = [];
    let page = 1;
    let hasMore = true;
    
    while (hasMore && page <= 50) {
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
      
      if (pageContacts.length === 0) {
        hasMore = false;
      } else {
        allContacts = allContacts.concat(pageContacts);
        page++;
        
        if (pageContacts.length < 100) {
          hasMore = false;
        }
      }
    }
    
    // Search for the specific contact
    const targetContact = allContacts.find((contact: any) => 
      contact.email === email || 
      (contact.email && contact.email.toLowerCase().includes(email.toLowerCase().split('@')[0]))
    );
    
    if (!targetContact) {
      // Show sample emails to help debug
      const sampleEmails = allContacts.slice(0, 20).map(c => c.email).filter(e => e);
      
      return NextResponse.json({
        found: false,
        message: `Contact ${email} not found`,
        totalContacts: allContacts.length,
        sampleEmails: sampleEmails
      });
    }
    
    // Analyze the contact's structure
    const analysis = {
      found: true,
      contact: {
        id: targetContact.id,
        firstName: targetContact.firstName,
        lastName: targetContact.lastName,
        email: targetContact.email,
        dateAdded: targetContact.dateAdded,
        tags: targetContact.tags || [],
        totalCustomFields: targetContact.customField?.length || 0
      },
      callRelatedFields: [],
      allCustomFields: []
    };
    
    // Find call-related fields
    if (targetContact.customField) {
      const callFields = targetContact.customField.filter((f: any) => 
        f.name && (
          f.name.toLowerCase().includes('call') || 
          f.name.toLowerCase().includes('book') ||
          f.name.toLowerCase().includes('schedule') ||
          f.name.toLowerCase().includes('intro')
        )
      );
      
      analysis.callRelatedFields = callFields.map((field: any) => ({
        name: field.name,
        id: field.id,
        value: field.value
      }));
      
      // Get all custom fields for complete analysis
      analysis.allCustomFields = targetContact.customField.map((field: any) => ({
        name: field.name || 'Unknown',
        id: field.id,
        value: field.value || 'No value'
      }));
    }
    
    return NextResponse.json(analysis);
    
  } catch (error) {
    console.error('❌ Debug contact API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch contact',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}