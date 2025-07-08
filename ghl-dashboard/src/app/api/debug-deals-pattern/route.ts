import { NextResponse } from 'next/server';
import { FIELD_IDS, getFieldName } from '@/config/ghl-field-mappings';

const GHL_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2NhdGlvbl9pZCI6IjZLVEM2S0pNZUNhT25CVkhzdGlzIiwidmVyc2lvbiI6MSwiaWF0IjoxNzUxNDcwNTY1OTA1LCJzdWIiOiJJblFHTUM1MXFLbUkwQzMzVFRZMCJ9.-XT16wR4MwRi7brSOW105H5bezCImedheTbwOPj19HI";

export async function GET() {
  try {
    console.log('🔍 Analyzing all deals won to find contract sent date pattern...');
    
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
    
    // Find contacts with Deal Won Date
    const dealsWonContacts = allContacts.filter((contact: any) => {
      const dealWonField = contact.customField?.find((f: any) => f.id === FIELD_IDS.DEAL_WON_DATE);
      return dealWonField && dealWonField.value;
    });
    
    console.log(`Contacts with deals won: ${dealsWonContacts.length}`);
    
    // Analyze each deal won contact
    const dealAnalysis = dealsWonContacts.map((contact: any) => {
      const dealWonField = contact.customField.find((f: any) => f.id === FIELD_IDS.DEAL_WON_DATE);
      const dealValueField = contact.customField?.find((f: any) => f.id === FIELD_IDS.DEAL_VALUE);
      const contractUrlField = contact.customField?.find((f: any) => f.id === FIELD_IDS.CONTRACT_SENT);
      
      const dealWonDate = new Date(parseInt(dealWonField.value));
      
      // Get all date fields for this contact
      const dateFields = contact.customField.filter((f: any) => {
        if (!f.value) return false;
        const numValue = parseInt(f.value);
        return !isNaN(numValue) && numValue > 1577836800000 && numValue < 1893456000000;
      }).map((f: any) => {
        const date = new Date(parseInt(f.value));
        return {
          id: f.id,
          name: getFieldName(f.id),
          date: date.toISOString().split('T')[0],
          timestamp: date.getTime(),
          daysBeforeDealWon: Math.floor((dealWonDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
        };
      });
      
      // Find dates that are before deal won date (potential contract sent dates)
      const datesBeforeDeal = dateFields.filter((f: any) => f.daysBeforeDealWon > 0);
      
      return {
        name: `${contact.firstName} ${contact.lastName}`,
        email: contact.email,
        dealWonDate: dealWonDate.toISOString().split('T')[0],
        dealValue: dealValueField?.value,
        hasContractUrl: !!contractUrlField,
        contractUrl: contractUrlField?.value,
        dateFieldsCount: dateFields.length,
        datesBeforeDealCount: datesBeforeDeal.length,
        dateFields: dateFields.sort((a, b) => a.timestamp - b.timestamp),
        mostLikelyContractDate: datesBeforeDeal.length > 0 
          ? datesBeforeDeal.reduce((closest, current) => 
              current.daysBeforeDealWon < closest.daysBeforeDealWon ? current : closest
            )
          : null
      };
    });
    
    // Find common date field patterns
    const dateFieldFrequency: Record<string, { 
      id: string; 
      name: string; 
      count: number; 
      appearsBeforeDeal: number;
      avgDaysBeforeDeal: number;
    }> = {};
    
    dealAnalysis.forEach((deal: any) => {
      deal.dateFields.forEach((field: any) => {
        if (!dateFieldFrequency[field.id]) {
          dateFieldFrequency[field.id] = {
            id: field.id,
            name: field.name,
            count: 0,
            appearsBeforeDeal: 0,
            avgDaysBeforeDeal: 0
          };
        }
        dateFieldFrequency[field.id].count++;
        if (field.daysBeforeDealWon > 0) {
          dateFieldFrequency[field.id].appearsBeforeDeal++;
          dateFieldFrequency[field.id].avgDaysBeforeDeal = 
            (dateFieldFrequency[field.id].avgDaysBeforeDeal * (dateFieldFrequency[field.id].appearsBeforeDeal - 1) + field.daysBeforeDealWon) 
            / dateFieldFrequency[field.id].appearsBeforeDeal;
        }
      });
    });
    
    // Sort by fields that appear most often before deal won
    const sortedDateFields = Object.values(dateFieldFrequency)
      .filter(f => f.appearsBeforeDeal > 0)
      .sort((a, b) => b.appearsBeforeDeal - a.appearsBeforeDeal);
    
    // Find unknown date fields
    const unknownDateFields = sortedDateFields.filter(f => 
      f.name.startsWith('Unknown Field') || f.name.includes('Date Field')
    );
    
    return NextResponse.json({
      summary: {
        totalContacts: allContacts.length,
        dealsWonCount: dealsWonContacts.length,
        contactsAnalyzed: dealAnalysis.length
      },
      dateFieldPatterns: {
        allDateFieldsBeforeDeals: sortedDateFields.slice(0, 10),
        unknownDateFieldsBeforeDeals: unknownDateFields,
        mostLikelyContractDateField: unknownDateFields[0] || sortedDateFields[0]
      },
      dealExamples: dealAnalysis.slice(0, 5), // Show first 5 deals
      robertAnalysis: dealAnalysis.find((d: any) => d.email === 'robert@trucapital.fund'),
      recommendation: unknownDateFields.length > 0 
        ? `The most likely contract sent date field is: ${unknownDateFields[0].name} (${unknownDateFields[0].id}) - appears ${unknownDateFields[0].appearsBeforeDeal} times before deals, avg ${Math.round(unknownDateFields[0].avgDaysBeforeDeal)} days before deal won`
        : `Check the date fields that appear before deals. The most common is: ${sortedDateFields[0]?.name || 'None found'}`
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}