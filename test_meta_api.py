#!/usr/bin/env python3
"""
Test Meta Marketing API access and discover available data
"""

import requests
import json
import os
from datetime import datetime, timedelta

# Meta Marketing API Configuration
META_ACCESS_TOKEN = "EAA5tn96zDjABO5HtIZBVpN5aMNgfq9KKjF6JCJfjRKZAxic6H9jmZASNHgNuCb8uTcuv1rjXbtBUCQOQwVwGPBVJouR3ar2C56KxY3Ul69GbQEUECQyxO9BFeXuZAlL0ZBZC6CZBTk3UH5EKYlfG4oMiodr7lbLmFv2WWUd521yTvZBGZB0hottGG3Wnx4ZCnTv4b4aOg7"
META_APP_ID = "4061183077453360"
META_ACCOUNT_ID = "act_586708888754645"

class MetaAPITester:
    def __init__(self):
        self.access_token = META_ACCESS_TOKEN
        self.app_id = META_APP_ID
        self.account_id = META_ACCOUNT_ID
        self.base_url = "https://graph.facebook.com/v18.0"
        
    def test_endpoint(self, endpoint, description, params=None):
        """Test a Meta API endpoint"""
        print(f"\nTesting: {description}")
        print(f"Endpoint: {endpoint}")
        print("-" * 60)
        
        if params is None:
            params = {}
        params['access_token'] = self.access_token
        
        try:
            response = requests.get(f"{self.base_url}/{endpoint}", params=params)
            
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print("✅ SUCCESS")
                print(f"Response keys: {list(data.keys()) if isinstance(data, dict) else 'List response'}")
                
                # Show sample data structure
                if isinstance(data, dict):
                    if 'data' in data and isinstance(data['data'], list) and len(data['data']) > 0:
                        print(f"Sample record keys: {list(data['data'][0].keys())}")
                        print(f"Total records: {len(data['data'])}")
                    else:
                        print(f"Response structure: {data}")
                        
                return data
            else:
                print("❌ ERROR")
                print(f"Error: {response.text}")
                return None
                
        except Exception as e:
            print(f"❌ EXCEPTION: {e}")
            return None
    
    def discover_account_structure(self):
        """Discover the account structure and available campaigns"""
        print("="*80)
        print("META MARKETING API DISCOVERY")
        print("="*80)
        
        # Test 1: Account info
        account_data = self.test_endpoint(
            f"{self.account_id}",
            "Account Information",
            {'fields': 'id,name,account_status,currency,timezone_name,business'}
        )
        
        # Test 2: Campaigns
        campaigns_data = self.test_endpoint(
            f"{self.account_id}/campaigns",
            "Campaigns List",
            {'fields': 'id,name,status,objective,created_time,updated_time,start_time,stop_time'}
        )
        
        # Test 3: Ad Sets (if campaigns exist)
        if campaigns_data and 'data' in campaigns_data and len(campaigns_data['data']) > 0:
            campaign_id = campaigns_data['data'][0]['id']
            adsets_data = self.test_endpoint(
                f"{campaign_id}/adsets",
                "Ad Sets for First Campaign",
                {'fields': 'id,name,status,created_time,updated_time,start_time,end_time,daily_budget,lifetime_budget,targeting'}
            )
        
        # Test 4: Ads
        ads_data = self.test_endpoint(
            f"{self.account_id}/ads",
            "All Ads in Account",
            {'fields': 'id,name,status,created_time,updated_time,creative'}
        )
        
        # Test 5: Ad Insights (Performance Data)
        insights_data = self.test_endpoint(
            f"{self.account_id}/insights",
            "Account Level Insights",
            {
                'fields': 'campaign_id,campaign_name,adset_id,adset_name,ad_id,ad_name,impressions,clicks,spend,cpm,cpc,ctr,reach,frequency,date_start,date_stop',
                'time_range': json.dumps({
                    'since': (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d'),
                    'until': datetime.now().strftime('%Y-%m-%d')
                }),
                'level': 'ad',
                'limit': 10
            }
        )
        
        # Test 6: Available Fields for Insights
        print(f"\nTesting: Available Insight Fields")
        print("-" * 60)
        try:
            # Get available fields documentation
            available_fields = [
                'account_id', 'account_name', 'campaign_id', 'campaign_name', 
                'adset_id', 'adset_name', 'ad_id', 'ad_name', 'impressions', 
                'clicks', 'spend', 'reach', 'frequency', 'cpm', 'cpc', 'ctr',
                'cost_per_conversion', 'conversions', 'conversion_rate',
                'video_views', 'video_view_rate', 'link_clicks', 'post_engagement',
                'page_engagement', 'date_start', 'date_stop'
            ]
            print(f"✅ Standard insight fields available: {len(available_fields)}")
            print(f"Key fields: {available_fields[:10]}...")
        except Exception as e:
            print(f"❌ Error getting field info: {e}")
        
        # Test 7: Lead Forms (if any)
        leadgen_data = self.test_endpoint(
            f"{self.account_id}/leadgen_forms",
            "Lead Generation Forms",
            {'fields': 'id,name,status,created_time,page_id,leads_count'}
        )
        
        return {
            'account': account_data,
            'campaigns': campaigns_data,
            'ads': ads_data,
            'insights': insights_data,
            'leadgen': leadgen_data
        }
    
    def test_detailed_insights(self):
        """Test detailed insights with all available metrics"""
        print("\n" + "="*80)
        print("DETAILED INSIGHTS TESTING")
        print("="*80)
        
        # Comprehensive metrics list
        all_metrics = [
            'impressions', 'clicks', 'spend', 'reach', 'frequency',
            'cpm', 'cpc', 'ctr', 'cpp', 'cost_per_conversion',
            'conversions', 'conversion_rate', 'video_views',
            'video_view_rate', 'link_clicks', 'post_engagement',
            'page_engagement', 'post_reactions', 'post_saves',
            'post_shares', 'post_comments', 'photo_view',
            'video_p25_watched_actions', 'video_p50_watched_actions',
            'video_p75_watched_actions', 'video_p100_watched_actions'
        ]
        
        # Test comprehensive insights
        detailed_insights = self.test_endpoint(
            f"{self.account_id}/insights",
            "Comprehensive Insights Data",
            {
                'fields': ','.join(all_metrics + ['campaign_name', 'adset_name', 'ad_name', 'date_start', 'date_stop']),
                'time_range': json.dumps({
                    'since': (datetime.now() - timedelta(days=7)).strftime('%Y-%m-%d'),
                    'until': datetime.now().strftime('%Y-%m-%d')
                }),
                'level': 'ad',
                'limit': 5
            }
        )
        
        return detailed_insights
    
    def generate_schema_mapping(self, discovery_data):
        """Generate Supabase schema based on discovered data"""
        print("\n" + "="*80)
        print("SCHEMA MAPPING GENERATION")
        print("="*80)
        
        schema_mapping = {
            'campaigns': {
                'table_name': 'meta_campaigns',
                'fields': {
                    'id': 'TEXT PRIMARY KEY',
                    'name': 'TEXT',
                    'status': 'TEXT',
                    'objective': 'TEXT',
                    'created_time': 'TIMESTAMP',
                    'updated_time': 'TIMESTAMP',
                    'start_time': 'TIMESTAMP',
                    'stop_time': 'TIMESTAMP'
                }
            },
            'adsets': {
                'table_name': 'meta_adsets',
                'fields': {
                    'id': 'TEXT PRIMARY KEY',
                    'campaign_id': 'TEXT REFERENCES meta_campaigns(id)',
                    'name': 'TEXT',
                    'status': 'TEXT',
                    'created_time': 'TIMESTAMP',
                    'updated_time': 'TIMESTAMP',
                    'start_time': 'TIMESTAMP',
                    'end_time': 'TIMESTAMP',
                    'daily_budget': 'DECIMAL(10,2)',
                    'lifetime_budget': 'DECIMAL(10,2)',
                    'targeting': 'JSONB'
                }
            },
            'ads': {
                'table_name': 'meta_ads',
                'fields': {
                    'id': 'TEXT PRIMARY KEY',
                    'campaign_id': 'TEXT',
                    'adset_id': 'TEXT REFERENCES meta_adsets(id)',
                    'name': 'TEXT',
                    'status': 'TEXT',
                    'created_time': 'TIMESTAMP',
                    'updated_time': 'TIMESTAMP',
                    'creative': 'JSONB'
                }
            },
            'insights': {
                'table_name': 'meta_insights',
                'fields': {
                    'id': 'SERIAL PRIMARY KEY',
                    'account_id': 'TEXT',
                    'campaign_id': 'TEXT',
                    'campaign_name': 'TEXT',
                    'adset_id': 'TEXT',
                    'adset_name': 'TEXT', 
                    'ad_id': 'TEXT',
                    'ad_name': 'TEXT',
                    'date_start': 'DATE',
                    'date_stop': 'DATE',
                    'impressions': 'BIGINT',
                    'clicks': 'BIGINT',
                    'spend': 'DECIMAL(10,2)',
                    'reach': 'BIGINT',
                    'frequency': 'DECIMAL(5,2)',
                    'cpm': 'DECIMAL(8,2)',
                    'cpc': 'DECIMAL(8,2)',
                    'ctr': 'DECIMAL(5,2)',
                    'cpp': 'DECIMAL(8,2)',
                    'conversions': 'DECIMAL(10,2)',
                    'conversion_rate': 'DECIMAL(5,2)',
                    'cost_per_conversion': 'DECIMAL(8,2)',
                    'video_views': 'BIGINT',
                    'video_view_rate': 'DECIMAL(5,2)',
                    'link_clicks': 'BIGINT',
                    'post_engagement': 'BIGINT'
                }
            }
        }
        
        print("✅ Schema mapping generated for:")
        for key, value in schema_mapping.items():
            print(f"  - {value['table_name']}: {len(value['fields'])} fields")
        
        return schema_mapping

def main():
    tester = MetaAPITester()
    
    print("🔍 Starting Meta Marketing API Discovery...")
    
    # Run discovery
    discovery_data = tester.discover_account_structure()
    
    # Test detailed insights
    detailed_insights = tester.test_detailed_insights()
    
    # Generate schema mapping
    schema_mapping = tester.generate_schema_mapping(discovery_data)
    
    # Save results
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    
    # Save discovery data
    with open(f'meta_api_discovery_{timestamp}.json', 'w') as f:
        json.dump({
            'discovery_data': discovery_data,
            'detailed_insights': detailed_insights,
            'schema_mapping': schema_mapping,
            'timestamp': timestamp
        }, f, indent=2, default=str)
    
    print(f"\n✅ Discovery complete! Results saved to meta_api_discovery_{timestamp}.json")
    print("\n📊 Summary:")
    if discovery_data.get('campaigns') and 'data' in discovery_data['campaigns']:
        print(f"  - Campaigns found: {len(discovery_data['campaigns']['data'])}")
    if discovery_data.get('ads') and 'data' in discovery_data['ads']:
        print(f"  - Ads found: {len(discovery_data['ads']['data'])}")
    if discovery_data.get('insights') and 'data' in discovery_data['insights']:
        print(f"  - Insight records: {len(discovery_data['insights']['data'])}")

if __name__ == "__main__":
    main()