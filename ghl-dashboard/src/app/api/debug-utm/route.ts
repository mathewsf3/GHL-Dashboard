import { NextRequest, NextResponse } from 'next/server';
import { FIELD_IDS } from '@/config/ghl-field-mappings';

const GHL_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2NhdGlvbl9pZCI6IjZLVEM2S0pNZUNhT25CVkhzdGlzIiwidmVyc2lvbiI6MSwiaWF0IjoxNzUxNDcwNTY1OTA1LCJzdWIiOiJJblFHTUM1MXFLbUkwQzMzVFRZMCJ9.-XT16wR4MwRi7brSOW105H5bezCImedheTbwOPj19HI";

export async function GET(request: NextRequest) {
  try {
    // Fetch first 10 contacts with custom fields
    const url = `https://rest.gohighlevel.com/v1/contacts/?limit=10`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${GHL_API_KEY}`,
        'Version': '2021-07-28'
      }
    });

    if (!response.ok) {
      throw new Error(`GHL API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract UTM content values
    const utmValues = data.contacts.map((contact: any) => {
      const utmField = contact.customField?.find((f: any) => f.id === FIELD_IDS.UTM_CONTENT);
      const adSetIdField = contact.customField?.find((f: any) => f.id === 'phPaAW2mN1KrjtQuSSew');
      
      return {
        name: contact.name,
        email: contact.email,
        utmContent: utmField?.value || 'NO UTM',
        adSetId: adSetIdField?.value || 'NO AD SET ID',
        allFields: contact.customField?.map((f: any) => ({
          id: f.id,
          value: f.value
        }))
      };
    });
    
    return NextResponse.json({
      totalContacts: data.contacts.length,
      utmFieldId: FIELD_IDS.UTM_CONTENT,
      contacts: utmValues
    });
  } catch (error: any) {
    console.error('Debug UTM error:', error);
    return NextResponse.json({ 
      error: 'Failed to debug UTM values',
      details: error.message 
    }, { status: 500 });
  }
}