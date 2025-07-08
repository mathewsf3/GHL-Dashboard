#!/usr/bin/env python3
"""
Sync GHL FA Applications to Supabase
Handles the complete sync process from GHL to Supabase database
"""

import os
import requests
import json
from datetime import datetime
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

class GHLSupabaseSync:
    def __init__(self):
        # GHL Configuration
        self.ghl_api_key = os.getenv('GHL_API_KEY')
        self.ghl_base_url = os.getenv('GHL_API_BASE_URL')
        self.ghl_headers = {
            "Authorization": f"Bearer {self.ghl_api_key}",
            "Content-Type": "application/json"
        }
        
        # Supabase Configuration
        self.supabase_url = os.getenv('SUPABASE_URL')
        self.supabase_key = os.getenv('SUPABASE_ANON_KEY')
        self.supabase: Client = create_client(self.supabase_url, self.supabase_key)
        
        # Field IDs
        self.fa_application_date_field_id = os.getenv('FA_APPLICATION_DATE_FIELD_ID')
        
    def create_tables_if_not_exist(self):
        """Create necessary tables in Supabase if they don't exist"""
        # This would typically be done via Supabase dashboard or migrations
        # Including here for reference of the schema
        
        create_table_sql = """
        -- Create fa_applications table if not exists
        CREATE TABLE IF NOT EXISTS fa_applications (
            id TEXT PRIMARY KEY,
            ghl_contact_id TEXT UNIQUE NOT NULL,
            first_name TEXT,
            last_name TEXT,
            email TEXT,
            phone TEXT,
            application_date DATE,
            date_added TIMESTAMP,
            tags TEXT[],
            custom_fields JSONB,
            raw_data JSONB,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        );
        
        -- Create index on application_date for faster queries
        CREATE INDEX IF NOT EXISTS idx_application_date ON fa_applications(application_date);
        
        -- Create index on email for faster lookups
        CREATE INDEX IF NOT EXISTS idx_email ON fa_applications(email);
        """
        
        print("Note: Run the above SQL in Supabase SQL editor to create tables")
        
    def fetch_ghl_fa_applications(self):
        """Fetch all FA applications from GHL"""
        fa_applications = []
        offset = 0
        limit = 100
        
        print("Fetching FA Applications from GHL...")
        
        while True:
            params = {
                "limit": limit,
                "offset": offset,
                "includeCustomFields": "true"
            }
            
            try:
                response = requests.get(
                    f"{self.ghl_base_url}/contacts",
                    headers=self.ghl_headers,
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
                            if field.get('id') == self.fa_application_date_field_id:
                                if field.get('value'):
                                    fa_applications.append(contact)
                                    break
                    
                    print(f"Processed {offset + len(contacts)} contacts...")
                    offset += limit
                else:
                    print(f"Error: {response.status_code}")
                    break
                    
            except Exception as e:
                print(f"Error fetching data: {e}")
                break
        
        print(f"Total FA applications found: {len(fa_applications)}")
        return fa_applications
    
    def transform_contact_for_supabase(self, contact):
        """Transform GHL contact data for Supabase"""
        # Extract custom fields
        custom_fields_dict = {}
        application_date = None
        
        for field in contact.get('customField', []):
            if field.get('value'):
                field_id = field.get('id')
                value = field.get('value')
                
                # Convert application date timestamp
                if field_id == self.fa_application_date_field_id:
                    try:
                        timestamp = int(value) / 1000
                        application_date = datetime.fromtimestamp(timestamp).date().isoformat()
                    except:
                        application_date = None
                
                custom_fields_dict[field_id] = value
        
        # Transform contact for Supabase
        return {
            'ghl_contact_id': contact.get('id'),
            'first_name': contact.get('firstName'),
            'last_name': contact.get('lastName'),
            'email': contact.get('email'),
            'phone': contact.get('phone'),
            'application_date': application_date,
            'date_added': contact.get('dateAdded'),
            'tags': contact.get('tags', []),
            'custom_fields': custom_fields_dict,
            'raw_data': contact,
            'updated_at': datetime.now().isoformat()
        }
    
    def sync_to_supabase(self, applications):
        """Sync applications to Supabase"""
        if not applications:
            print("No applications to sync")
            return
        
        print(f"\nSyncing {len(applications)} applications to Supabase...")
        
        success_count = 0
        error_count = 0
        
        for i, contact in enumerate(applications):
            try:
                # Transform data
                record = self.transform_contact_for_supabase(contact)
                
                # Upsert to Supabase (insert or update if exists)
                response = self.supabase.table('fa_applications').upsert(
                    record,
                    on_conflict='ghl_contact_id'
                ).execute()
                
                success_count += 1
                
                if (i + 1) % 10 == 0:
                    print(f"Synced {i + 1}/{len(applications)} applications...")
                    
            except Exception as e:
                error_count += 1
                print(f"Error syncing contact {contact.get('id')}: {e}")
        
        print(f"\nSync complete!")
        print(f"Successfully synced: {success_count}")
        print(f"Errors: {error_count}")
        
        return success_count, error_count
    
    def get_sync_stats(self):
        """Get statistics from Supabase"""
        try:
            # Total count
            total_response = self.supabase.table('fa_applications').select(
                "id", count='exact'
            ).execute()
            
            total_count = total_response.count if hasattr(total_response, 'count') else len(total_response.data)
            
            # Recent applications (last 7 days)
            seven_days_ago = (datetime.now() - timedelta(days=7)).date().isoformat()
            recent_response = self.supabase.table('fa_applications').select(
                "id", count='exact'
            ).gte('application_date', seven_days_ago).execute()
            
            recent_count = recent_response.count if hasattr(recent_response, 'count') else len(recent_response.data)
            
            print(f"\nSupabase Statistics:")
            print(f"Total FA Applications: {total_count}")
            print(f"Applications in last 7 days: {recent_count}")
            
        except Exception as e:
            print(f"Error getting stats: {e}")

def main():
    print("GHL to Supabase Sync")
    print("="*60)
    
    # Initialize sync
    syncer = GHLSupabaseSync()
    
    # Show table creation SQL
    syncer.create_tables_if_not_exist()
    
    # Fetch from GHL
    applications = syncer.fetch_ghl_fa_applications()
    
    if applications:
        # Sync to Supabase
        success, errors = syncer.sync_to_supabase(applications)
        
        # Get statistics
        syncer.get_sync_stats()
    else:
        print("No applications found to sync")

if __name__ == "__main__":
    from datetime import timedelta
    main()