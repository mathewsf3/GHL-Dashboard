import { NextResponse } from 'next/server';
import { DashboardMetrics } from '@/types/dashboard';
import { getFieldName, parseFieldValue, FIELD_IDS } from '@/config/ghl-field-mappings';
import { env } from '@/config/env';
import { runtimeEnv } from '@/lib/env-loader';

async function fetchMetaAdSpend(dateRange: { startDate: Date; endDate: Date }): Promise<number> {
  const response = await fetch(
    `https://graph.facebook.com/v18.0/${runtimeEnv.META_ACCOUNT_ID}/insights?` +
    new URLSearchParams({
      fields: 'spend',
      time_range: JSON.stringify({
        since: dateRange.startDate.toISOString().split('T')[0],
        until: dateRange.endDate.toISOString().split('T')[0]
      }),
      level: 'account',
      access_token: runtimeEnv.META_ACCESS_TOKEN
    }),
    { signal: AbortSignal.timeout(10000) }
  );

  if (!response.ok) {
    throw new Error(`Meta API error: ${response.status}`);
  }

  const data = await response.json();
  const totalSpend = data.data?.reduce((sum: number, record: any) => sum + parseFloat(record.spend || 0), 0) || 0;
  
  return totalSpend;
}

async function fetchGHLMetricsByCustomFields(dateRange: { startDate: Date; endDate: Date }): Promise<{
  applications: number;
  callsBooked: number;
  mqls: number;
  contractsSent: number;
  dealsWon: number;
  introsTaken: number;
}> {
  const { startDate, endDate } = dateRange;
  
  console.log(`🚀 Fetching GHL contacts for date range: ${startDate.toISOString()} to ${endDate.toISOString()}`);
  console.log(`  Start timestamp: ${startDate.getTime()}, End timestamp: ${endDate.getTime()}`);
  
  // Fetch ALL contacts using pagination (max 100 per request)
  
  let allContacts: any[] = [];
  let page = 1;
  let hasMore = true;
  
  while (hasMore && page <= 50) { // Safety limit of 50 pages (5000 contacts max)
    
    const response = await fetch(
      'https://rest.gohighlevel.com/v1/contacts?' + 
      new URLSearchParams({
        limit: '100',
        page: page.toString()
      }), 
      {
        headers: { 'Authorization': `Bearer ${runtimeEnv.GHL_API_KEY}` },
        signal: AbortSignal.timeout(30000)
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Could not read error');
      console.error(`❌ GHL API Error ${response.status}: ${errorText}`);
      throw new Error(`GHL API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const pageContacts = data.contacts || [];
    
    if (pageContacts.length === 0) {
      hasMore = false;
    } else {
      allContacts = allContacts.concat(pageContacts);
      page++;
      
      // If we got less than 100, we're on the last page
      if (pageContacts.length < 100) {
        hasMore = false;
      }
    }
  }
  
  const contacts = allContacts;
  console.log(`📊 Fetched ${contacts.length} total contacts from GHL`);
  
  // Debug: Find specific contacts to understand field structure
  const tekmagixContact = contacts.find((contact: any) => 
    contact.email === 'tekmagix@gmail.com' || 
    (contact.email && contact.email.toLowerCase().includes('tekmagix'))
  );
  
  const robertContact = contacts.find((contact: any) => 
    contact.email === 'robert@trucapital.fund'
  );
  
  if (robertContact) {
    console.log(`🔍 ROBERT CONTRACT CONTACT ANALYSIS:`);
    console.log(`   Name: ${robertContact.firstName || 'Unknown'} ${robertContact.lastName || ''}`);
    console.log(`   Email: ${robertContact.email || 'No email'}`);
    console.log(`   Date Added: ${robertContact.dateAdded || 'Unknown'}`);
    console.log(`   Tags: ${JSON.stringify(robertContact.tags || [])}`);
    
    if (robertContact.customField) {
      // Look for contract-related fields
      const contractFields = robertContact.customField.filter((f: any) => 
        f.name && (
          f.name.toLowerCase().includes('contract') || 
          f.name.toLowerCase().includes('sent') ||
          f.name.toLowerCase().includes('deposit') ||
          f.name.toLowerCase().includes('program')
        )
      );
      
      console.log(`   Contract-related custom fields:`);
      contractFields.forEach((field: any) => {
        console.log(`     ${field.name || 'Unknown'} (${field.id}): ${field.value}`);
      });
      
      // Show ALL custom fields for this contact
      console.log(`   ALL custom fields (${robertContact.customField.length} total):`);
      robertContact.customField.forEach((field: any, index: number) => {
        if (index < 15) { // Show first 15
          const fieldName = getFieldName(field.id);
          const value = parseFieldValue(field.id, field.value);
          let displayValue = value;
          
          // Format dates nicely
          if (value instanceof Date) {
            displayValue = value.toISOString().split('T')[0];
          }
          
          console.log(`     ${fieldName}: ${displayValue || 'No value'}`);
        }
      });
    }
  }
  
  if (tekmagixContact) {
    console.log(`🔍 TEKMAGIX CONTACT ANALYSIS:`);
    console.log(`   Name: ${tekmagixContact.firstName || 'Unknown'} ${tekmagixContact.lastName || ''}`);
    console.log(`   Email: ${tekmagixContact.email || 'No email'}`);
    console.log(`   Date Added: ${tekmagixContact.dateAdded || 'Unknown'}`);
    console.log(`   Tags: ${JSON.stringify(tekmagixContact.tags || [])}`);
  }
  
  // Debug: Check first few contacts for available properties
  if (contacts.length > 0) {
    const sampleContact = contacts[0];
    const availableProps = Object.keys(sampleContact).filter(key => 
      key.toLowerCase().includes('call') || 
      key.toLowerCase().includes('book') || 
      key.toLowerCase().includes('schedule') ||
      key.toLowerCase().includes('contract') ||
      key.toLowerCase().includes('deal')
    );
    console.log(`🔍 Available contact properties (call/book/schedule/contract/deal): ${availableProps.join(', ')}`);
  }
  
  // Process contacts for metrics
  
  // Filter by custom fields and date ranges based on Supabase schema
  let applications = 0;
  let callsBooked = 0;
  let mqls = 0;
  let contractsSent = 0;
  let dealsWon = 0;
  let introsTaken = 0;
  
  // Count metrics using proper field mappings
  let totalApplications = 0;
  let totalCallsBooked = 0;
  let totalMQLs = 0;
  let totalContractsSent = 0;
  let totalDealsWon = 0;
  let totalIntrosTaken = 0;
  
  // MQL qualification tracking
  let qualifyingCapital = 0;
  let qualifyingCredit = 0;
  let qualifyingPersona = 0;
  
  
  
  contacts.forEach((contact: any) => {
    if (contact.customField) {
      // Applications: FA Application Date
      const appField = contact.customField.find((f: any) => f.id === FIELD_IDS.FA_APPLICATION_DATE);
      if (appField && appField.value) {
        totalApplications++;
        const appDate = new Date(parseInt(appField.value));
        
        // Debug first few applications
        if (totalApplications <= 5) {
          console.log(`App ${totalApplications}: ${appDate.toISOString()} (${appDate >= startDate && appDate <= endDate ? 'IN RANGE' : 'OUT OF RANGE'})`);
        }
        
        if (appDate >= startDate && appDate <= endDate) {
          applications++;
          
          // MQL Logic: Applications + qualification filters
          // MQL = Application + (Capital Available ≠ "Less than $1k") + (Credit Score ≠ "Less than 680") + (Liquidity Available ≠ "Low 4 - $1,000 - $3,999")
          
          const capitalField = contact.customField.find((f: any) => f.id === FIELD_IDS.CAPITAL_AVAILABLE);
          const creditField = contact.customField.find((f: any) => f.id === FIELD_IDS.CREDIT_SCORE);
          const liquidityField = contact.customField.find((f: any) => f.id === FIELD_IDS.LIQUIDITY_AVAILABLE);
          
          // Check qualification filters - treat missing as qualifying
          // Only disqualify if field exists AND has disqualifying value
          const hasQualifyingCapital = !capitalField || capitalField.value !== 'Less than $1k';
          const hasQualifyingCredit = !creditField || creditField.value !== 'Less than 680';
          // If liquidity field is missing, treat as qualifying. Only disqualify if explicitly "Low 4 - $1,000 - $3,999"
          const hasQualifyingLiquidity = !liquidityField || liquidityField.value !== 'Low 4 - $1,000 - $3,999';
          
          
          
          // Track individual qualifications
          if (hasQualifyingCapital) qualifyingCapital++;
          if (hasQualifyingCredit) qualifyingCredit++;
          if (hasQualifyingLiquidity) qualifyingPersona++;
          
          
          if (hasQualifyingCapital && hasQualifyingCredit && hasQualifyingLiquidity) {
            mqls++;
            totalMQLs++;
          }
        }
      }
      
      // Calls Booked: Check Booked Call Date OR Schedule Call Date in range
      let hasCallBooked = false;
      
      if (contact.customField) {
        const bookedCallField = contact.customField.find((f: any) => f.id === FIELD_IDS.BOOKED_CALL_DATE);
        const scheduleCallField = contact.customField.find((f: any) => f.id === FIELD_IDS.SCHEDULE_CALL_DATE);
        
        let qualifiesForCount = false;
        let logMessage = '';
        
        // Check: Booked Call Date in date range
        let bookedDateInRange = false;
        let scheduleDateInRange = false;
        
        if (bookedCallField && bookedCallField.value) {
          const bookedDate = new Date(parseInt(bookedCallField.value));
          if (bookedDate >= startDate && bookedDate <= endDate) {
            bookedDateInRange = true;
            qualifiesForCount = true;
            logMessage = `Booked Call Date in range: ${bookedDate.toISOString().split('T')[0]}`;
          }
        }
        
        // OR: Schedule Call Date in date range (only check if booked date not in range)
        if (!bookedDateInRange && scheduleCallField && scheduleCallField.value) {
          const scheduleDate = new Date(parseInt(scheduleCallField.value));
          if (scheduleDate >= startDate && scheduleDate <= endDate) {
            scheduleDateInRange = true;
            qualifiesForCount = true;
            logMessage = `Schedule Call Date in range: ${scheduleDate.toISOString().split('T')[0]}`;
          }
        }
        
        if (qualifiesForCount) {
          totalCallsBooked++;
          callsBooked++;
          hasCallBooked = true;
          const contactDate = new Date(contact.dateAdded);
          console.log(`📞 Call ${callsBooked}: ${logMessage}, Contact: ${contact.firstName || 'Unknown'} ${contact.lastName || ''}, Email: ${contact.email || 'No email'}`);
        }
      }
      
      // Commented out additional checks - only using Booked Call Date and Schedule Call Date fields
      // as per requirement: "Booked Call Date Range Jul 1-8 OR Schedule Call Date Range Jul 1-8"
      
      // Contracts Sent: Check Contract Sent field and use contact dateAdded for filtering
      const contractSentField = contact.customField?.find((f: any) => f.id === FIELD_IDS.CONTRACT_SENT);
      if (contractSentField && contractSentField.value) {
        totalContractsSent++;
        
        // Use contact's dateAdded as the contract sent date
        // This works because contracts are typically sent when the contact is created
        const contractDate = new Date(contact.dateAdded);
        
        if (contractDate >= startDate && contractDate <= endDate) {
          contractsSent++;
          console.log(`📋 Contract ${contractsSent}: Contact added: ${contractDate.toISOString().split('T')[0]}, URL: ${contractSentField.value.substring(0, 50)}..., Contact: ${contact.firstName || 'Unknown'} ${contact.lastName || ''} (${contact.email || 'No email'})`);
        }
      }
      
      // Deals Won: Check for deal value field and find associated date fields
      const dealValueField = contact.customField?.find((f: any) => f.id === FIELD_IDS.DEAL_VALUE);
      
      if (dealValueField && dealValueField.value) {
        // Found a contact with a deal value - analyze their date fields
        totalDealsWon++;
        
        // Look for any date fields on this contact
        const dateFields = contact.customField?.filter((f: any) => {
          if (!f.value) return false;
          const numValue = parseInt(f.value);
          return !isNaN(numValue) && numValue > 1640000000000 && numValue < 2000000000000;
        }) || [];
        
        // Log all date fields for analysis
        if (totalDealsWon <= 5) {
          console.log(`\n🔍 Deal Contact Analysis #${totalDealsWon}: ${contact.firstName || 'Unknown'} ${contact.lastName || ''} (${contact.email || 'No email'})`);
          console.log(`   Deal Value: "${dealValueField.value}"`);
          console.log(`   Contact Date: ${new Date(contact.dateAdded).toISOString().split('T')[0]}`);
          console.log(`   Date Fields Found (${dateFields.length}):`);
          dateFields.forEach((field: any) => {
            const fieldName = getFieldName(field.id);
            const date = new Date(parseInt(field.value));
            console.log(`     ${fieldName}: ${date.toISOString().split('T')[0]}`);
          });
        }
        
        // Try multiple approaches to find the deal won date
        
        // Approach 1: Look for Deal Won Date field
        let dealWonDate: Date | null = null;
        const specificDateField = contact.customField?.find((f: any) => f.id === FIELD_IDS.DEAL_WON_DATE);
        if (specificDateField && specificDateField.value) {
          dealWonDate = new Date(parseInt(specificDateField.value));
        }
        
        // Approach 2: If no specific Deal Won Date field, don't count as won deal
        // Only count deals that have both a deal value AND a deal won date field
        if (!dealWonDate) {
          if (totalDealsWon <= 5) {
            console.log(`   ⚠️ No Deal Won Date field found - not counting as won deal`);
            console.log(`   💡 To count this deal, add value to field ${FIELD_IDS.DEAL_WON_DATE}`);
          }
          return; // Skip this contact - no deal won date means not a won deal
        }
        
        // Check if the deal won date is in our range
        if (dealWonDate >= startDate && dealWonDate <= endDate) {
          dealsWon++;
          console.log(`🏆 Deal Won ${dealsWon}: Date: ${dealWonDate.toISOString().split('T')[0]}, Value: "${dealValueField.value}", Contact: ${contact.firstName || 'Unknown'} ${contact.lastName || ''} (${contact.email || 'No email'})`);
        }
      }
      
      // Intros Taken: Check Intro Taken Date field
      const introField = contact.customField.find((f: any) => f.id === FIELD_IDS.INTRO_TAKEN_DATE);
      if (introField && introField.value) {
        totalIntrosTaken++;
        const introDate = new Date(parseInt(introField.value));
        if (introDate >= startDate && introDate <= endDate) {
          introsTaken++;
        }
      }
    }
  });

  // Debug: Show what call-related fields we found
  const callRelatedFields = new Set<string>();
  contacts.forEach((contact: any) => {
    if (contact.customField) {
      contact.customField.forEach((field: any) => {
        if (field.name && (
          field.name.toLowerCase().includes('call') || 
          field.name.toLowerCase().includes('book') ||
          field.name.toLowerCase().includes('schedule')
        )) {
          callRelatedFields.add(`${field.name} (${field.id})`);
        }
      });
    }
  });
  
  console.log(`📋 Call-related fields found: ${Array.from(callRelatedFields).join(', ')}`);
  console.log(`📊 TOTAL counts (all time): Apps: ${totalApplications}, MQLs: ${totalMQLs}, Calls: ${totalCallsBooked}, Contracts: ${totalContractsSent}, Deals: ${totalDealsWon}`);
  console.log(`✅ Date range metrics: Apps: ${applications}, MQLs: ${mqls}, Calls: ${callsBooked}, Contracts: ${contractsSent}, Deals: ${dealsWon}`);
  console.log(`📅 Date range used: ${startDate.toISOString()} to ${endDate.toISOString()}`);
  console.log(`📅 Date range timestamps: ${startDate.getTime()} to ${endDate.getTime()}`);

  return {
    applications,
    callsBooked,
    mqls,
    contractsSent,
    dealsWon,
    introsTaken
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const debugContact = searchParams.get('debug');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const dateRangeParam = searchParams.get('dateRange');
    
    console.log('🚀 Fetching dashboard data...');
    
    // Parse date range from preset or use explicit dates
    let dateRange: { startDate: Date; endDate: Date };
    
    if (dateRangeParam) {
      // Handle preset date ranges
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      
      switch (dateRangeParam) {
        case 'thisWeek':
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
          weekStart.setUTCHours(0, 0, 0, 0);
          const weekEnd = new Date(now);
          weekEnd.setUTCHours(23, 59, 59, 999);
          dateRange = {
            startDate: weekStart,
            endDate: weekEnd
          };
          break;
        case 'thisMonth':
          // Use UTC to avoid timezone issues
          const monthStart = new Date(Date.UTC(currentYear, currentMonth, 1, 0, 0, 0, 0));
          const monthEnd = new Date(Date.UTC(currentYear, currentMonth, now.getDate(), 23, 59, 59, 999));
          dateRange = {
            startDate: monthStart,
            endDate: monthEnd
          };
          break;
        case 'lastMonth':
          const lastMonthStart = new Date(Date.UTC(currentYear, currentMonth - 1, 1, 0, 0, 0, 0));
          const lastMonthEnd = new Date(Date.UTC(currentYear, currentMonth, 0, 23, 59, 59, 999));
          dateRange = {
            startDate: lastMonthStart,
            endDate: lastMonthEnd
          };
          break;
        case 'last30Days':
        case 'last30d':
          const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          thirtyDaysAgo.setHours(0, 0, 0, 0);
          const today30 = new Date(now);
          today30.setHours(23, 59, 59, 999);
          dateRange = {
            startDate: thirtyDaysAgo,
            endDate: today30
          };
          break;
        case 'last7Days':
        case 'last7d':
          const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          sevenDaysAgo.setHours(0, 0, 0, 0);
          const today7 = new Date(now);
          today7.setHours(23, 59, 59, 999);
          dateRange = {
            startDate: sevenDaysAgo,
            endDate: today7
          };
          break;
        default:
          // Default to last 30 days
          dateRange = {
            startDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
            endDate: now
          };
      }
    } else {
      // Use explicit dates or defaults
      dateRange = {
        startDate: startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: endDate ? new Date(endDate) : new Date()
      };
    }
    
    console.log(`🚀 Fetching dashboard data for date range: ${dateRange.startDate.toISOString().split('T')[0]} to ${dateRange.endDate.toISOString().split('T')[0]}`);
    
    const [adSpend, ghlMetrics] = await Promise.all([
      fetchMetaAdSpend(dateRange),
      fetchGHLMetricsByCustomFields(dateRange)
    ]);

    // Calculate cost metrics with real data
    const metrics: DashboardMetrics = {
      adSpend,
      totalApplications: ghlMetrics.applications,
      costPerApplication: ghlMetrics.applications > 0 ? adSpend / ghlMetrics.applications : 0,
      totalMQLs: ghlMetrics.mqls,
      costPerMQL: ghlMetrics.mqls > 0 ? adSpend / ghlMetrics.mqls : 0,
      callsBooked: ghlMetrics.callsBooked,
      costPerCallBooked: ghlMetrics.callsBooked > 0 ? adSpend / ghlMetrics.callsBooked : 0,
      introsTaken: ghlMetrics.introsTaken,
      costPerIntroTaken: ghlMetrics.introsTaken > 0 ? adSpend / ghlMetrics.introsTaken : 0,
      contractsSent: ghlMetrics.contractsSent,
      costPerContractSent: ghlMetrics.contractsSent > 0 ? adSpend / ghlMetrics.contractsSent : 0,
      dealsWon: ghlMetrics.dealsWon,
      costPerDealWon: ghlMetrics.dealsWon > 0 ? adSpend / ghlMetrics.dealsWon : 0,
      lastUpdated: new Date().toISOString()
    };

    return NextResponse.json({
      data: metrics,
      lastUpdated: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Dashboard API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch dashboard data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}