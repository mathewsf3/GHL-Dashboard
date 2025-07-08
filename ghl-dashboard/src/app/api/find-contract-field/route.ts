import { NextResponse } from 'next/server';
import { FIELD_IDS, getFieldName } from '@/config/ghl-field-mappings';

const GHL_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2NhdGlvbl9pZCI6IjZLVEM2S0pNZUNhT25CVkhzdGlzIiwidmVyc2lvbiI6MSwiaWF0IjoxNzUxNDcwNTY1OTA1LCJzdWIiOiJJblFHTUM1MXFLbUkwQzMzVFRZMCJ9.-XT16wR4MwRi7brSOW105H5bezCImedheTbwOPj19HI";

export async function GET() {
  try {
    console.log('🔍 Searching for FA | Contract Sent field...');
    
    // Fetch contacts to analyze fields
    const response = await fetch(
      'https://rest.gohighlevel.com/v1/contacts?limit=100', 
      {
        headers: { 'Authorization': `Bearer ${GHL_API_KEY}` }
      }
    );
    
    if (!response.ok) {
      throw new Error(`GHL API error: ${response.status}`);
    }

    const data = await response.json();
    const contacts = data.contacts || [];
    
    // First, let's find contacts that have the Contract Sent URL field
    const contactsWithContracts = contacts.filter((contact: any) => {
      const contractField = contact.customField?.find((f: any) => f.id === FIELD_IDS.CONTRACT_SENT);
      return contractField && contractField.value;
    });
    
    console.log(`Found ${contactsWithContracts.length} contacts with contracts`);
    
    // Now analyze ALL fields from these contacts to find date fields
    const dateFieldCandidates: Record<string, {
      fieldId: string;
      fieldName: string;
      occurrences: number;
      sampleDates: string[];
      appearsWithContracts: number;
    }> = {};
    
    // Also collect ALL unique fields to see field names
    const allUniqueFields: Record<string, {
      fieldId: string;
      fieldName: string;
      sampleValues: string[];
      isDateField: boolean;
    }> = {};
    
    contacts.forEach((contact: any) => {
      const hasContract = contact.customField?.find((f: any) => f.id === FIELD_IDS.CONTRACT_SENT)?.value;
      
      contact.customField?.forEach((field: any) => {
        if (!field.value) return;
        
        // Collect all fields
        if (!allUniqueFields[field.id]) {
          allUniqueFields[field.id] = {
            fieldId: field.id,
            fieldName: getFieldName(field.id),
            sampleValues: [],
            isDateField: false
          };
        }
        
        if (allUniqueFields[field.id].sampleValues.length < 3) {
          allUniqueFields[field.id].sampleValues.push(field.value);
        }
        
        // Check if it's a date field
        if (/^\d{10,13}$/.test(field.value)) {
          const timestamp = parseInt(field.value);
          if (timestamp > 1577836800000 && timestamp < 1893456000000) {
            allUniqueFields[field.id].isDateField = true;
            
            if (!dateFieldCandidates[field.id]) {
              dateFieldCandidates[field.id] = {
                fieldId: field.id,
                fieldName: getFieldName(field.id),
                occurrences: 0,
                sampleDates: [],
                appearsWithContracts: 0
              };
            }
            
            dateFieldCandidates[field.id].occurrences++;
            if (hasContract) {
              dateFieldCandidates[field.id].appearsWithContracts++;
            }
            
            const date = new Date(timestamp);
            const dateStr = date.toISOString().split('T')[0];
            if (dateFieldCandidates[field.id].sampleDates.length < 5 && 
                !dateFieldCandidates[field.id].sampleDates.includes(dateStr)) {
              dateFieldCandidates[field.id].sampleDates.push(dateStr);
            }
          }
        }
      });
    });
    
    // Look for fields that might be "FA | Contract Sent" based on patterns
    const likelyContractDateFields = Object.values(dateFieldCandidates).filter(field => {
      const nameLower = field.fieldName.toLowerCase();
      return (
        nameLower.includes('contract') ||
        nameLower.includes('sent') ||
        nameLower.includes('fa') ||
        field.appearsWithContracts > 0
      );
    }).sort((a, b) => b.appearsWithContracts - a.appearsWithContracts);
    
    // Also show the unmapped date fields
    const unmappedDateFields = Object.values(dateFieldCandidates).filter(field => 
      field.fieldName.startsWith('Unknown Field') || field.fieldName.includes('Date Field')
    );
    
    // Check a specific contact with a contract to see all their fields
    let contractExampleAnalysis = null;
    if (contactsWithContracts.length > 0) {
      const exampleContact = contactsWithContracts[0];
      contractExampleAnalysis = {
        name: `${exampleContact.firstName} ${exampleContact.lastName}`,
        email: exampleContact.email,
        contractValue: exampleContact.customField?.find((f: any) => f.id === FIELD_IDS.CONTRACT_SENT)?.value,
        allFields: exampleContact.customField?.map((f: any) => {
          let displayValue = f.value;
          if (/^\d{10,13}$/.test(f.value)) {
            const timestamp = parseInt(f.value);
            if (timestamp > 1577836800000 && timestamp < 1893456000000) {
              const date = new Date(timestamp);
              displayValue = `${f.value} (${date.toISOString().split('T')[0]})`;
            }
          }
          return {
            id: f.id,
            name: getFieldName(f.id),
            value: displayValue
          };
        }) || []
      };
    }
    
    return NextResponse.json({
      summary: {
        totalContacts: contacts.length,
        contactsWithContracts: contactsWithContracts.length,
        totalDateFields: Object.keys(dateFieldCandidates).length,
        unmappedDateFields: unmappedDateFields.length
      },
      likelyContractDateFields: likelyContractDateFields,
      unmappedDateFields: unmappedDateFields,
      exampleContactWithContract: contractExampleAnalysis,
      recommendation: `
        Based on the analysis:
        1. Look for a field that appears frequently with contracts
        2. Check the unmapped date fields - one might be "FA | Contract Sent"
        3. The field should have dates around when contracts are typically sent
        4. Current unmapped date field IDs: ${unmappedDateFields.map(f => f.fieldId).join(', ')}
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