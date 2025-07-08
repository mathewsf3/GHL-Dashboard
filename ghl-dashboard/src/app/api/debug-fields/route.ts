import { NextResponse } from 'next/server';

const GHL_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2NhdGlvbl9pZCI6IjZLVEM2S0pNZUNhT25CVkhzdGlzIiwidmVyc2lvbiI6MSwiaWF0IjoxNzUxNDcwNTY1OTA1LCJzdWIiOiJJblFHTUM1MXFLbUkwQzMzVFRZMCJ9.-XT16wR4MwRi7brSOW105H5bezCImedheTbwOPj19HI";

export async function GET(request: Request) {
  try {
    console.log('🔍 Starting field analysis...');
    
    // Fetch first 100 contacts to analyze field structure
    const response = await fetch(
      'https://rest.gohighlevel.com/v1/contacts?' + 
      new URLSearchParams({
        limit: '100',
        page: '1'
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
    const contacts = data.contacts || [];
    
    console.log(`📊 Analyzing ${contacts.length} contacts for field patterns...`);
    
    // Collect all unique custom fields
    const fieldMap = new Map();
    const dateFields = new Set();
    const callRelatedFields = new Set();
    
    contacts.forEach((contact: any) => {
      if (contact.customField && Array.isArray(contact.customField)) {
        contact.customField.forEach((field: any) => {
          const fieldKey = `${field.id}|${field.name || 'Unknown'}`;
          
          if (!fieldMap.has(fieldKey)) {
            fieldMap.set(fieldKey, {
              id: field.id,
              name: field.name || 'Unknown',
              sampleValues: [],
              count: 0
            });
          }
          
          const fieldInfo = fieldMap.get(fieldKey);
          fieldInfo.count++;
          
          // Store sample values (first 3)
          if (fieldInfo.sampleValues.length < 3 && field.value && field.value !== 'null') {
            fieldInfo.sampleValues.push(field.value);
          }
          
          // Check if it might be a date field
          if (field.name) {
            const name = field.name.toLowerCase();
            if (name.includes('date') || name.includes('time') || name.includes('schedule') || name.includes('book')) {
              dateFields.add(fieldKey);
            }
            
            if (name.includes('call') || name.includes('book') || name.includes('schedule') || name.includes('intro')) {
              callRelatedFields.add(fieldKey);
            }
          }
          
          // Also check by value pattern (timestamps)
          if (field.value && typeof field.value === 'string') {
            const numValue = parseInt(field.value);
            if (!isNaN(numValue) && numValue > 1640000000000 && numValue < 2000000000000) {
              // Looks like a timestamp (between 2022-2033)
              dateFields.add(fieldKey);
            }
          }
        });
      }
    });
    
    // Convert to arrays and sort by count
    const allFields = Array.from(fieldMap.values()).sort((a, b) => b.count - a.count);
    const dateFieldsArray = Array.from(dateFields).map(key => fieldMap.get(key)).filter(Boolean);
    const callFieldsArray = Array.from(callRelatedFields).map(key => fieldMap.get(key)).filter(Boolean);
    
    console.log(`📋 Found ${allFields.length} unique fields, ${dateFieldsArray.length} potential date fields, ${callFieldsArray.length} call-related fields`);
    
    // Look specifically for "Booked Call Date" and "Schedule Call Date"
    const bookedCallFields = allFields.filter(f => 
      f.name.toLowerCase().includes('booked') && f.name.toLowerCase().includes('call')
    );
    
    const scheduleCallFields = allFields.filter(f => 
      f.name.toLowerCase().includes('schedule') && f.name.toLowerCase().includes('call')
    );
    
    return NextResponse.json({
      summary: {
        totalContacts: contacts.length,
        totalUniqueFields: allFields.length,
        potentialDateFields: dateFieldsArray.length,
        callRelatedFields: callFieldsArray.length
      },
      bookedCallFields: bookedCallFields.slice(0, 10),
      scheduleCallFields: scheduleCallFields.slice(0, 10),
      allDateFields: dateFieldsArray.slice(0, 20),
      allCallFields: callFieldsArray.slice(0, 20),
      topFields: allFields.slice(0, 30)
    });
    
  } catch (error) {
    console.error('❌ Field analysis error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to analyze fields',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}