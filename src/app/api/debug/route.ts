import { NextResponse } from 'next/server';

const GHL_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2NhdGlvbl9pZCI6IjZLVEM2S0pNZUNhT25CVkhzdGlzIiwidmVyc2lvbiI6MSwiaWF0IjoxNzUxNDcwNTY1OTA1LCJzdWIiOiJJblFHTUM1MXFLbUkwQzMzVFRZMCJ9.-XT16wR4MwRi7brSOW105H5bezCImedheTbwOPj19HI";

export async function GET() {
  try {
    console.log('🔍 Debugging GHL data structure...');
    
    // Fetch first 20 contacts to analyze their structure
    const response = await fetch(
      'https://rest.gohighlevel.com/v1/contacts?' + 
      new URLSearchParams({
        includeCustomFields: 'true',
        limit: '20'
      }), 
      {
        headers: {
          'Authorization': `Bearer ${GHL_API_KEY}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`GHL API error: ${response.status}`);
    }

    const data = await response.json();
    const contacts = data.contacts || [];
    
    console.log(`📊 Analyzing ${contacts.length} contacts...`);

    // Analyze data structure
    const analysis = {
      sampleContact: contacts[0] || null,
      uniqueTags: new Set<string>(),
      customFieldIds: new Set<string>(),
      fieldValues: {} as any,
      contactsWithApplication: 0,
      contactsWithCallBooked: 0,
      tagExamples: [] as string[]
    };

    contacts.forEach((contact: any, index: number) => {
      // Collect tags
      if (contact.tags) {
        contact.tags.forEach((tag: string) => {
          analysis.uniqueTags.add(tag);
          if (analysis.tagExamples.length < 20) {
            analysis.tagExamples.push(tag);
          }
        });
      }

      // Collect custom fields
      if (contact.customField) {
        contact.customField.forEach((field: any) => {
          analysis.customFieldIds.add(field.id);
          
          // Store field values for analysis
          if (!analysis.fieldValues[field.id]) {
            analysis.fieldValues[field.id] = {
              name: field.name || 'Unknown',
              values: new Set()
            };
          }
          if (field.value) {
            analysis.fieldValues[field.id].values.add(field.value);
          }

          // Count specific fields
          if (field.id === 'hWiYPVIxzb8z69ZSqP1j' && field.value) {
            analysis.contactsWithApplication++;
          }
          if (field.id === 'w0MiykFb25fTTFQla3bu' && field.value) {
            analysis.contactsWithCallBooked++;
          }
        });
      }
    });

    // Convert sets to arrays for JSON response
    const result = {
      totalContacts: contacts.length,
      sampleContact: analysis.sampleContact,
      uniqueTagsCount: analysis.uniqueTags.size,
      tagExamples: analysis.tagExamples,
      uniqueTags: Array.from(analysis.uniqueTags),
      customFieldCount: analysis.customFieldIds.size,
      customFieldIds: Array.from(analysis.customFieldIds),
      fieldAnalysis: Object.fromEntries(
        Object.entries(analysis.fieldValues).map(([id, data]: [string, any]) => [
          id, 
          {
            name: data.name,
            uniqueValues: Array.from(data.values),
            valueCount: data.values.size
          }
        ])
      ),
      contactsWithApplication: analysis.contactsWithApplication,
      contactsWithCallBooked: analysis.contactsWithCallBooked,
      keyFields: {
        'hWiYPVIxzb8z69ZSqP1j': 'FA Application Date',
        'UAkQthswkKrPlIWQ5Mtk': 'Capital Available',
        'j4KihL9HZzwqTCEbai8b': 'Credit Score',
        'w0MiykFb25fTTFQla3bu': 'Booked Call Date'
      }
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to debug GHL data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}