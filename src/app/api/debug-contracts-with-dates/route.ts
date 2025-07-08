import { NextResponse } from 'next/server';
import { FIELD_IDS, getFieldName } from '@/config/ghl-field-mappings';

const GHL_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2NhdGlvbl9pZCI6IjZLVEM2S0pNZUNhT25CVkhzdGlzIiwidmVyc2lvbiI6MSwiaWF0IjoxNzUxNDcwNTY1OTA1LCJzdWIiOiJJblFHTUM1MXFLbUkwQzMzVFRZMCJ9.-XT16wR4MwRi7brSOW105H5bezCImedheTbwOPj19HI";

export async function GET() {
  try {
    console.log('🔍 Finding all contacts with contract URLs to identify date patterns...');
    
    // Fetch all contacts
    let allContacts: any[] = [];
    let page = 1;
    let hasMore = true;
    
    while (hasMore && page <= 30) {
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
    
    // Filter contacts with Contract URL (hasContractUrl: true)
    const contractContacts = allContacts.filter((contact: any) => {
      const contractField = contact.customField?.find((f: any) => f.id === FIELD_IDS.CONTRACT_SENT);
      return contractField && contractField.value;
    });
    
    console.log(`Contacts with contract URLs: ${contractContacts.length}`);
    
    // Track all date fields that appear with contracts
    const dateFieldStats: Record<string, {
      fieldId: string;
      fieldName: string;
      appearanceCount: number;
      sampleDates: string[];
      dateRange: { min: string; max: string };
      isUnknownField: boolean;
    }> = {};
    
    // Analyze each contact with a contract
    const contractAnalysis = contractContacts.map((contact: any) => {
      const contractField = contact.customField.find((f: any) => f.id === FIELD_IDS.CONTRACT_SENT);
      
      // Get all date fields for this contact
      const dateFields = contact.customField?.filter((f: any) => {
        if (!f.value) return false;
        const numValue = parseInt(f.value);
        return !isNaN(numValue) && numValue > 1577836800000 && numValue < 1893456000000;
      }).map((f: any) => {
        const date = new Date(parseInt(f.value));
        const fieldName = getFieldName(f.id);
        const isUnknown = fieldName.startsWith('Unknown Field') || fieldName.includes('Date Field');
        const dateStr = date.toISOString().split('T')[0];
        
        // Track this field in stats
        if (!dateFieldStats[f.id]) {
          dateFieldStats[f.id] = {
            fieldId: f.id,
            fieldName: fieldName,
            appearanceCount: 0,
            sampleDates: [],
            dateRange: { min: dateStr, max: dateStr },
            isUnknownField: isUnknown
          };
        }
        
        dateFieldStats[f.id].appearanceCount++;
        if (dateFieldStats[f.id].sampleDates.length < 5 && !dateFieldStats[f.id].sampleDates.includes(dateStr)) {
          dateFieldStats[f.id].sampleDates.push(dateStr);
        }
        
        // Update date range
        if (dateStr < dateFieldStats[f.id].dateRange.min) {
          dateFieldStats[f.id].dateRange.min = dateStr;
        }
        if (dateStr > dateFieldStats[f.id].dateRange.max) {
          dateFieldStats[f.id].dateRange.max = dateStr;
        }
        
        return {
          fieldId: f.id,
          fieldName: fieldName,
          date: dateStr,
          isUnknown: isUnknown
        };
      }) || [];
      
      // Find unknown date fields
      const unknownDateFields = dateFields.filter(f => f.isUnknown);
      
      return {
        name: `${contact.firstName} ${contact.lastName}`,
        email: contact.email,
        contractUrl: contractField.value.substring(0, 50) + '...',
        dateAdded: new Date(contact.dateAdded).toISOString().split('T')[0],
        totalDateFields: dateFields.length,
        unknownDateFieldsCount: unknownDateFields.length,
        dateFields: dateFields,
        unknownDateFields: unknownDateFields
      };
    });
    
    // Sort date fields by appearance count
    const sortedDateFields = Object.values(dateFieldStats)
      .sort((a, b) => b.appearanceCount - a.appearanceCount);
    
    // Get unknown date fields only
    const unknownDateFieldsOnly = sortedDateFields.filter(f => f.isUnknownField);
    
    // Find the June 26 - July 3 range we're looking for
    const targetStartDate = new Date('2025-06-26');
    const targetEndDate = new Date('2025-07-03');
    
    // Check which contacts have dates in our target range
    const contactsWithDatesInRange = contractAnalysis.filter(contact => 
      contact.dateFields.some(f => {
        const date = new Date(f.date);
        return date >= targetStartDate && date <= targetEndDate;
      })
    );
    
    // Find which date fields have values in our target range
    const fieldsWithDatesInRange = Object.values(dateFieldStats).filter(field => {
      return field.sampleDates.some(dateStr => {
        const date = new Date(dateStr);
        return date >= targetStartDate && date <= targetEndDate;
      });
    });
    
    return NextResponse.json({
      summary: {
        totalContacts: allContacts.length,
        contractsWithUrls: contractContacts.length,
        uniqueDateFieldsFound: Object.keys(dateFieldStats).length,
        unknownDateFieldsFound: unknownDateFieldsOnly.length
      },
      targetDateRange: {
        start: '2025-06-26',
        end: '2025-07-03',
        contractsInRange: contactsWithDatesInRange.length,
        fieldsWithDatesInRange: fieldsWithDatesInRange
      },
      dateFieldStatistics: {
        allFields: sortedDateFields.slice(0, 10),
        unknownFieldsOnly: unknownDateFieldsOnly
      },
      sampleContracts: contractAnalysis.slice(0, 5),
      robertContract: contractAnalysis.find(c => c.email === 'robert@trucapital.fund'),
      recommendation: `
        Based on ${contractContacts.length} contracts analyzed:
        ${unknownDateFieldsOnly.length > 0 
          ? `Found ${unknownDateFieldsOnly.length} unknown date fields. The most common is: ${unknownDateFieldsOnly[0].fieldName} (${unknownDateFieldsOnly[0].fieldId}) appearing in ${unknownDateFieldsOnly[0].appearanceCount} contracts.`
          : 'No unknown date fields found. The contract sent date might be one of the mapped fields or not populated.'}
        
        ${fieldsWithDatesInRange.length > 0
          ? `Fields with dates in Jun 26-Jul 3 range: ${fieldsWithDatesInRange.map(f => f.fieldName).join(', ')}`
          : 'No date fields found with values in the Jun 26-Jul 3 range.'}
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