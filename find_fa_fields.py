#!/usr/bin/env python3
"""
Find custom fields related to FA applications
"""

import requests
import json

API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2NhdGlvbl9pZCI6IjZLVEM2S0pNZUNhT25CVkhzdGlzIiwidmVyc2lvbiI6MSwiaWF0IjoxNzUxNDcwNTY1OTA1LCJzdWIiOiJJblFHTUM1MXFLbUkwQzMzVFRZMCJ9.-XT16wR4MwRi7brSOW105H5bezCImedheTbwOPj19HI"
LOCATION_ID = "6KTC6KJMeCaOnBVHstis"

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

def get_custom_fields():
    """Try to get custom field definitions"""
    print("Attempting to fetch custom field definitions...")
    
    # Try various endpoints for custom fields
    endpoints = [
        f"https://rest.gohighlevel.com/v1/custom-fields",
        f"https://rest.gohighlevel.com/v1/locations/{LOCATION_ID}/custom-fields",
        f"https://rest.gohighlevel.com/v1/custom-values",
        f"https://rest.gohighlevel.com/v1/locations/{LOCATION_ID}/custom-values"
    ]
    
    for endpoint in endpoints:
        try:
            response = requests.get(endpoint, headers=headers)
            print(f"\n{endpoint}: Status {response.status_code}")
            if response.status_code == 200:
                data = response.json()
                print(f"Found data: {json.dumps(data, indent=2)[:500]}...")
        except Exception as e:
            print(f"Error: {str(e)}")

def analyze_contacts_for_fa_fields():
    """Analyze contacts to find FA-related fields"""
    print("\n" + "="*60)
    print("Analyzing contacts for FA-related custom fields...")
    
    params = {
        "limit": 50,
        "offset": 0,
        "includeCustomFields": "true"
    }
    
    try:
        response = requests.get(
            "https://rest.gohighlevel.com/v1/contacts",
            headers=headers,
            params=params
        )
        
        if response.status_code == 200:
            data = response.json()
            contacts = data.get('contacts', [])
            
            # Collect all unique custom fields
            all_custom_fields = {}
            fa_related_fields = {}
            
            for contact in contacts:
                custom_fields = contact.get('customField', [])
                for field in custom_fields:
                    field_id = field.get('id', '')
                    field_value = str(field.get('value', ''))
                    
                    if field_id and field_value:
                        if field_id not in all_custom_fields:
                            all_custom_fields[field_id] = {
                                'values': [],
                                'count': 0
                            }
                        
                        all_custom_fields[field_id]['values'].append(field_value[:100])
                        all_custom_fields[field_id]['count'] += 1
                        
                        # Check if field or value might be FA/application related
                        if any(keyword in field_value.lower() for keyword in ['fa', 'application', 'date', 'funding']):
                            if field_id not in fa_related_fields:
                                fa_related_fields[field_id] = {
                                    'sample_values': [],
                                    'count': 0
                                }
                            fa_related_fields[field_id]['sample_values'].append(field_value)
                            fa_related_fields[field_id]['count'] += 1
            
            print(f"\nFound {len(all_custom_fields)} unique custom fields")
            print("\nAll custom fields with sample values:")
            for field_id, info in list(all_custom_fields.items())[:20]:  # Show first 20
                print(f"\n  Field ID: {field_id}")
                print(f"  Count: {info['count']}")
                print(f"  Sample values: {info['values'][:3]}")
            
            if fa_related_fields:
                print("\n" + "="*60)
                print("FA/Application-related fields found:")
                for field_id, info in fa_related_fields.items():
                    print(f"\n  Field ID: {field_id}")
                    print(f"  Count: {info['count']}")
                    print(f"  Sample values: {info['sample_values'][:5]}")
            
            # Look for contacts that might be applications
            print("\n" + "="*60)
            print("Looking for potential application contacts...")
            
            application_contacts = []
            for contact in contacts:
                # Check various indicators
                tags = contact.get('tags', [])
                custom_fields = contact.get('customField', [])
                
                # Check tags
                has_fa_tag = any('fa' in tag.lower() or 'application' in tag.lower() for tag in tags)
                
                # Check custom field values
                has_fa_field = False
                for field in custom_fields:
                    value = str(field.get('value', '')).lower()
                    if 'fa' in value or 'application' in value or 'funding' in value:
                        has_fa_field = True
                        break
                
                if has_fa_tag or has_fa_field:
                    application_contacts.append(contact)
            
            print(f"\nFound {len(application_contacts)} potential application contacts")
            
            if application_contacts:
                print("\nFirst application contact details:")
                app = application_contacts[0]
                print(f"  Name: {app.get('firstName', '')} {app.get('lastName', '')}")
                print(f"  Email: {app.get('email', '')}")
                print(f"  Tags: {app.get('tags', [])}")
                print(f"  Custom fields:")
                for field in app.get('customField', []):
                    if field.get('value'):
                        print(f"    {field.get('id')}: {field.get('value')}")
            
    except Exception as e:
        print(f"Error: {e}")

def main():
    print("Finding FA Application Fields")
    print("="*60)
    
    get_custom_fields()
    analyze_contacts_for_fa_fields()

if __name__ == "__main__":
    main()