#!/usr/bin/env python3
"""
Sync FA Applications from GoHighLevel
Fetches contacts that have the fa__application_date custom field populated
"""

import requests
import json
import csv
from datetime import datetime
import os

class FAApplicationsSync:
    def __init__(self, api_key):
        self.api_key = api_key
        self.base_url = "https://rest.gohighlevel.com/v1"
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        self.location_id = "6KTC6KJMeCaOnBVHstis"
        
    def fetch_all_contacts_with_custom_fields(self):
        """Fetch all contacts with custom fields included"""
        all_contacts = []
        offset = 0
        limit = 100
        
        print("Fetching contacts from GHL...")
        
        while True:
            params = {
                "limit": limit,
                "offset": offset,
                "includeCustomFields": "true"  # Important: include custom fields
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
                    
                    all_contacts.extend(contacts)
                    print(f"Fetched {len(all_contacts)} contacts so far...")
                    
                    offset += limit
                else:
                    print(f"Error fetching contacts: {response.status_code}")
                    print(response.text)
                    break
                    
            except Exception as e:
                print(f"Error: {e}")
                break
        
        print(f"Total contacts fetched: {len(all_contacts)}")
        return all_contacts
    
    def filter_fa_applications(self, contacts):
        """Filter contacts that have fa__application_date custom field"""
        fa_applications = []
        
        for contact in contacts:
            custom_fields = contact.get('customField', [])
            
            # Check if contact has fa__application_date field
            has_application_date = False
            application_date = None
            
            for field in custom_fields:
                if field.get('id') == 'fa__application_date' or field.get('key') == 'fa__application_date':
                    if field.get('value'):  # Only include if field has a value
                        has_application_date = True
                        application_date = field.get('value')
                        break
            
            if has_application_date:
                # Add the application date to the contact for easier access
                contact['_fa_application_date'] = application_date
                fa_applications.append(contact)
        
        return fa_applications
    
    def get_custom_field_value(self, contact, field_key):
        """Helper to get custom field value by key"""
        for field in contact.get('customField', []):
            if field.get('id') == field_key or field.get('key') == field_key:
                return field.get('value', '')
        return ''
    
    def display_summary(self, applications):
        """Display summary of FA applications"""
        print(f"\n{'='*60}")
        print(f"FA APPLICATIONS SUMMARY")
        print(f"{'='*60}")
        print(f"Total applications found: {len(applications)}")
        
        if applications:
            print("\nSample application details:")
            sample = applications[0]
            print(f"  Name: {sample.get('firstName', '')} {sample.get('lastName', '')}")
            print(f"  Email: {sample.get('email', 'N/A')}")
            print(f"  Phone: {sample.get('phone', 'N/A')}")
            print(f"  Application Date: {sample.get('_fa_application_date', 'N/A')}")
            
            # Show all custom fields for first contact
            print("\n  All custom fields:")
            for field in sample.get('customField', []):
                if field.get('value'):
                    print(f"    {field.get('id', field.get('key', 'Unknown'))}: {field.get('value')}")
    
    def export_to_csv(self, applications, filename='fa_applications.csv'):
        """Export FA applications to CSV"""
        if not applications:
            print("No applications to export")
            return
        
        # Define fields to export
        standard_fields = [
            'id', 'firstName', 'lastName', 'email', 'phone', 
            'contactName', 'companyName', 'dateAdded', 'type'
        ]
        
        # Get all unique custom field keys
        custom_field_keys = set()
        for app in applications:
            for field in app.get('customField', []):
                if field.get('value'):
                    key = field.get('id', field.get('key', ''))
                    if key:
                        custom_field_keys.add(key)
        
        custom_field_keys = sorted(list(custom_field_keys))
        all_fields = standard_fields + custom_field_keys
        
        with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=all_fields)
            writer.writeheader()
            
            for app in applications:
                row = {}
                
                # Add standard fields
                for field in standard_fields:
                    row[field] = app.get(field, '')
                
                # Add custom fields
                for cf in app.get('customField', []):
                    key = cf.get('id', cf.get('key', ''))
                    if key and key in custom_field_keys:
                        row[key] = cf.get('value', '')
                
                writer.writerow(row)
        
        print(f"\nExported {len(applications)} applications to {filename}")
    
    def export_to_json(self, applications, filename='fa_applications.json'):
        """Export FA applications to JSON"""
        # Create a cleaner structure for JSON export
        clean_applications = []
        
        for app in applications:
            clean_app = {
                'id': app.get('id'),
                'name': f"{app.get('firstName', '')} {app.get('lastName', '')}".strip(),
                'email': app.get('email'),
                'phone': app.get('phone'),
                'dateAdded': app.get('dateAdded'),
                'customFields': {}
            }
            
            # Add all custom fields to a dictionary
            for field in app.get('customField', []):
                if field.get('value'):
                    key = field.get('id', field.get('key', ''))
                    clean_app['customFields'][key] = field.get('value')
            
            clean_applications.append(clean_app)
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(clean_applications, f, indent=2)
        
        print(f"Exported {len(applications)} applications to {filename}")

def main():
    # API key
    api_key = os.environ.get('GHL_API_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2NhdGlvbl9pZCI6IjZLVEM2S0pNZUNhT25CVkhzdGlzIiwidmVyc2lvbiI6MSwiaWF0IjoxNzUxNDcwNTY1OTA1LCJzdWIiOiJJblFHTUM1MXFLbUkwQzMzVFRZMCJ9.-XT16wR4MwRi7brSOW105H5bezCImedheTbwOPj19HI')
    
    syncer = FAApplicationsSync(api_key)
    
    # Fetch all contacts
    print("Starting FA Applications sync...")
    all_contacts = syncer.fetch_all_contacts_with_custom_fields()
    
    # Filter for FA applications
    print("\nFiltering for FA applications (contacts with fa__application_date)...")
    fa_applications = syncer.filter_fa_applications(all_contacts)
    
    # Display summary
    syncer.display_summary(fa_applications)
    
    # Export data
    if fa_applications:
        print("\nExporting data...")
        syncer.export_to_csv(fa_applications)
        syncer.export_to_json(fa_applications)
        print("\nSync complete!")
    else:
        print("\nNo FA applications found. This could mean:")
        print("  1. No contacts have the fa__application_date field populated")
        print("  2. The custom field key might be different")
        print("\nChecking first few contacts for available custom fields...")
        
        # Debug: show custom fields from first few contacts
        for i, contact in enumerate(all_contacts[:3]):
            if contact.get('customField'):
                print(f"\nContact {i+1} custom fields:")
                for field in contact['customField']:
                    print(f"  - {field.get('id', 'no-id')} / {field.get('key', 'no-key')}: {field.get('value', 'no-value')}")

if __name__ == "__main__":
    main()