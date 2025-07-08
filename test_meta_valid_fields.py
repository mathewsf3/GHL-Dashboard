#!/usr/bin/env python3
"""
Test Meta Marketing API with valid fields only
"""

import requests
import json
from datetime import datetime, timedelta

# Meta Marketing API Configuration
META_ACCESS_TOKEN = "EAA5tn96zDjABO5HtIZBVpN5aMNgfq9KKjF6JCJfjRKZAxic6H9jmZASNHgNuCb8uTcuv1rjXbtBUCQOQwVwGPBVJouR3ar2C56KxY3Ul69GbQEUECQyxO9BFeXuZAlL0ZBZC6CZBTk3UH5EKYlfG4oMiodr7lbLmFv2WWUd521yTvZBGZB0hottGG3Wnx4ZCnTv4b4aOg7"
META_ACCOUNT_ID = "act_586708888754645"

def test_valid_insights():
    """Test with confirmed valid insight fields"""
    base_url = "https://graph.facebook.com/v18.0"
    
    # Valid insight fields based on Meta documentation
    valid_fields = [
        'campaign_id', 'campaign_name', 'adset_id', 'adset_name', 
        'ad_id', 'ad_name', 'impressions', 'clicks', 'spend', 
        'reach', 'frequency', 'cpm', 'cpc', 'ctr', 'cpp',
        'date_start', 'date_stop'
    ]
    
    params = {
        'fields': ','.join(valid_fields),
        'time_range': json.dumps({
            'since': (datetime.now() - timedelta(days=7)).strftime('%Y-%m-%d'),
            'until': datetime.now().strftime('%Y-%m-%d')
        }),
        'level': 'ad',
        'limit': 25,
        'access_token': META_ACCESS_TOKEN
    }
    
    try:
        response = requests.get(f"{base_url}/{META_ACCOUNT_ID}/insights", params=params)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ SUCCESS - Valid insights data retrieved")
            print(f"Records returned: {len(data.get('data', []))}")
            
            if data.get('data') and len(data['data']) > 0:
                print(f"Sample record keys: {list(data['data'][0].keys())}")
                print(f"Sample record: {json.dumps(data['data'][0], indent=2)}")
            
            return data
        else:
            print("❌ ERROR")
            print(f"Error: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ EXCEPTION: {e}")
        return None

def test_campaign_details():
    """Get detailed campaign information"""
    base_url = "https://graph.facebook.com/v18.0"
    
    params = {
        'fields': 'id,name,status,objective,created_time,updated_time,start_time,stop_time,daily_budget,lifetime_budget,budget_remaining,account_id',
        'limit': 10,
        'access_token': META_ACCESS_TOKEN
    }
    
    try:
        response = requests.get(f"{base_url}/{META_ACCOUNT_ID}/campaigns", params=params)
        
        if response.status_code == 200:
            data = response.json()
            print(f"\n✅ Campaigns detailed data: {len(data.get('data', []))} campaigns")
            
            if data.get('data') and len(data['data']) > 0:
                print(f"Sample campaign: {json.dumps(data['data'][0], indent=2)}")
            
            return data
        else:
            print(f"❌ Campaign error: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Campaign exception: {e}")
        return None

def main():
    print("🔍 Testing Meta API with valid fields...")
    
    # Test valid insights
    insights_data = test_valid_insights()
    
    # Test campaign details
    campaigns_data = test_campaign_details()
    
    # Save results
    if insights_data or campaigns_data:
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        with open(f'meta_valid_data_{timestamp}.json', 'w') as f:
            json.dump({
                'insights': insights_data,
                'campaigns': campaigns_data,
                'timestamp': timestamp
            }, f, indent=2, default=str)
        
        print(f"\n✅ Valid data saved to meta_valid_data_{timestamp}.json")

if __name__ == "__main__":
    main()