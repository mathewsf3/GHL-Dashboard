import { NextResponse } from 'next/server';
import { getFieldName, parseFieldValue, FIELD_IDS } from '@/config/ghl-field-mappings';

const GHL_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2NhdGlvbl9pZCI6IjZLVEM2S0pNZUNhT25CVkhzdGlzIiwidmVyc2lvbiI6MSwiaWF0IjoxNzUxNDcwNTY1OTA1LCJzdWIiOiJJblFHTUM1MXFLbUkwQzMzVFRZMCJ9.-XT16wR4MwRi7brSOW105H5bezCImedheTbwOPj19HI";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    if (!query || query.length < 2) {
      return NextResponse.json({ contacts: [], total: 0 });
    }
    
    console.log(`🔍 Searching for leads with query: "${query}"`);
    
    // Fetch ALL contacts and filter locally (GHL doesn't support search API)
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
    
    // Search by name, email, or phone
    const searchLower = query.toLowerCase();
    const matchingContacts = allContacts.filter(contact => {
      const fullName = `${contact.firstName || ''} ${contact.lastName || ''}`.toLowerCase();
      const email = (contact.email || '').toLowerCase();
      const phone = (contact.phone || '').toLowerCase();
      
      return (
        fullName.includes(searchLower) ||
        email.includes(searchLower) ||
        phone.includes(searchLower)
      );
    });
    
    // Sort by relevance (exact matches first)
    matchingContacts.sort((a, b) => {
      const aEmail = (a.email || '').toLowerCase();
      const bEmail = (b.email || '').toLowerCase();
      const aName = `${a.firstName || ''} ${a.lastName || ''}`.toLowerCase();
      const bName = `${b.firstName || ''} ${b.lastName || ''}`.toLowerCase();
      
      // Exact email match
      if (aEmail === searchLower) return -1;
      if (bEmail === searchLower) return 1;
      
      // Exact name match
      if (aName === searchLower) return -1;
      if (bName === searchLower) return 1;
      
      // Email starts with
      if (aEmail.startsWith(searchLower) && !bEmail.startsWith(searchLower)) return -1;
      if (!aEmail.startsWith(searchLower) && bEmail.startsWith(searchLower)) return 1;
      
      // Name starts with
      if (aName.startsWith(searchLower) && !bName.startsWith(searchLower)) return -1;
      if (!aName.startsWith(searchLower) && bName.startsWith(searchLower)) return 1;
      
      return 0;
    });
    
    // Limit to top 20 results
    const results = matchingContacts.slice(0, 20);
    
    // Format results with basic info for search display
    const formattedResults = results.map(contact => ({
      id: contact.id,
      firstName: contact.firstName || '',
      lastName: contact.lastName || '',
      email: contact.email || '',
      phone: contact.phone || '',
      dateAdded: contact.dateAdded,
      tags: contact.tags || [],
      // Add key custom fields for preview
      customFields: contact.customField ? {
        applicationDate: contact.customField.find((f: any) => f.id === FIELD_IDS.FA_APPLICATION_DATE)?.value,
        // Check multiple ways to find UTM content
        utmContent: contact.customField.find((f: any) => 
          f.id === FIELD_IDS.UTM_CONTENT || 
          f.key === 'utm_content' || 
          f.key === 'contact.utm_content' ||
          (f.value && 
           typeof f.value === 'string' && 
           f.value.includes(' | ') && 
           f.value.split(' | ').length >= 3)
        )?.value,
        capitalAvailable: contact.customField.find((f: any) => f.id === FIELD_IDS.CAPITAL_AVAILABLE)?.value,
        creditScore: contact.customField.find((f: any) => f.id === FIELD_IDS.CREDIT_SCORE)?.value,
      } : null
    }));
    
    console.log(`✅ Found ${formattedResults.length} matching contacts`);
    
    return NextResponse.json({
      contacts: formattedResults,
      total: formattedResults.length
    });
    
  } catch (error) {
    console.error('❌ Lead search error:', error);
    return NextResponse.json(
      { error: 'Failed to search leads' },
      { status: 500 }
    );
  }
}