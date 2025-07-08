#!/usr/bin/env python3
"""
Optimized sync for FA Applications from GoHighLevel
"""

import requests
import json
import csv
from datetime import datetime
import sys

API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2NhdGlvbl9pZCI6IjZLVEM2S0pNZUNhT25CVkhzdGlzIiwidmVyc2lvbiI6MSwiaWF0IjoxNzUxNDcwNTY1OTA1LCJzdWIiOiJJblFHTUM1MXFLbUkwQzMzVFRZMCJ9.-XT16wR4MwRi7brSOW105H5bezCImedheTbwOPj19HI"

def fetch_fa_applications(limit=500):
    """Fetch only contacts with fa__application_date field"""
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    
    # First, let's try to get a sample to understand the data structure
    print("Fetching sample contacts to analyze custom fields...")
    
    params = {
        "limit": 10,
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
            
            print(f"\nAnalyzing {len(contacts)} sample contacts...")
            
            # Check custom fields in sample
            for i, contact in enumerate(contacts[:5]):
                print(f"\nContact {i+1}: {contact.get('email', 'No email')}")
                custom_fields = contact.get('customField', [])
                if custom_fields:
                    print("  Custom fields found:")
                    for field in custom_fields:
                        field_id = field.get('id', field.get('key', 'unknown'))
                        field_value = field.get('value', '')
                        if field_value:
                            print(f"    - {field_id}: {field_value[:50]}...")
                else:
                    print("  No custom fields")
            
            # Now fetch all contacts with limit
            print(f"\n{'='*60}")
            print(f"Fetching contacts (limit: {limit})...")
            
            fa_applications = []
            offset = 0
            
            while offset < limit:
                batch_size = min(100, limit - offset)
                params = {
                    "limit": batch_size,
                    "offset": offset,
                    "includeCustomFields": "true"
                }
                
                response = requests.get(
                    "https://rest.gohighlevel.com/v1/contacts",
                    headers=headers,
                    params=params
                )
                
                if response.status_code == 200:
                    data = response.json()
                    contacts = data.get('contacts', [])
                    
                    if not contacts:
                        break
                    
                    # Filter for FA applications
                    for contact in contacts:
                        custom_fields = contact.get('customField', [])
                        
                        for field in custom_fields:
                            # Check various possible field identifiers
                            field_id = field.get('id', '')
                            field_key = field.get('key', '')
                            
                            if ('fa__application_date' in field_id.lower() or 
                                'fa__application_date' in field_key.lower() or
                                'application_date' in field_id.lower() or
                                'application_date' in field_key.lower()):
                                
                                if field.get('value'):
                                    contact['_application_date_field'] = field
                                    fa_applications.append(contact)
                                    break
                    
                    print(f"  Processed {offset + len(contacts)} contacts, found {len(fa_applications)} applications so far...")
                    offset += batch_size
                else:
                    print(f"Error: {response.status_code}")
                    break
            
            return fa_applications
            
        else:
            print(f"Error: {response.status_code}")
            print(response.text)
            return []
            
    except Exception as e:
        print(f"Error: {e}")
        return []

def export_results(applications):
    """Export FA applications"""
    if not applications:
        print("\nNo FA applications found!")
        return
    
    print(f"\n{'='*60}")
    print(f"RESULTS: Found {len(applications)} FA applications")
    print(f"{'='*60}")
    
    # Show first few applications
    print("\nFirst 3 applications:")
    for i, app in enumerate(applications[:3]):
        print(f"\n{i+1}. {app.get('firstName', '')} {app.get('lastName', '')}")
        print(f"   Email: {app.get('email', 'N/A')}")
        print(f"   Phone: {app.get('phone', 'N/A')}")
        if '_application_date_field' in app:
            field = app['_application_date_field']
            print(f"   Application Date Field: {field.get('id')} = {field.get('value')}")
    
    # Export to CSV
    filename = f"fa_applications_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    
    with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
        fieldnames = ['id', 'firstName', 'lastName', 'email', 'phone', 'dateAdded', 'application_date']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        
        for app in applications:
            row = {
                'id': app.get('id'),
                'firstName': app.get('firstName', ''),
                'lastName': app.get('lastName', ''),
                'email': app.get('email', ''),
                'phone': app.get('phone', ''),
                'dateAdded': app.get('dateAdded', ''),
                'application_date': app.get('_application_date_field', {}).get('value', '')
            }
            writer.writerow(row)
    
    print(f"\nExported to: {filename}")

def main():
    print("FA Applications Sync - Optimized Version")
    print("="*60)
    
    # Get limit from command line or use default
    limit = int(sys.argv[1]) if len(sys.argv) > 1 else 500
    
    applications = fetch_fa_applications(limit)
    export_results(applications)

if __name__ == "__main__":
    main()