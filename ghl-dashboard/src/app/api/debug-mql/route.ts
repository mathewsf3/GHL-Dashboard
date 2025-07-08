import { NextResponse } from 'next/server';
import { FIELD_IDS } from '@/config/ghl-field-mappings';

const GHL_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2NhdGlvbl9pZCI6IjZLVEM2S0pNZUNhT25CVkhzdGlzIiwidmVyc2lvbiI6MSwiaWF0IjoxNzUxNDcwNTY1OTA1LCJzdWIiOiJJblFHTUM1MXFLbUkwQzMzVFRZMCJ9.-XT16wR4MwRi7brSOW105H5bezCImedheTbwOPj19HI";

export async function GET(request: Request) {
  try {
    console.log('🔍 Debugging MQL counts...');
    
    const { searchParams } = new URL(request.url);
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    
    // Default to current week if not provided
    const now = new Date();
    const startDate = startDateParam ? new Date(startDateParam) : new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
    const endDate = endDateParam ? new Date(endDateParam) : now;
    
    console.log(`Date range: ${startDate.toISOString()} to ${endDate.toISOString()}`);
    
    // Fetch all contacts
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
    
    let totalApplications = 0;
    let applicationsInRange = 0;
    let mqls = 0;
    let disqualifiedByCapital = 0;
    let disqualifiedByCredit = 0;
    let disqualifiedByLiquidity = 0;
    let missingCapitalField = 0;
    let missingCreditField = 0;
    let missingLiquidityField = 0;
    
    const mqlContacts = [];
    const disqualifiedContacts = [];
    
    contacts.forEach((contact: any) => {
      if (contact.customField) {
        // Check for application
        const appField = contact.customField.find((f: any) => f.id === FIELD_IDS.FA_APPLICATION_DATE);
        if (appField && appField.value) {
          totalApplications++;
          const appDate = new Date(parseInt(appField.value));
          
          if (appDate >= startDate && appDate <= endDate) {
            applicationsInRange++;
            
            // Get field values
            const capitalField = contact.customField.find((f: any) => f.id === FIELD_IDS.CAPITAL_AVAILABLE);
            const creditField = contact.customField.find((f: any) => f.id === FIELD_IDS.CREDIT_SCORE);
            const liquidityField = contact.customField.find((f: any) => f.id === FIELD_IDS.LIQUIDITY_AVAILABLE);
            
            // Track missing fields
            if (!capitalField || !capitalField.value) missingCapitalField++;
            if (!creditField || !creditField.value) missingCreditField++;
            if (!liquidityField || !liquidityField.value) missingLiquidityField++;
            
            // Check qualification filters
            const hasQualifyingCapital = capitalField?.value !== 'Less than $1k';
            const hasQualifyingCredit = creditField?.value !== 'Less than 680';
            const hasQualifyingLiquidity = liquidityField?.value !== 'Low 4 - $1,000 - $3,999';
            
            // Track disqualifications
            if (!hasQualifyingCapital) disqualifiedByCapital++;
            if (!hasQualifyingCredit) disqualifiedByCredit++;
            if (!hasQualifyingLiquidity) disqualifiedByLiquidity++;
            
            if (hasQualifyingCapital && hasQualifyingCredit && hasQualifyingLiquidity) {
              mqls++;
              mqlContacts.push({
                id: contact.id,
                name: `${contact.firstName} ${contact.lastName}`,
                email: contact.email,
                applicationDate: appDate.toISOString(),
                capital: capitalField?.value || 'N/A',
                credit: creditField?.value || 'N/A',
                liquidity: liquidityField?.value || 'N/A'
              });
            } else {
              const reasons = [];
              if (!hasQualifyingCapital) reasons.push(`Capital: ${capitalField?.value || 'Missing'}`);
              if (!hasQualifyingCredit) reasons.push(`Credit: ${creditField?.value || 'Missing'}`);
              if (!hasQualifyingLiquidity) reasons.push(`Liquidity: ${liquidityField?.value || 'Missing'}`);
              
              disqualifiedContacts.push({
                id: contact.id,
                name: `${contact.firstName} ${contact.lastName}`,
                email: contact.email,
                applicationDate: appDate.toISOString(),
                disqualificationReasons: reasons
              });
            }
          }
        }
      }
    });
    
    return NextResponse.json({
      summary: {
        dateRange: {
          start: startDate.toISOString(),
          end: endDate.toISOString()
        },
        totalContactsAnalyzed: contacts.length,
        totalApplications: totalApplications,
        applicationsInDateRange: applicationsInRange,
        mqls: mqls,
        mqlPercentage: applicationsInRange > 0 ? ((mqls / applicationsInRange) * 100).toFixed(1) : '0'
      },
      disqualificationBreakdown: {
        byCapital: disqualifiedByCapital,
        byCredit: disqualifiedByCredit,
        byLiquidity: disqualifiedByLiquidity
      },
      missingFieldsBreakdown: {
        missingCapital: missingCapitalField,
        missingCredit: missingCreditField,
        missingLiquidity: missingLiquidityField
      },
      mqlContacts: mqlContacts.slice(0, 10), // Show first 10
      disqualifiedContacts: disqualifiedContacts.slice(0, 10), // Show first 10
      recommendation: `
        Current MQL count: ${mqls}
        Expected: 21
        
        ${mqls !== 21 ? `Discrepancy of ${21 - mqls} MQLs.
        
        Check:
        1. Date range alignment
        2. Missing field values (${missingCapitalField + missingCreditField + missingLiquidityField} total missing)
        3. Field value formatting differences
        ` : 'MQL count matches expected value!'}
      `
    }, { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('❌ MQL debug error:', error);
    return NextResponse.json(
      { error: 'Failed to debug MQL counts' },
      { status: 500 }
    );
  }
}