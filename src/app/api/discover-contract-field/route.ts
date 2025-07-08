import { NextResponse } from 'next/server';
import { getFieldName } from '@/config/ghl-field-mappings';

const GHL_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2NhdGlvbl9pZCI6IjZLVEM2S0pNZUNhT25CVkhzdGlzIiwidmVyc2lvbiI6MSwiaWF0IjoxNzUxNDcwNTY1OTA1LCJzdWIiOiJJblFHTUM1MXFLbUkwQzMzVFRZMCJ9.-XT16wR4MwRi7brSOW105H5bezCImedheTbwOPj19HI";

export async function GET() {
  try {
    console.log('🔍 Discovering all fields that might be Contract Sent Date...');
    
    // Fetch contacts to analyze field patterns
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
    
    // Collect all unique fields
    const fieldRegistry: Record<string, {
      id: string;
      mappedName: string;
      sampleValues: string[];
      count: number;
      isDateField: boolean;
      hasContractRelatedValues: boolean;
    }> = {};
    
    contacts.forEach((contact: any) => {
      if (!contact.customField) return;
      
      contact.customField.forEach((field: any) => {
        if (!field.value) return;
        
        if (!fieldRegistry[field.id]) {
          fieldRegistry[field.id] = {
            id: field.id,
            mappedName: getFieldName(field.id),
            sampleValues: [],
            count: 0,
            isDateField: false,
            hasContractRelatedValues: false
          };
        }
        
        const registry = fieldRegistry[field.id];
        registry.count++;
        
        // Collect sample values (max 5)
        if (registry.sampleValues.length < 5 && !registry.sampleValues.includes(field.value)) {
          registry.sampleValues.push(field.value);
        }
        
        // Check if it's a date field
        if (/^\d{10,13}$/.test(field.value)) {
          const timestamp = parseInt(field.value);
          if (timestamp > 1577836800000 && timestamp < 1893456000000) {
            registry.isDateField = true;
          }
        }
        
        // Check if values contain contract-related terms
        if (field.value.toLowerCase().includes('contract') || 
            field.value.toLowerCase().includes('pandadoc') ||
            field.value.toLowerCase().includes('sent')) {
          registry.hasContractRelatedValues = true;
        }
      });
    });
    
    // Convert to array and sort by relevance
    const allFields = Object.values(fieldRegistry);
    
    // Find potential contract date fields
    const potentialContractDateFields = allFields.filter(field => {
      const nameLower = field.mappedName.toLowerCase();
      return (
        field.isDateField && (
          nameLower.includes('contract') ||
          nameLower.includes('sent') ||
          nameLower.includes('fa') ||
          nameLower.includes('date field') || // Unknown date fields
          field.mappedName.startsWith('Unknown Field')
        )
      );
    });
    
    // Find all date fields for comparison
    const allDateFields = allFields.filter(field => field.isDateField);
    
    // Format sample dates for date fields
    const formatDateFields = (fields: any[]) => {
      return fields.map(field => {
        const sampleDates = field.sampleValues.slice(0, 3).map((val: string) => {
          if (/^\d{10,13}$/.test(val)) {
            const date = new Date(parseInt(val));
            return date.toISOString().split('T')[0];
          }
          return val;
        });
        
        return {
          id: field.id,
          name: field.mappedName,
          usageCount: field.count,
          sampleDates: sampleDates
        };
      });
    };
    
    return NextResponse.json({
      summary: {
        totalContactsAnalyzed: contacts.length,
        totalUniqueFields: allFields.length,
        totalDateFields: allDateFields.length,
        potentialContractDateFields: potentialContractDateFields.length
      },
      potentialContractDateFields: formatDateFields(potentialContractDateFields),
      allDateFields: formatDateFields(allDateFields),
      unknownDateFields: formatDateFields(
        allDateFields.filter(f => f.mappedName.startsWith('Unknown Field') || f.mappedName.includes('Date Field'))
      ),
      recommendations: [
        "Check the 'unknownDateFields' section - one of these might be your Contract Sent Date",
        "Look for a field that has dates around when contracts are typically sent",
        "The field IDs 'n5pI8Nnu2YHTgSsL2mOB' and 'cZsCHckmPBPzQV9z9VQ7' are currently mapped as 'Date Field 1' and 'Date Field 2'",
        "You may need to check GHL's field settings to identify which field is used for 'FA | Contract Sent' date filtering"
      ]
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}