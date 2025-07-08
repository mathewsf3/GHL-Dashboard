import { NextResponse } from 'next/server';

const GHL_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2NhdGlvbl9pZCI6IjZLVEM2S0pNZUNhT25CVkhzdGlzIiwidmVyc2lvbiI6MSwiaWF0IjoxNzUxNDcwNTY1OTA1LCJzdWIiOiJJblFHTUM1MXFLbUkwQzMzVFRZMCJ9.-XT16wR4MwRi7brSOW105H5bezCImedheTbwOPj19HI";

export async function GET(request: Request) {
  try {
    console.log('🔍 Searching for contacts with liquidity-related fields...');
    
    // Fetch contacts to analyze their fields
    const response = await fetch(
      'https://rest.gohighlevel.com/v1/contacts?limit=100',
      {
        headers: { 'Authorization': `Bearer ${GHL_API_KEY}` },
        signal: AbortSignal.timeout(30000)
      }
    );
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    const contacts = data.contacts || [];
    
    // Look for fields that might contain liquidity information
    const liquidityPatterns = [
      'liquidity',
      'liquid',
      'low 4',
      '$1,000 - $3,999',
      '1000-3999',
      '1k-3.9k',
      '1k-4k'
    ];
    
    const potentialLiquidityFields = new Map();
    const contactsWithLiquidity = [];
    
    contacts.forEach((contact: any) => {
      if (contact.customField && Array.isArray(contact.customField)) {
        contact.customField.forEach((field: any) => {
          const fieldValue = field.value?.toLowerCase() || '';
          const fieldName = field.name?.toLowerCase() || '';
          const fieldKey = field.key?.toLowerCase() || '';
          
          // Check if this field might be liquidity-related
          const isLiquidityField = liquidityPatterns.some(pattern => 
            fieldValue.includes(pattern.toLowerCase()) ||
            fieldName.includes(pattern.toLowerCase()) ||
            fieldKey.includes(pattern.toLowerCase())
          );
          
          if (isLiquidityField || fieldValue.includes('low') || fieldValue.includes('$')) {
            // Track this field
            const fieldInfo = potentialLiquidityFields.get(field.id) || {
              id: field.id,
              name: field.name || 'Unknown',
              key: field.key || 'Unknown',
              values: new Set(),
              count: 0
            };
            
            if (field.value) {
              fieldInfo.values.add(field.value);
              fieldInfo.count++;
            }
            
            potentialLiquidityFields.set(field.id, fieldInfo);
            
            // Track contacts with potential liquidity fields
            if (fieldValue.includes('low') || fieldValue.includes('1,000') || fieldValue.includes('3,999')) {
              contactsWithLiquidity.push({
                contactId: contact.id,
                contactName: `${contact.firstName} ${contact.lastName}`,
                fieldId: field.id,
                fieldName: field.name,
                fieldValue: field.value
              });
            }
          }
        });
      }
    });
    
    // Convert Map to array for response
    const liquidityFieldsArray = Array.from(potentialLiquidityFields.values()).map(field => ({
      ...field,
      values: Array.from(field.values)
    }));
    
    // Sort by count to show most likely fields first
    liquidityFieldsArray.sort((a, b) => b.count - a.count);
    
    return NextResponse.json({
      summary: {
        totalContactsAnalyzed: contacts.length,
        potentialLiquidityFieldsFound: liquidityFieldsArray.length,
        contactsWithLiquidityValues: contactsWithLiquidity.length
      },
      potentialLiquidityFields: liquidityFieldsArray,
      contactsWithLiquidity: contactsWithLiquidity.slice(0, 10), // Show first 10
      recommendation: `
        Based on the analysis:
        1. Look for fields with values like "Low 4 - $1,000 - $3,999"
        2. Check the field IDs above and identify which one is "Liquidity Available"
        3. Add the field to ghl-field-mappings.ts
        4. Update the MQL filtering logic in dashboard/route.ts
      `
    }, { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('❌ Liquidity field discovery error:', error);
    return NextResponse.json(
      { error: 'Failed to discover liquidity fields' },
      { status: 500 }
    );
  }
}