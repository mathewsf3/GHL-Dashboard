#!/usr/bin/env python3
"""
Direct API Field Discovery - Find all custom field IDs and their values
Since the custom fields endpoint returns 404, we'll analyze contact data directly
"""

import requests
import json
import os
from datetime import datetime
from collections import defaultdict

class APIFieldDiscovery:
    def __init__(self, api_key, location_id="6KTC6KJMeCaOnBVHstis"):
        self.api_key = api_key
        self.location_id = location_id
        self.base_url = "https://rest.gohighlevel.com/v1"
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        self.field_data = defaultdict(lambda: {
            'values': set(),
            'contacts_with_field': 0,
            'sample_values': []
        })
        
    def fetch_contacts_with_fields(self, max_contacts=1000):
        """Fetch contacts and analyze their custom fields"""
        print(f"Fetching up to {max_contacts} contacts with custom fields...")
        print("="*60)
        
        offset = 0
        limit = 100
        total_fetched = 0
        contacts_with_custom_fields = 0
        
        while total_fetched < max_contacts:
            params = {
                "limit": limit,
                "offset": offset,
                "includeCustomFields": "true"
            }
            
            try:
                print(f"Fetching contacts {offset}-{offset+limit-1}...")
                response = requests.get(
                    f"{self.base_url}/contacts",
                    headers=self.headers,
                    params=params
                )
                
                if response.status_code == 200:
                    data = response.json()
                    contacts = data.get('contacts', [])
                    
                    if not contacts:
                        print("No more contacts found")
                        break
                    
                    for contact in contacts:
                        custom_fields = contact.get('customField', [])
                        
                        if custom_fields:
                            contacts_with_custom_fields += 1
                            
                        for field in custom_fields:
                            field_id = field.get('id')
                            field_value = field.get('value')
                            
                            if field_id and field_value:
                                self.field_data[field_id]['values'].add(str(field_value))
                                self.field_data[field_id]['contacts_with_field'] += 1
                                
                                # Store sample values (first 10)
                                if len(self.field_data[field_id]['sample_values']) < 10:
                                    self.field_data[field_id]['sample_values'].append(str(field_value))
                    
                    total_fetched += len(contacts)
                    print(f"  Processed: {len(contacts)} contacts")
                    print(f"  Total so far: {total_fetched}")
                    print(f"  Contacts with custom fields: {contacts_with_custom_fields}")
                    print(f"  Unique field IDs found: {len(self.field_data)}")
                    
                    offset += limit
                    
                elif response.status_code == 429:
                    print("Rate limit hit, waiting...")
                    import time
                    time.sleep(12)  # Wait 12 seconds for rate limit reset
                    continue
                    
                else:
                    print(f"Error fetching contacts: {response.status_code}")
                    print(f"Response: {response.text}")
                    break
                    
            except Exception as e:
                print(f"Error: {e}")
                break
        
        print(f"\nDiscovery complete!")
        print(f"Total contacts analyzed: {total_fetched}")
        print(f"Contacts with custom fields: {contacts_with_custom_fields}")
        print(f"Unique custom field IDs discovered: {len(self.field_data)}")
        
        return dict(self.field_data)
    
    def analyze_field_patterns(self, field_data):
        """Analyze field patterns to identify data types and purposes"""
        print("\n" + "="*60)
        print("FIELD PATTERN ANALYSIS")
        print("="*60)
        
        analyzed_fields = {}
        
        for field_id, data in field_data.items():
            analysis = {
                'field_id': field_id,
                'total_contacts': data['contacts_with_field'],
                'unique_values': len(data['values']),
                'sample_values': data['sample_values'][:5],
                'all_values': sorted(list(data['values']))[:20],  # First 20 unique values
                'data_type': self.determine_data_type(data['values']),
                'likely_purpose': self.guess_field_purpose(data['values'])
            }
            analyzed_fields[field_id] = analysis
        
        return analyzed_fields
    
    def determine_data_type(self, values):
        """Determine the likely data type based on values"""
        if not values:
            return "UNKNOWN"
        
        value_list = list(values)
        
        # Check for timestamps (13-digit numbers)
        timestamp_count = 0
        for v in value_list:
            if str(v).isdigit() and len(str(v)) == 13:
                try:
                    timestamp = int(v) / 1000
                    if 946684800 < timestamp < 2524608000:  # 2000-2050 range
                        timestamp_count += 1
                except:
                    pass
        
        if timestamp_count > len(value_list) * 0.8:
            return "TIMESTAMP"
        
        # Check for numbers
        numeric_count = sum(1 for v in value_list if str(v).replace('.', '').isdigit())
        if numeric_count > len(value_list) * 0.8:
            return "NUMERIC"
        
        # Check for yes/no or boolean-like
        boolean_values = {'yes', 'no', 'true', 'false', '1', '0'}
        if all(str(v).lower() in boolean_values for v in value_list):
            return "BOOLEAN"
        
        # Check for currency
        currency_count = sum(1 for v in value_list if '$' in str(v) or any(word in str(v).lower() for word in ['dollar', 'usd', 'money']))
        if currency_count > len(value_list) * 0.5:
            return "CURRENCY"
        
        return "TEXT"
    
    def guess_field_purpose(self, values):
        """Guess the field purpose based on common patterns"""
        if not values:
            return "UNKNOWN"
        
        # Convert to lowercase strings for analysis
        lower_values = [str(v).lower() for v in values]
        combined_text = ' '.join(lower_values)
        
        # FA-related patterns
        if any(keyword in combined_text for keyword in ['application', 'fa', 'funding']):
            return "FA_RELATED"
        
        # Credit score patterns
        if any(keyword in combined_text for keyword in ['credit', 'score', '680', '720']):
            return "CREDIT_SCORE"
        
        # Capital/money patterns
        if any(keyword in combined_text for keyword in ['capital', 'available', '$1k', 'money', 'funding']):
            return "CAPITAL_AMOUNT"
        
        # Bankruptcy patterns
        if any(keyword in combined_text for keyword in ['bankruptcy', 'personal', 'guarantee']):
            return "BANKRUPTCY_HISTORY"
        
        # Marketing patterns
        if any(keyword in combined_text for keyword in ['utm', 'campaign', 'ad', 'source']):
            return "MARKETING_DATA"
        
        # Contact info patterns
        if any(keyword in combined_text for keyword in ['phone', 'email', 'address']):
            return "CONTACT_INFO"
        
        return "GENERAL"
    
    def identify_fa_fields(self, analyzed_fields):
        """Identify fields that are likely FA-related"""
        print("\n" + "="*60)
        print("FA FIELD IDENTIFICATION")
        print("="*60)
        
        fa_fields = {}
        potential_mql_fields = {}
        
        for field_id, analysis in analyzed_fields.items():
            # Check if field is FA-related
            is_fa_related = False
            field_purpose = analysis['likely_purpose']
            values_text = ' '.join([str(v) for v in analysis['sample_values']]).lower()
            
            # Direct FA indicators
            if 'FA_RELATED' in field_purpose:
                is_fa_related = True
            
            # Check for known FA field patterns
            fa_keywords = ['application', 'funding', 'capital', 'credit', 'bankruptcy', 'personal']
            if any(keyword in values_text for keyword in fa_keywords):
                is_fa_related = True
            
            if is_fa_related:
                fa_fields[field_id] = analysis
                
                # Check if it matches our MQL criteria fields
                if 'capital' in values_text and ('1k' in values_text or 'available' in values_text):
                    potential_mql_fields['capital_available'] = field_id
                    print(f"🎯 POTENTIAL CAPITAL FIELD: {field_id}")
                    print(f"   Sample values: {analysis['sample_values']}")
                
                if 'credit' in values_text and ('680' in values_text or 'score' in values_text):
                    potential_mql_fields['credit_score'] = field_id
                    print(f"🎯 POTENTIAL CREDIT SCORE FIELD: {field_id}")
                    print(f"   Sample values: {analysis['sample_values']}")
                
                if 'bankruptcy' in values_text or 'personal' in values_text:
                    potential_mql_fields['bankruptcy_history'] = field_id
                    print(f"🎯 POTENTIAL BANKRUPTCY FIELD: {field_id}")
                    print(f"   Sample values: {analysis['sample_values']}")
        
        return fa_fields, potential_mql_fields
    
    def generate_comprehensive_report(self, analyzed_fields, fa_fields, potential_mql_fields):
        """Generate comprehensive field discovery report"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        
        report = []
        report.append("# GHL Custom Fields Discovery Report")
        report.append(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        report.append(f"Total Fields Discovered: {len(analyzed_fields)}")
        report.append(f"FA-Related Fields: {len(fa_fields)}")
        report.append("")
        
        # Known field mapping
        report.append("## KNOWN FIELD MAPPINGS")
        report.append("| Field ID | Field Name | Field Key | Purpose |")
        report.append("|----------|------------|-----------|---------|")
        report.append("| hWiYPVIxzb8z69ZSqP1j | FA Application Date | contact.fa__application_date | Base FA field |")
        report.append("")
        
        # Potential MQL fields
        if potential_mql_fields:
            report.append("## POTENTIAL MQL FIELDS DISCOVERED")
            report.append("| Purpose | Field ID | Sample Values |")
            report.append("|---------|----------|---------------|")
            for purpose, field_id in potential_mql_fields.items():
                if field_id in analyzed_fields:
                    samples = ', '.join(analyzed_fields[field_id]['sample_values'][:3])
                    report.append(f"| {purpose} | {field_id} | {samples} |")
            report.append("")
        
        # All FA fields
        report.append("## ALL FA-RELATED FIELDS")
        report.append("| Field ID | Contacts | Unique Values | Data Type | Sample Values |")
        report.append("|----------|----------|---------------|-----------|---------------|")
        
        for field_id, analysis in fa_fields.items():
            samples = ', '.join([str(v) for v in analysis['sample_values'][:3]])
            report.append(f"| {field_id} | {analysis['total_contacts']} | {analysis['unique_values']} | {analysis['data_type']} | {samples} |")
        report.append("")
        
        # Complete field inventory
        report.append("## COMPLETE FIELD INVENTORY")
        report.append("| Field ID | Contacts | Values | Type | Purpose | Top Values |")
        report.append("|----------|----------|--------|------|---------|------------|")
        
        # Sort by number of contacts (most used first)
        sorted_fields = sorted(analyzed_fields.items(), key=lambda x: x[1]['total_contacts'], reverse=True)
        
        for field_id, analysis in sorted_fields:
            top_values = ', '.join([str(v) for v in analysis['all_values'][:3]])
            report.append(f"| {field_id} | {analysis['total_contacts']} | {analysis['unique_values']} | {analysis['data_type']} | {analysis['likely_purpose']} | {top_values} |")
        
        # Save report
        report_content = '\n'.join(report)
        report_file = f"field_discovery_report_{timestamp}.md"
        
        with open(report_file, 'w', encoding='utf-8') as f:
            f.write(report_content)
        
        print(f"\n📄 Comprehensive report saved to: {report_file}")
        
        # Also save raw data as JSON
        json_file = f"field_discovery_data_{timestamp}.json"
        discovery_data = {
            'analyzed_fields': analyzed_fields,
            'fa_fields': fa_fields,
            'potential_mql_fields': potential_mql_fields,
            'discovery_timestamp': timestamp
        }
        
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(discovery_data, f, indent=2, default=str)
        
        print(f"📊 Raw data saved to: {json_file}")
        
        return report_content
    
    def run_complete_discovery(self, max_contacts=1000):
        """Run complete field discovery process"""
        print("🔍 STARTING COMPREHENSIVE FIELD DISCOVERY")
        print("="*60)
        
        # Step 1: Fetch contacts and extract field data
        field_data = self.fetch_contacts_with_fields(max_contacts)
        
        if not field_data:
            print("❌ No custom fields discovered")
            return
        
        # Step 2: Analyze field patterns
        analyzed_fields = self.analyze_field_patterns(field_data)
        
        # Step 3: Identify FA-specific fields
        fa_fields, potential_mql_fields = self.identify_fa_fields(analyzed_fields)
        
        # Step 4: Generate comprehensive report
        report = self.generate_comprehensive_report(analyzed_fields, fa_fields, potential_mql_fields)
        
        # Step 5: Display key findings
        print("\n" + "🎯" * 20)
        print("KEY FINDINGS")
        print("🎯" * 20)
        print(f"✅ Total custom fields discovered: {len(analyzed_fields)}")
        print(f"✅ FA-related fields: {len(fa_fields)}")
        print(f"✅ Potential MQL fields: {len(potential_mql_fields)}")
        
        if potential_mql_fields:
            print("\n🔥 POTENTIAL MQL FIELD MATCHES:")
            for purpose, field_id in potential_mql_fields.items():
                print(f"   {purpose.upper()}: {field_id}")
        
        print(f"\n📋 Discovery complete! Check the generated files for full details.")
        
        return {
            'analyzed_fields': analyzed_fields,
            'fa_fields': fa_fields,
            'potential_mql_fields': potential_mql_fields
        }

def main():
    # API key
    api_key = os.environ.get('GHL_API_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2NhdGlvbl9pZCI6IjZLVEM2S0pNZUNhT25CVkhzdGlzIiwidmVyc2lvbiI6MSwiaWF0IjoxNzUxNDcwNTY1OTA1LCJzdWIiOiJJblFHTUM1MXFLbUkwQzMzVFRZMCJ9.-XT16wR4MwRi7brSOW105H5bezCImedheTbwOPj19HI')
    
    discoverer = APIFieldDiscovery(api_key)
    results = discoverer.run_complete_discovery(max_contacts=500)  # Analyze 500 contacts
    
    if results:
        print("\n✅ Field discovery completed successfully!")
    else:
        print("\n❌ Field discovery failed")

if __name__ == "__main__":
    main()