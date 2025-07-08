import { NextResponse } from 'next/server';
import { FIELD_IDS, getFieldName } from '@/config/ghl-field-mappings';

const GHL_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2NhdGlvbl9pZCI6IjZLVEM2S0pNZUNhT25CVkhzdGlzIiwidmVyc2lvbiI6MSwiaWF0IjoxNzUxNDcwNTY1OTA1LCJzdWIiOiJJblFHTUM1MXFLbUkwQzMzVFRZMCJ9.-XT16wR4MwRi7brSOW105H5bezCImedheTbwOPj19HI";

export async function GET() {
  try {
    console.log('🔍 Finding contracts sent in Jun 26 - Jul 3, 2025...');
    
    const startDate = new Date('2025-06-26');
    const endDate = new Date('2025-07-03');
    endDate.setHours(23, 59, 59, 999); // End of day
    
    // Fetch all contacts
    let allContacts: any[] = [];
    let page = 1;
    let hasMore = true;
    
    while (hasMore && page <= 20) {
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
        page++;
        if (pageContacts.length < 100) hasMore = false;
      }
    }
    
    console.log(`Total contacts fetched: ${allContacts.length}`);
    
    // Find contacts with Contract Sent field
    const contractContacts = allContacts.filter((contact: any) => {
      const contractField = contact.customField?.find((f: any) => f.id === FIELD_IDS.CONTRACT_SENT);
      return contractField && contractField.value;
    });
    
    console.log(`Contacts with contracts: ${contractContacts.length}`);
    
    // Analyze each contact with a contract
    const contractsInRange: any[] = [];
    const allContractAnalysis: any[] = [];
    
    contractContacts.forEach((contact: any) => {
      const contractField = contact.customField.find((f: any) => f.id === FIELD_IDS.CONTRACT_SENT);
      
      // Get ALL fields for this contact
      const allFields = contact.customField?.map((f: any) => {
        const fieldName = getFieldName(f.id);
        let parsedValue = f.value;
        let dateValue = null;
        
        // Try to parse as date if it's a number
        if (f.value && /^\d{10,13}$/.test(f.value)) {
          const timestamp = parseInt(f.value);
          if (timestamp > 1577836800000 && timestamp < 1893456000000) {
            dateValue = new Date(timestamp);
            parsedValue = dateValue.toISOString();
          }
        }
        
        return {
          id: f.id,
          name: fieldName,
          value: f.value,
          parsedValue: parsedValue,
          dateValue: dateValue,
          isInRange: dateValue && dateValue >= startDate && dateValue <= endDate
        };
      }) || [];
      
      // Find date fields that are in our target range
      const dateFieldsInRange = allFields.filter((f: any) => f.isInRange);
      
      const contactAnalysis = {
        name: `${contact.firstName} ${contact.lastName}`,
        email: contact.email,
        contactDate: new Date(contact.dateAdded).toISOString(),
        contractValue: contractField.value,
        tags: contact.tags || [],
        dateFieldsInRange: dateFieldsInRange,
        allDateFields: allFields.filter((f: any) => f.dateValue !== null)
      };
      
      allContractAnalysis.push(contactAnalysis);
      
      if (dateFieldsInRange.length > 0) {
        contractsInRange.push(contactAnalysis);
      }
    });
    
    // Find common date fields among contracts in range
    const dateFieldUsage: Record<string, { count: number, fieldName: string }> = {};
    contractsInRange.forEach((contact: any) => {
      contact.dateFieldsInRange.forEach((field: any) => {
        if (!dateFieldUsage[field.id]) {
          dateFieldUsage[field.id] = { count: 0, fieldName: field.name };
        }
        dateFieldUsage[field.id].count++;
      });
    });
    
    // Sort by most common
    const sortedDateFields = Object.entries(dateFieldUsage)
      .sort(([,a], [,b]) => b.count - a.count)
      .map(([fieldId, data]) => ({
        fieldId,
        fieldName: data.fieldName,
        count: data.count,
        percentage: (data.count / contractsInRange.length * 100).toFixed(1)
      }));
    
    return NextResponse.json({
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString()
      },
      summary: {
        totalContacts: allContacts.length,
        contactsWithContracts: contractContacts.length,
        contractsInDateRange: contractsInRange.length
      },
      mostLikelyContractDateFields: sortedDateFields,
      contractsInRange: contractsInRange.slice(0, 5), // Show first 5 for review
      recommendation: contractsInRange.length === 0 
        ? "No contracts found in this date range. The Contract Sent field might need a corresponding date field."
        : `Found ${contractsInRange.length} contracts in range. The most likely contract date field is: ${sortedDateFields[0]?.fieldName || 'Unknown'} (${sortedDateFields[0]?.fieldId || 'N/A'})`
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}