import { NextResponse } from 'next/server';

const GHL_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2NhdGlvbl9pZCI6IjZLVEM2S0pNZUNhT25CVkhzdGlzIiwidmVyc2lvbiI6MSwiaWF0IjoxNzUxNDcwNTY1OTA1LCJzdWIiOiJJblFHTUM1MXFLbUkwQzMzVFRZMCJ9.-XT16wR4MwRi7brSOW105H5bezCImedheTbwOPj19HI";

export async function GET(request: Request) {
  try {
    console.log('🔍 Starting deal analysis...');
    
    // Fetch all contacts with pagination
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
    
    console.log(`📊 Analyzing ${allContacts.length} contacts for deal patterns...`);
    
    // Find all contacts with deal values
    const contactsWithDeals = allContacts.filter((contact: any) => {
      const dealValueField = contact.customField?.find((f: any) => f.id === '8XL7uSWZ1Q4YiKZ0IbvT');
      return dealValueField && dealValueField.value;
    });
    
    console.log(`🏆 Found ${contactsWithDeals.length} contacts with deal values`);
    
    // Analyze each contact with a deal
    const dealAnalysis = contactsWithDeals.map((contact: any) => {
      const dealValueField = contact.customField.find((f: any) => f.id === '8XL7uSWZ1Q4YiKZ0IbvT');
      const possibleDateField = contact.customField.find((f: any) => f.id === 'S8vks1fHlmNBwjKKcQFV');
      const contactDate = new Date(contact.dateAdded);
      
      // Look for any date fields
      const dateFields = contact.customField.filter((f: any) => {
        if (!f.value) return false;
        const numValue = parseInt(f.value);
        return !isNaN(numValue) && numValue > 1640000000000 && numValue < 2000000000000;
      }).map((f: any) => ({
        id: f.id,
        value: f.value,
        date: new Date(parseInt(f.value)).toISOString().split('T')[0]
      }));
      
      return {
        name: `${contact.firstName} ${contact.lastName}`,
        email: contact.email,
        dealValue: dealValueField.value,
        contactDateAdded: contactDate.toISOString().split('T')[0],
        possibleDealWonDate: possibleDateField ? new Date(parseInt(possibleDateField.value)).toISOString().split('T')[0] : null,
        allDateFields: dateFields,
        allFieldIds: contact.customField.map((f: any) => f.id).join(', ')
      };
    });
    
    return NextResponse.json({
      summary: {
        totalContacts: allContacts.length,
        contactsWithDeals: contactsWithDeals.length
      },
      deals: dealAnalysis
    });
    
  } catch (error) {
    console.error('❌ Deal analysis error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to analyze deals',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}