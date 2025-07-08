import { NextResponse } from 'next/server';
import { getFieldMapping, GHL_FIELD_MAPPINGS } from '@/config/ghl-field-mappings';

const GHL_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2NhdGlvbl9pZCI6IjZLVEM2S0pNZUNhT25CVkhzdGlzIiwidmVyc2lvbiI6MSwiaWF0IjoxNzUxNDcwNTY1OTA1LCJzdWIiOiJJblFHTUM1MXFLbUkwQzMzVFRZMCJ9.-XT16wR4MwRi7brSOW105H5bezCImedheTbwOPj19HI";

interface FieldAnalysis {
  id: string;
  mappedName?: string;
  description?: string;
  type?: string;
  category?: string;
  sampleValues: any[];
  uniqueValues: Set<any>;
  contactCount: number;
  fillRate: number;
  dataPatterns: {
    isDate: boolean;
    isUrl: boolean;
    isEmail: boolean;
    isNumber: boolean;
    isSelect: boolean;
    isCurrency: boolean;
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const analyzeAll = searchParams.get('all') === 'true';
    const limit = analyzeAll ? '500' : '100';
    
    console.log(`🔍 Starting comprehensive field discovery (analyzing ${limit} contacts)...`);
    
    // Fetch contacts with pagination
    let allContacts: any[] = [];
    let page = 1;
    let hasMore = true;
    const maxPages = analyzeAll ? 20 : 5; // Analyze up to 2000 or 500 contacts
    
    while (hasMore && page <= maxPages) {
      const response = await fetch(
        'https://rest.gohighlevel.com/v1/contacts?' + 
        new URLSearchParams({
          limit: '100',
          page: page.toString()
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
      const pageContacts = data.contacts || [];
      
      if (pageContacts.length === 0) {
        hasMore = false;
      } else {
        allContacts = allContacts.concat(pageContacts);
        page++;
        if (pageContacts.length < 100) {
          hasMore = false;
        }
      }
    }
    
    console.log(`📊 Analyzing ${allContacts.length} contacts for field patterns...`);
    
    // Analyze fields
    const fieldAnalysisMap = new Map<string, FieldAnalysis>();
    
    allContacts.forEach((contact: any) => {
      if (contact.customField && Array.isArray(contact.customField)) {
        contact.customField.forEach((field: any) => {
          if (!field.id) return;
          
          if (!fieldAnalysisMap.has(field.id)) {
            const mapping = getFieldMapping(field.id);
            fieldAnalysisMap.set(field.id, {
              id: field.id,
              mappedName: mapping?.name,
              description: mapping?.description,
              type: mapping?.type,
              category: mapping?.category,
              sampleValues: [],
              uniqueValues: new Set(),
              contactCount: 0,
              fillRate: 0,
              dataPatterns: {
                isDate: false,
                isUrl: false,
                isEmail: false,
                isNumber: false,
                isSelect: false,
                isCurrency: false
              }
            });
          }
          
          const analysis = fieldAnalysisMap.get(field.id)!;
          
          if (field.value !== null && field.value !== undefined && field.value !== '') {
            analysis.contactCount++;
            analysis.uniqueValues.add(field.value);
            
            // Store sample values (max 10)
            if (analysis.sampleValues.length < 10 && !analysis.sampleValues.includes(field.value)) {
              analysis.sampleValues.push(field.value);
            }
            
            // Analyze data patterns
            const valueStr = String(field.value);
            
            // Check if it's a timestamp
            if (/^\d{13}$/.test(valueStr)) {
              const timestamp = parseInt(valueStr);
              if (timestamp > 1640000000000 && timestamp < 2000000000000) {
                analysis.dataPatterns.isDate = true;
              }
            }
            
            // Check if it's a URL
            if (valueStr.match(/^https?:\/\//)) {
              analysis.dataPatterns.isUrl = true;
            }
            
            // Check if it's an email
            if (valueStr.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
              analysis.dataPatterns.isEmail = true;
            }
            
            // Check if it's a number
            if (/^\d+(\.\d+)?$/.test(valueStr) && !analysis.dataPatterns.isDate) {
              analysis.dataPatterns.isNumber = true;
            }
            
            // Check if it's currency/money
            if (valueStr.match(/\$[\d,]+/) || valueStr.match(/\d+k/)) {
              analysis.dataPatterns.isCurrency = true;
            }
          }
        });
      }
    });
    
    // Calculate fill rates and determine if fields are select/dropdown
    fieldAnalysisMap.forEach((analysis) => {
      analysis.fillRate = (analysis.contactCount / allContacts.length) * 100;
      
      // If less than 20 unique values and more than 10 contacts, likely a select field
      if (analysis.uniqueValues.size < 20 && analysis.contactCount > 10) {
        analysis.dataPatterns.isSelect = true;
      }
    });
    
    // Convert to array and sort by contact count
    const fieldAnalyses = Array.from(fieldAnalysisMap.values())
      .sort((a, b) => b.contactCount - a.contactCount);
    
    // Group by category
    const categorizedFields = {
      mapped: fieldAnalyses.filter(f => f.mappedName),
      unmapped: fieldAnalyses.filter(f => !f.mappedName),
      byCategory: {
        application: fieldAnalyses.filter(f => f.category === 'application'),
        qualification: fieldAnalyses.filter(f => f.category === 'qualification'),
        booking: fieldAnalyses.filter(f => f.category === 'booking'),
        contract: fieldAnalyses.filter(f => f.category === 'contract'),
        deal: fieldAnalyses.filter(f => f.category === 'deal'),
        tracking: fieldAnalyses.filter(f => f.category === 'tracking'),
        other: fieldAnalyses.filter(f => f.category === 'other' || !f.category)
      }
    };
    
    // Find potential date fields that aren't mapped
    const potentialDateFields = fieldAnalyses.filter(f => 
      f.dataPatterns.isDate && !f.mappedName
    );
    
    // Generate insights
    const insights = {
      totalContacts: allContacts.length,
      totalFields: fieldAnalyses.length,
      mappedFields: categorizedFields.mapped.length,
      unmappedFields: categorizedFields.unmapped.length,
      highUsageUnmappedFields: categorizedFields.unmapped.filter(f => f.fillRate > 50),
      potentialDateFields,
      recommendedMappings: categorizedFields.unmapped.map(field => {
        let suggestedType = 'text';
        if (field.dataPatterns.isDate) suggestedType = 'date';
        else if (field.dataPatterns.isUrl) suggestedType = 'url';
        else if (field.dataPatterns.isEmail) suggestedType = 'email';
        else if (field.dataPatterns.isNumber) suggestedType = 'number';
        else if (field.dataPatterns.isSelect) suggestedType = 'select';
        
        return {
          id: field.id,
          suggestedType,
          fillRate: field.fillRate,
          sampleValues: field.sampleValues.slice(0, 5),
          uniqueValueCount: field.uniqueValues.size
        };
      }).filter(f => f.fillRate > 10) // Only suggest fields with >10% usage
    };
    
    return NextResponse.json({
      summary: insights,
      fields: categorizedFields,
      fieldDetails: fieldAnalyses.map(f => ({
        id: f.id,
        mappedName: f.mappedName || 'Unknown',
        description: f.description,
        type: f.type,
        category: f.category,
        fillRate: `${f.fillRate.toFixed(1)}%`,
        contactCount: f.contactCount,
        uniqueValues: f.uniqueValues.size,
        sampleValues: Array.from(f.uniqueValues).slice(0, 10),
        dataPatterns: f.dataPatterns
      })),
      mappingConfiguration: GHL_FIELD_MAPPINGS
    });
    
  } catch (error) {
    console.error('❌ Field discovery error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to discover fields',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}