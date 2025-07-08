import { NextResponse } from 'next/server';
import { FIELD_IDS, getFieldName } from '@/config/ghl-field-mappings';

const GHL_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2NhdGlvbl9pZCI6IjZLVEM2S0pNZUNhT25CVkhzdGlzIiwidmVyc2lvbiI6MSwiaWF0IjoxNzUxNDcwNTY1OTA1LCJzdWIiOiJJblFHTUM1MXFLbUkwQzMzVFRZMCJ9.-XT16wR4MwRi7brSOW105H5bezCImedheTbwOPj19HI";

export async function GET() {
  try {
    console.log('🔍 Looking for Evan Alexander...');
    
    // Fetch all contacts to find Evan
    let allContacts: any[] = [];
    let page = 1;
    let hasMore = true;
    
    while (hasMore && page <= 10) {
      const response = await fetch(
        `https://rest.gohighlevel.com/v1/contacts?limit=100&page=${page}`, 
        {
          headers: { 'Authorization': `Bearer ${GHL_API_KEY}` }
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
        
        // Check if we found Evan
        const evan = pageContacts.find((c: any) => 
          c.email === 'evandanielalexander@yahoo.com' ||
          (c.firstName === 'Evan' && c.lastName === 'Alexander') ||
          c.phone === '7609818497' || c.phone === '(760) 981-8497'
        );
        
        if (evan) {
          console.log('Found Evan!');
          
          // Analyze all his fields
          const analysis = {
            name: `${evan.firstName} ${evan.lastName}`,
            email: evan.email,
            phone: evan.phone,
            contactDate: new Date(evan.dateAdded).toISOString(),
            tags: evan.tags || [],
            customFields: evan.customField?.map((f: any) => {
              const fieldName = getFieldName(f.id);
              let displayValue = f.value;
              
              // Try to parse as date if it looks like a timestamp
              if (f.value && /^\d{10,13}$/.test(f.value)) {
                const timestamp = parseInt(f.value);
                if (timestamp > 1577836800000 && timestamp < 1893456000000) {
                  const date = new Date(timestamp);
                  displayValue = `${f.value} (${date.toISOString()})`;
                }
              }
              
              return {
                id: f.id,
                name: fieldName,
                value: displayValue,
                originalValue: f.value
              };
            }) || []
          };
          
          // Check specific fields
          const dealValue = evan.customField?.find((f: any) => f.id === FIELD_IDS.DEAL_VALUE);
          const dealWonDate = evan.customField?.find((f: any) => f.id === FIELD_IDS.DEAL_WON_DATE);
          const contractSent = evan.customField?.find((f: any) => f.id === FIELD_IDS.CONTRACT_SENT);
          
          return NextResponse.json({
            found: true,
            contact: analysis,
            dealInfo: {
              hasDeaValue: !!dealValue,
              dealValue: dealValue?.value,
              hasDealWonDate: !!dealWonDate,
              dealWonDate: dealWonDate ? new Date(parseInt(dealWonDate.value)).toISOString() : null,
              hasContractSent: !!contractSent,
              contractSent: contractSent?.value
            },
            dateFieldsFound: analysis.customFields.filter((f: any) => 
              f.name.includes('Date') || f.value?.includes('2025')
            ),
            message: "Check the dateFieldsFound array to see which date fields Evan has"
          }, { status: 200 });
        }
        
        page++;
        if (pageContacts.length < 100) hasMore = false;
      }
    }
    
    return NextResponse.json({
      found: false,
      totalContactsSearched: allContacts.length,
      message: "Could not find Evan Alexander in the first 1000 contacts"
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}