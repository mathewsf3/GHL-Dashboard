#!/usr/bin/env python3
"""
GoHighLevel Data Sync Tool
Syncs contact data from GHL with filtering capabilities similar to SmartLists
"""

import requests
import json
import csv
import sqlite3
from datetime import datetime, timedelta
import argparse
import os

class GHLDataSync:
    def __init__(self, api_key):
        self.api_key = api_key
        self.base_url = "https://rest.gohighlevel.com/v1"
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
    def fetch_all_contacts(self, filters=None):
        """Fetch all contacts with optional filters"""
        all_contacts = []
        offset = 0
        limit = 100
        
        print("Fetching contacts from GHL...")
        
        while True:
            params = {
                "limit": limit,
                "offset": offset
            }
            
            # Add any filters
            if filters:
                params.update(filters)
            
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
    
    def filter_contacts(self, contacts, criteria):
        """Filter contacts based on SmartList-like criteria"""
        filtered = []
        
        for contact in contacts:
            meets_criteria = True
            
            # Tag filter
            if 'tags' in criteria:
                contact_tags = [tag.lower() for tag in contact.get('tags', [])]
                required_tags = [tag.lower() for tag in criteria['tags']]
                if not any(tag in contact_tags for tag in required_tags):
                    meets_criteria = False
            
            # Type filter (lead, customer, etc.)
            if 'type' in criteria and contact.get('type') != criteria['type']:
                meets_criteria = False
            
            # Date range filter
            if 'date_added_after' in criteria:
                date_added = datetime.fromisoformat(contact.get('dateAdded', '').replace('Z', '+00:00'))
                if date_added < criteria['date_added_after']:
                    meets_criteria = False
            
            # Custom field filter
            if 'custom_fields' in criteria:
                custom_fields = {cf.get('id'): cf.get('value') for cf in contact.get('customField', [])}
                for field_id, expected_value in criteria['custom_fields'].items():
                    if custom_fields.get(field_id) != expected_value:
                        meets_criteria = False
                        break
            
            # Has email filter
            if 'has_email' in criteria and criteria['has_email']:
                if not contact.get('email'):
                    meets_criteria = False
            
            # Has phone filter
            if 'has_phone' in criteria and criteria['has_phone']:
                if not contact.get('phone'):
                    meets_criteria = False
            
            if meets_criteria:
                filtered.append(contact)
        
        return filtered
    
    def export_to_csv(self, contacts, filename):
        """Export contacts to CSV file"""
        if not contacts:
            print("No contacts to export")
            return
        
        # Get all unique fields from contacts
        all_fields = set()
        for contact in contacts:
            all_fields.update(contact.keys())
        
        # Remove complex fields that can't be easily CSV-ified
        fields_to_exclude = {'customField', 'tags', 'social'}
        fields = sorted(all_fields - fields_to_exclude)
        
        with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=fields + ['tags_list', 'custom_fields_json'])
            writer.writeheader()
            
            for contact in contacts:
                row = {field: contact.get(field, '') for field in fields}
                
                # Add tags as comma-separated list
                row['tags_list'] = ', '.join(contact.get('tags', []))
                
                # Add custom fields as JSON
                row['custom_fields_json'] = json.dumps(contact.get('customField', []))
                
                writer.writerow(row)
        
        print(f"Exported {len(contacts)} contacts to {filename}")
    
    def export_to_json(self, contacts, filename):
        """Export contacts to JSON file"""
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(contacts, f, indent=2)
        
        print(f"Exported {len(contacts)} contacts to {filename}")
    
    def sync_to_database(self, contacts, db_name='ghl_contacts.db'):
        """Sync contacts to local SQLite database"""
        conn = sqlite3.connect(db_name)
        cursor = conn.cursor()
        
        # Create contacts table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS contacts (
                id TEXT PRIMARY KEY,
                locationId TEXT,
                contactName TEXT,
                firstName TEXT,
                lastName TEXT,
                email TEXT,
                phone TEXT,
                type TEXT,
                dateAdded TEXT,
                dateUpdated TEXT,
                tags TEXT,
                customFields TEXT,
                fullData TEXT
            )
        ''')
        
        # Upsert contacts
        for contact in contacts:
            cursor.execute('''
                INSERT OR REPLACE INTO contacts (
                    id, locationId, contactName, firstName, lastName,
                    email, phone, type, dateAdded, dateUpdated,
                    tags, customFields, fullData
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                contact.get('id'),
                contact.get('locationId'),
                contact.get('contactName'),
                contact.get('firstName'),
                contact.get('lastName'),
                contact.get('email'),
                contact.get('phone'),
                contact.get('type'),
                contact.get('dateAdded'),
                contact.get('dateUpdated'),
                json.dumps(contact.get('tags', [])),
                json.dumps(contact.get('customField', [])),
                json.dumps(contact)
            ))
        
        conn.commit()
        conn.close()
        
        print(f"Synced {len(contacts)} contacts to database {db_name}")

def main():
    parser = argparse.ArgumentParser(description='Sync GoHighLevel contact data')
    parser.add_argument('--filter-tags', nargs='+', help='Filter by tags')
    parser.add_argument('--filter-type', help='Filter by contact type (lead, customer, etc.)')
    parser.add_argument('--filter-days', type=int, help='Filter contacts added in last N days')
    parser.add_argument('--export-csv', help='Export to CSV file')
    parser.add_argument('--export-json', help='Export to JSON file')
    parser.add_argument('--sync-db', action='store_true', help='Sync to SQLite database')
    parser.add_argument('--has-email', action='store_true', help='Only contacts with email')
    parser.add_argument('--has-phone', action='store_true', help='Only contacts with phone')
    
    args = parser.parse_args()
    
    # API key from environment or hardcoded
    api_key = os.environ.get('GHL_API_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2NhdGlvbl9pZCI6IjZLVEM2S0pNZUNhT25CVkhzdGlzIiwidmVyc2lvbiI6MSwiaWF0IjoxNzUxNDcwNTY1OTA1LCJzdWIiOiJJblFHTUM1MXFLbUkwQzMzVFRZMCJ9.-XT16wR4MwRi7brSOW105H5bezCImedheTbwOPj19HI')
    
    syncer = GHLDataSync(api_key)
    
    # Fetch all contacts
    contacts = syncer.fetch_all_contacts()
    
    # Apply filters
    if any([args.filter_tags, args.filter_type, args.filter_days, args.has_email, args.has_phone]):
        criteria = {}
        
        if args.filter_tags:
            criteria['tags'] = args.filter_tags
        
        if args.filter_type:
            criteria['type'] = args.filter_type
        
        if args.filter_days:
            criteria['date_added_after'] = datetime.now() - timedelta(days=args.filter_days)
        
        if args.has_email:
            criteria['has_email'] = True
        
        if args.has_phone:
            criteria['has_phone'] = True
        
        contacts = syncer.filter_contacts(contacts, criteria)
        print(f"Filtered to {len(contacts)} contacts")
    
    # Export/sync data
    if args.export_csv:
        syncer.export_to_csv(contacts, args.export_csv)
    
    if args.export_json:
        syncer.export_to_json(contacts, args.export_json)
    
    if args.sync_db:
        syncer.sync_to_database(contacts)
    
    # If no export option specified, show summary
    if not any([args.export_csv, args.export_json, args.sync_db]):
        print("\nContact Summary:")
        print(f"Total contacts: {len(contacts)}")
        if contacts:
            print("\nSample contact:")
            print(json.dumps(contacts[0], indent=2))

if __name__ == "__main__":
    main()