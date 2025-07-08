import { NextResponse } from 'next/server';
import { FIELD_IDS, getFieldName } from '@/config/ghl-field-mappings';

const GHL_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2NhdGlvbl9pZCI6IjZLVEM2S0pNZUNhT25CVkhzdGlzIiwidmVyc2lvbiI6MSwiaWF0IjoxNzUxNDcwNTY1OTA1LCJzdWIiOiJJblFHTUM1MXFLbUkwQzMzVFRZMCJ9.-XT16wR4MwRi7brSOW105H5bezCImedheTbwOPj19HI";

export async function GET() {
  try {
    console.log('🔍 Looking for Robert (robert@trucapital.fund) to analyze contract fields...');
    
    // Fetch contacts to find Robert
    let allContacts: any[] = [];
    let page = 1;
    let hasMore = true;
    let robertContact = null;
    
    while (hasMore && page <= 20 && !robertContact) {
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
      
      // Look for Robert
      robertContact = pageContacts.find((c: any) => 
        c.email === 'robert@trucapital.fund' ||
        (c.email && c.email.toLowerCase() === 'robert@trucapital.fund')
      );
      
      if (!robertContact && pageContacts.length > 0) {
        allContacts = allContacts.concat(pageContacts);
        page++;
        if (pageContacts.length < 100) hasMore = false;
      } else {
        hasMore = false;
      }
    }
    
    if (!robertContact) {
      return NextResponse.json({
        found: false,
        message: "Could not find Robert (robert@trucapital.fund)",
        totalContactsSearched: allContacts.length
      }, { status: 404 });
    }
    
    console.log('Found Robert! Analyzing his fields...');
    
    // Analyze all fields
    const allFields = robertContact.customField?.map((field: any) => {
      const fieldName = getFieldName(field.id);
      let parsedValue = field.value;
      let isDateField = false;
      let dateValue = null;
      
      // Check if it's a date field
      if (field.value && /^\d{10,13}$/.test(field.value)) {
        const timestamp = parseInt(field.value);
        if (timestamp > 1577836800000 && timestamp < 1893456000000) {
          isDateField = true;
          dateValue = new Date(timestamp);
          parsedValue = dateValue.toISOString();
        }
      }
      
      return {
        id: field.id,
        name: fieldName,
        value: field.value,
        parsedValue: parsedValue,
        isDateField: isDateField,
        dateValue: dateValue ? dateValue.toISOString().split('T')[0] : null
      };
    }) || [];
    
    // Separate date fields
    const dateFields = allFields.filter((f: any) => f.isDateField);
    const nonDateFields = allFields.filter((f: any) => !f.isDateField);
    
    // Check specific fields we're interested in
    const contractUrlField = allFields.find((f: any) => f.id === FIELD_IDS.CONTRACT_SENT);
    const dealValueField = allFields.find((f: any) => f.id === FIELD_IDS.DEAL_VALUE);
    const dealWonDateField = allFields.find((f: any) => f.id === FIELD_IDS.DEAL_WON_DATE);
    
    // Find potential contract sent date fields
    const unknownDateFields = dateFields.filter((f: any) => 
      f.name.startsWith('Unknown Field') || 
      f.name.includes('Date Field')
    );
    
    // Create timeline of all dates
    const timeline = dateFields
      .filter((f: any) => f.dateValue)
      .sort((a: any, b: any) => new Date(a.dateValue).getTime() - new Date(b.dateValue).getTime())
      .map((f: any) => ({
        fieldName: f.name,
        fieldId: f.id,
        date: f.dateValue
      }));
    
    return NextResponse.json({
      contact: {
        name: `${robertContact.firstName} ${robertContact.lastName}`,
        email: robertContact.email,
        phone: robertContact.phone,
        dateAdded: new Date(robertContact.dateAdded).toISOString().split('T')[0],
        tags: robertContact.tags || []
      },
      contractInfo: {
        hasContractUrl: !!contractUrlField,
        contractUrl: contractUrlField?.value,
        hasDealValue: !!dealValueField,
        dealValue: dealValueField?.value,
        hasDealWonDate: !!dealWonDateField,
        dealWonDate: dealWonDateField?.dateValue
      },
      dateFields: {
        total: dateFields.length,
        fields: dateFields,
        unknownDateFields: unknownDateFields
      },
      timeline: timeline,
      allFields: {
        total: allFields.length,
        dateFieldsCount: dateFields.length,
        nonDateFieldsCount: nonDateFields.length
      },
      recommendation: `
        Since Robert has a contract and deal won date, look for a date field that:
        1. Falls between contact creation and deal won date
        2. Is likely one of the unknown date fields: ${unknownDateFields.map(f => f.id).join(', ')}
        3. Should be before or on the same day as the Deal Won Date
        
        The most likely candidate would be a date field with a value between contract creation and deal closure.
      `.trim()
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}