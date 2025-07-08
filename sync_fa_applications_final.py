#!/usr/bin/env python3
"""
Sync FA Applications from GoHighLevel
Uses the correct custom field ID for FA | Application Date
"""

import requests
import json
import csv
from datetime import datetime
import os

class FAApplicationSync:
    def __init__(self, api_key):
        self.api_key = api_key
        self.base_url = "https://rest.gohighlevel.com/v1"
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        # FA | Application Date field ID
        self.fa_application_date_field_id = "hWiYPVIxzb8z69ZSqP1j"
        
    def fetch_fa_applications(self):
        """Fetch all contacts with FA Application Date"""
        fa_applications = []
        offset = 0
        limit = 100
        total_processed = 0
        
        print("Fetching FA Applications from GHL...")
        print(f"Looking for field ID: {self.fa_application_date_field_id}")
        print("="*60)
        
        while True:
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
                    
                    # Filter contacts with FA Application Date
                    for contact in contacts:
                        custom_fields = contact.get('customField', [])
                        
                        for field in custom_fields:
                            if field.get('id') == self.fa_application_date_field_id:
                                if field.get('value'):  # Has application date
                                    # Convert timestamp to readable date
                                    timestamp = int(field.get('value')) / 1000
                                    app_date = datetime.fromtimestamp(timestamp)
                                    contact['_fa_application_date'] = app_date.strftime('%Y-%m-%d')
                                    contact['_fa_application_timestamp'] = field.get('value')
                                    fa_applications.append(contact)
                                    break
                    
                    total_processed += len(contacts)
                    print(f"Processed {total_processed} contacts, found {len(fa_applications)} FA applications...")
                    
                    offset += limit
                else:
                    print(f"Error fetching contacts: {response.status_code}")
                    break
                    
            except Exception as e:
                print(f"Error: {e}")
                break
        
        return fa_applications
    
    def get_all_custom_field_values(self, contact):
        """Get all custom field values as a dictionary"""
        custom_values = {}
        for field in contact.get('customField', []):
            if field.get('value'):
                # Get field name from our known fields
                field_id = field.get('id')
                custom_values[field_id] = field.get('value')
        return custom_values
    
    def export_to_csv(self, applications, filename='fa_applications.csv'):
        """Export FA applications to CSV with all relevant data"""
        if not applications:
            print("No applications to export")
            return
        
        # Define known custom field mappings
        field_mappings = {
            'hWiYPVIxzb8z69ZSqP1j': 'FA Application Date',
            'w0MiykFb25fTTFQla3bu': 'Booked Call Date',
            'XipmrnXqV46DDxVrDiYS': 'UTM Source',
            'VVOSFbxXpsppfHox2jhI': 'Income Level',
            'Q0KWavjuX7YuGrtJaC6k': 'Ad Set Name',
            'cj09pOhxqE4WOOKqQVhK': 'Campaign Name',
            'j4KihL9HZzwqTCEbai8b': 'Credit Score',
            'UAkQthswkKrPlIWQ5Mtk': 'Credit Card Debt',
            'klgLSEZH45ChqGWCprJ8': 'Business Type',
            'UHOFwbbvd6VH0qwASmxX': 'Funding Timeline',
            'FSIc6ju162mN3K8IUbD8': 'IP Address'
        }
        
        # Standard fields
        fieldnames = [
            'id', 'firstName', 'lastName', 'email', 'phone', 
            'fa_application_date', 'dateAdded', 'tags'
        ]
        
        # Add mapped custom fields
        fieldnames.extend(field_mappings.values())
        
        with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()
            
            for app in applications:
                custom_values = self.get_all_custom_field_values(app)
                
                row = {
                    'id': app.get('id'),
                    'firstName': app.get('firstName', ''),
                    'lastName': app.get('lastName', ''),
                    'email': app.get('email', ''),
                    'phone': app.get('phone', ''),
                    'fa_application_date': app.get('_fa_application_date', ''),
                    'dateAdded': app.get('dateAdded', ''),
                    'tags': ', '.join(app.get('tags', []))
                }
                
                # Add custom field values
                for field_id, field_name in field_mappings.items():
                    if field_id in custom_values:
                        value = custom_values[field_id]
                        # Convert timestamps to dates
                        if field_id in ['hWiYPVIxzb8z69ZSqP1j', 'w0MiykFb25fTTFQla3bu', 'OOoQSSSoCsRSFlaeThRs']:
                            try:
                                timestamp = int(value) / 1000
                                value = datetime.fromtimestamp(timestamp).strftime('%Y-%m-%d')
                            except:
                                pass
                        row[field_name] = value
                
                writer.writerow(row)
        
        print(f"\nExported {len(applications)} FA applications to {filename}")
    
    def display_summary(self, applications):
        """Display summary of FA applications"""
        if not applications:
            print("\nNo FA applications found!")
            return
        
        print(f"\n{'='*60}")
        print(f"FA APPLICATIONS SUMMARY")
        print(f"{'='*60}")
        print(f"Total FA applications: {len(applications)}")
        
        # Group by application date
        date_counts = {}
        for app in applications:
            date = app.get('_fa_application_date', 'Unknown')
            date_counts[date] = date_counts.get(date, 0) + 1
        
        print("\nApplications by date:")
        for date, count in sorted(date_counts.items(), reverse=True)[:10]:
            print(f"  {date}: {count} applications")
        
        # Show sample applications
        print("\nSample applications (first 3):")
        for i, app in enumerate(applications[:3]):
            print(f"\n{i+1}. Contact ID: {app.get('id')}")
            print(f"   Name: {app.get('firstName', '')} {app.get('lastName', '')}")
            print(f"   Email: {app.get('email', 'N/A')}")
            print(f"   Phone: {app.get('phone', 'N/A')}")
            print(f"   Application Date: {app.get('_fa_application_date', 'N/A')}")
            print(f"   Tags: {', '.join(app.get('tags', []))}")

def main():
    # API key
    api_key = os.environ.get('GHL_API_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2NhdGlvbl9pZCI6IjZLVEM2S0pNZUNhT25CVkhzdGlzIiwidmVyc2lvbiI6MSwiaWF0IjoxNzUxNDcwNTY1OTA1LCJzdWIiOiJJblFHTUM1MXFLbUkwQzMzVFRZMCJ9.-XT16wR4MwRi7brSOW105H5bezCImedheTbwOPj19HI')
    
    syncer = FAApplicationSync(api_key)
    
    # Fetch FA applications
    applications = syncer.fetch_fa_applications()
    
    # Display summary
    syncer.display_summary(applications)
    
    # Export to CSV
    if applications:
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"fa_applications_{timestamp}.csv"
        syncer.export_to_csv(applications, filename)
        
        # Also export to JSON for complete data
        json_filename = f"fa_applications_{timestamp}.json"
        with open(json_filename, 'w', encoding='utf-8') as f:
            json.dump(applications, f, indent=2)
        print(f"Also exported complete data to {json_filename}")
        
        print(f"\nSync complete! Found {len(applications)} FA applications.")
    else:
        print("\nNo FA applications found to sync.")

if __name__ == "__main__":
    main()