import { NextResponse } from 'next/server';
import { FIELD_IDS, getFieldName } from '@/config/ghl-field-mappings';

const GHL_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2NhdGlvbl9pZCI6IjZLVEM2S0pNZUNhT25CVkhzdGlzIiwidmVyc2lvbiI6MSwiaWF0IjoxNzUxNDcwNTY1OTA1LCJzdWIiOiJJblFHTUM1MXFLbUkwQzMzVFRZMCJ9.-XT16wR4MwRi7brSOW105H5bezCImedheTbwOPj19HI";

export async function GET() {
  try {
    console.log('🔍 Debugging contract sent dates...');
    
    // Fetch contacts
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
    
    // Find contacts with Contract Sent field
    const contractContacts = contacts.filter((contact: any) => {
      const contractField = contact.customField?.find((f: any) => f.id === FIELD_IDS.CONTRACT_SENT);
      return contractField && contractField.value;
    });
    
    console.log(`Found ${contractContacts.length} contacts with contracts sent`);
    
    // Analyze each contact
    const analysis = contractContacts.map((contact: any) => {
      const contractField = contact.customField.find((f: any) => f.id === FIELD_IDS.CONTRACT_SENT);
      
      // Get all date fields for this contact
      const dateFields = contact.customField.filter((f: any) => {
        if (!f.value) return false;
        const numValue = parseInt(f.value);
        // Check if it's a valid timestamp (after 2020 and before 2030)
        return !isNaN(numValue) && numValue > 1577836800000 && numValue < 1893456000000;
      }).map((f: any) => {
        const date = new Date(parseInt(f.value));
        return {
          fieldId: f.id,
          fieldName: getFieldName(f.id),
          date: date.toISOString(),
          dateString: date.toLocaleDateString()
        };
      });
      
      return {
        name: `${contact.firstName} ${contact.lastName}`,
        email: contact.email,
        contactDate: new Date(contact.dateAdded).toLocaleDateString(),
        contractValue: contractField.value,
        dateFields: dateFields,
        tags: contact.tags || []
      };
    });
    
    // Look for patterns - which date fields appear most often with contracts
    const dateFieldFrequency: Record<string, number> = {};
    analysis.forEach((contact: any) => {
      contact.dateFields.forEach((field: any) => {
        const key = `${field.fieldId} - ${field.fieldName}`;
        dateFieldFrequency[key] = (dateFieldFrequency[key] || 0) + 1;
      });
    });
    
    return NextResponse.json({
      totalContacts: contacts.length,
      contractsFound: contractContacts.length,
      analysis: analysis.slice(0, 10), // First 10 for review
      dateFieldPatterns: dateFieldFrequency,
      recommendation: "Look for a date field that appears frequently with contracts - this might be your Contract Sent Date field"
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}