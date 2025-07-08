#!/usr/bin/env python3
"""
Discover ALL custom fields with 'FA' in them from GHL API
Map them comprehensively for Supabase table creation
"""

import requests
import json
import os
from datetime import datetime

class FAFieldDiscovery:
    def __init__(self, api_key, location_id="6KTC6KJMeCaOnBVHstis"):
        self.api_key = api_key
        self.location_id = location_id
        self.base_url = "https://rest.gohighlevel.com/v1"
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
    def get_all_custom_fields(self):
        """Get all custom field definitions from GHL"""
        print("Fetching all custom field definitions...")
        
        try:
            response = requests.get(
                f"{self.base_url}/locations/{self.location_id}/custom-fields",
                headers=self.headers
            )
            
            if response.status_code == 200:
                data = response.json()
                custom_fields = data.get('customFields', [])
                print(f"Found {len(custom_fields)} total custom fields")
                return custom_fields
            else:
                print(f"Error fetching custom fields: {response.status_code}")
                print(f"Response: {response.text}")
                return []
                
        except Exception as e:
            print(f"Error: {e}")
            return []
    
    def filter_fa_fields(self, custom_fields):
        """Filter fields that contain 'FA' in name or key"""
        fa_fields = []
        
        for field in custom_fields:
            field_name = field.get('name', '').upper()
            field_key = field.get('fieldKey', '').upper()
            
            if 'FA' in field_name or 'FA' in field_key:
                fa_fields.append(field)
                
        print(f"Found {len(fa_fields)} FA-related fields")
        return fa_fields
    
    def analyze_field_values(self, fa_fields):
        """Analyze actual field values from contacts to understand data types"""
        print("Analyzing field values from contact data...")
        
        field_analysis = {}
        for field in fa_fields:
            field_id = field.get('id')
            field_analysis[field_id] = {
                'field_info': field,
                'sample_values': [],
                'data_patterns': set(),
                'null_count': 0,
                'total_count': 0
            }
        
        # Fetch contacts with custom fields to analyze values
        offset = 0
        limit = 100
        contacts_analyzed = 0
        
        while contacts_analyzed < 500:  # Analyze up to 500 contacts
            params = {
                "limit": limit,
                "offset": offset,
                "includeCustomFields": "true"
            }
            
            try:
                response = requests.get(
                    f"{self.base_url}/contacts",
                    headers=self.headers,
                    params=params
                )
                
                if response.status_code == 200:
                    data = response.json()
                    contacts = data.get('contacts', [])
                    
                    if not contacts:
                        break
                    
                    for contact in contacts:
                        custom_fields_data = contact.get('customField', [])
                        
                        # Check each FA field
                        for field_id, analysis in field_analysis.items():
                            analysis['total_count'] += 1
                            
                            # Find this field in contact's custom fields
                            field_found = False
                            for custom_field in custom_fields_data:
                                if custom_field.get('id') == field_id:
                                    field_found = True
                                    value = custom_field.get('value')
                                    
                                    if value:
                                        if len(analysis['sample_values']) < 20:
                                            analysis['sample_values'].append(value)
                                        
                                        # Analyze data patterns
                                        if str(value).isdigit():
                                            analysis['data_patterns'].add('numeric')
                                        elif self.is_timestamp(value):
                                            analysis['data_patterns'].add('timestamp')
                                        elif self.is_date_string(value):
                                            analysis['data_patterns'].add('date_string')
                                        else:
                                            analysis['data_patterns'].add('text')
                                    else:
                                        analysis['null_count'] += 1
                                    break
                            
                            if not field_found:
                                analysis['null_count'] += 1
                    
                    contacts_analyzed += len(contacts)
                    offset += limit
                    print(f"Analyzed {contacts_analyzed} contacts...")
                    
                else:
                    print(f"Error fetching contacts: {response.status_code}")
                    break
                    
            except Exception as e:
                print(f"Error analyzing contacts: {e}")
                break
        
        return field_analysis
    
    def is_timestamp(self, value):
        """Check if value looks like a timestamp"""
        try:
            # Check if it's a 13-digit timestamp (milliseconds)
            if str(value).isdigit() and len(str(value)) == 13:
                timestamp = int(value) / 1000
                # Check if it's a reasonable timestamp (after 2000, before 2050)
                if 946684800 < timestamp < 2524608000:
                    return True
            return False
        except:
            return False
    
    def is_date_string(self, value):
        """Check if value looks like a date string"""
        try:
            # Common date formats
            date_formats = ['%Y-%m-%d', '%m/%d/%Y', '%d/%m/%Y', '%Y-%m-%d %H:%M:%S']
            for fmt in date_formats:
                try:
                    datetime.strptime(str(value), fmt)
                    return True
                except:
                    continue
            return False
        except:
            return False
    
    def generate_supabase_schema(self, field_analysis):
        """Generate Supabase table schema based on field analysis"""
        print("Generating Supabase schema...")
        
        schema_lines = []
        schema_lines.append("-- Complete FA Custom Fields Schema")
        schema_lines.append("-- Generated from GHL API analysis")
        schema_lines.append(f"-- Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        schema_lines.append("")
        
        # FA Applications base table
        schema_lines.append("CREATE TABLE fa_applications (")
        schema_lines.append("    id TEXT PRIMARY KEY,")
        schema_lines.append("    contact_id TEXT NOT NULL,")
        schema_lines.append("    first_name TEXT,")
        schema_lines.append("    last_name TEXT,")
        schema_lines.append("    email TEXT,")
        schema_lines.append("    phone TEXT,")
        schema_lines.append("    date_added TIMESTAMP,")
        
        # Add all FA custom fields
        for field_id, analysis in field_analysis.items():
            field_info = analysis['field_info']
            field_name = field_info.get('name', '')
            field_key = field_info.get('fieldKey', '')
            
            # Convert field name to SQL column name
            column_name = self.field_name_to_column(field_name, field_key)
            
            # Determine SQL data type based on analysis
            sql_type = self.determine_sql_type(analysis)
            
            schema_lines.append(f"    {column_name} {sql_type}, -- {field_name}")
        
        schema_lines.append("    created_at TIMESTAMP DEFAULT NOW(),")
        schema_lines.append("    updated_at TIMESTAMP DEFAULT NOW()")
        schema_lines.append(");")
        schema_lines.append("")
        
        # FA MQLs filtered table
        schema_lines.append("CREATE TABLE fa_mqls (")
        schema_lines.append("    id TEXT PRIMARY KEY,")
        schema_lines.append("    contact_id TEXT REFERENCES fa_applications(contact_id),")
        schema_lines.append("    mql_qualification_date TIMESTAMP DEFAULT NOW(),")
        schema_lines.append("    disqualification_reason TEXT,")
        schema_lines.append("    -- Inherits all fields from fa_applications")
        schema_lines.append(");")
        schema_lines.append("")
        
        # Field mapping table
        schema_lines.append("CREATE TABLE fa_field_mappings (")
        schema_lines.append("    field_id TEXT PRIMARY KEY,")
        schema_lines.append("    field_name TEXT,")
        schema_lines.append("    field_key TEXT,")
        schema_lines.append("    column_name TEXT,")
        schema_lines.append("    data_type TEXT,")
        schema_lines.append("    sample_values JSONB,")
        schema_lines.append("    created_at TIMESTAMP DEFAULT NOW()")
        schema_lines.append(");")
        schema_lines.append("")
        
        # Insert field mappings
        for field_id, analysis in field_analysis.items():
            field_info = analysis['field_info']
            field_name = field_info.get('name', '').replace("'", "''")
            field_key = field_info.get('fieldKey', '')
            column_name = self.field_name_to_column(field_name, field_key)
            data_type = self.determine_sql_type(analysis)
            sample_values = json.dumps(analysis['sample_values'][:5])
            
            schema_lines.append(f"INSERT INTO fa_field_mappings VALUES (")
            schema_lines.append(f"    '{field_id}',")
            schema_lines.append(f"    '{field_name}',")
            schema_lines.append(f"    '{field_key}',")
            schema_lines.append(f"    '{column_name}',")
            schema_lines.append(f"    '{data_type}',")
            schema_lines.append(f"    '{sample_values}',")
            schema_lines.append(f"    NOW()")
            schema_lines.append(f");")
        
        return '\n'.join(schema_lines)
    
    def field_name_to_column(self, field_name, field_key):
        """Convert field name to SQL column name"""
        if field_key:
            # Use field key if available, clean it up
            column = field_key.lower().replace('contact.', '').replace('fa__', 'fa_')
        else:
            # Convert field name to column name
            column = field_name.lower()
            column = column.replace('fa | ', 'fa_')
            column = column.replace(' | ', '_')
            column = column.replace(' ', '_')
            column = ''.join(c for c in column if c.isalnum() or c == '_')
        
        return column
    
    def determine_sql_type(self, analysis):
        """Determine SQL data type based on field analysis"""
        patterns = analysis['data_patterns']
        sample_values = analysis['sample_values']
        
        if 'timestamp' in patterns:
            return 'TIMESTAMP'
        elif 'date_string' in patterns:
            return 'DATE'
        elif 'numeric' in patterns and all(str(v).isdigit() for v in sample_values if v):
            return 'INTEGER'
        else:
            # Check max length for VARCHAR sizing
            max_length = max([len(str(v)) for v in sample_values if v] + [0])
            if max_length > 255:
                return 'TEXT'
            elif max_length > 0:
                return f'VARCHAR({min(max_length * 2, 500)})'
            else:
                return 'TEXT'
    
    def generate_field_mapping_json(self, field_analysis):
        """Generate JSON mapping for sync scripts"""
        mapping = {}
        
        for field_id, analysis in field_analysis.items():
            field_info = analysis['field_info']
            field_name = field_info.get('name', '')
            field_key = field_info.get('fieldKey', '')
            column_name = self.field_name_to_column(field_name, field_key)
            
            mapping[field_id] = {
                'name': field_name,
                'key': field_key,
                'column': column_name,
                'type': self.determine_sql_type(analysis),
                'sample_values': analysis['sample_values'][:5],
                'data_patterns': list(analysis['data_patterns'])
            }
        
        return mapping
    
    def run_complete_discovery(self):
        """Run complete FA field discovery and analysis"""
        print("="*60)
        print("FA FIELD DISCOVERY AND MAPPING")
        print("="*60)
        
        # Step 1: Get all custom fields
        all_fields = self.get_all_custom_fields()
        if not all_fields:
            print("Failed to fetch custom fields")
            return
        
        # Step 2: Filter FA fields
        fa_fields = self.filter_fa_fields(all_fields)
        if not fa_fields:
            print("No FA fields found")
            return
        
        print("\nFound FA Fields:")
        for field in fa_fields:
            print(f"  - {field.get('name')} (ID: {field.get('id')})")
        
        # Step 3: Analyze field values
        field_analysis = self.analyze_field_values(fa_fields)
        
        # Step 4: Generate outputs
        schema_sql = self.generate_supabase_schema(field_analysis)
        field_mapping = self.generate_field_mapping_json(field_analysis)
        
        # Step 5: Save outputs
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        
        # Save schema
        schema_file = f"fa_complete_schema_{timestamp}.sql"
        with open(schema_file, 'w', encoding='utf-8') as f:
            f.write(schema_sql)
        print(f"\nSaved Supabase schema to: {schema_file}")
        
        # Save field mapping
        mapping_file = f"fa_field_mapping_{timestamp}.json"
        with open(mapping_file, 'w', encoding='utf-8') as f:
            json.dump(field_mapping, f, indent=2)
        print(f"Saved field mapping to: {mapping_file}")
        
        # Display summary
        print("\n" + "="*60)
        print("DISCOVERY SUMMARY")
        print("="*60)
        print(f"Total FA fields discovered: {len(fa_fields)}")
        
        for field_id, analysis in field_analysis.items():
            field_info = analysis['field_info']
            print(f"\n{field_info.get('name')}:")
            print(f"  ID: {field_id}")
            print(f"  Key: {field_info.get('fieldKey', 'N/A')}")
            print(f"  Column: {self.field_name_to_column(field_info.get('name', ''), field_info.get('fieldKey', ''))}")
            print(f"  Type: {self.determine_sql_type(analysis)}")
            print(f"  Sample values: {analysis['sample_values'][:3]}")
            print(f"  Data patterns: {list(analysis['data_patterns'])}")
        
        return field_analysis

def main():
    # API key
    api_key = os.environ.get('GHL_API_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2NhdGlvbl9pZCI6IjZLVEM2S0pNZUNhT25CVkhzdGlzIiwidmVyc2lvbiI6MSwiaWF0IjoxNzUxNDcwNTY1OTA1LCJzdWIiOiJJblFHTUM1MXFLbUkwQzMzVFRZMCJ9.-XT16wR4MwRi7brSOW105H5bezCImedheTbwOPj19HI')
    
    discoverer = FAFieldDiscovery(api_key)
    field_analysis = discoverer.run_complete_discovery()
    
    if field_analysis:
        print(f"\n✅ Complete FA field discovery finished!")
        print("Files generated:")
        print("  - fa_complete_schema_[timestamp].sql")
        print("  - fa_field_mapping_[timestamp].json")
    else:
        print("\n❌ Discovery failed")

if __name__ == "__main__":
    main()