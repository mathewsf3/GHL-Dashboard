#!/usr/bin/env python3
"""
GoHighLevel API Test Script
This script tests the GHL API connection and explores available endpoints
"""

import requests
import json
from datetime import datetime

# API Configuration
API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2NhdGlvbl9pZCI6IjZLVEM2S0pNZUNhT25CVkhzdGlzIiwidmVyc2lvbiI6MSwiaWF0IjoxNzUxNDcwNTY1OTA1LCJzdWIiOiJJblFHTUM1MXFLbUkwQzMzVFRZMCJ9.-XT16wR4MwRi7brSOW105H5bezCImedheTbwOPj19HI"
BASE_URL = "https://rest.gohighlevel.com/v1"

# Headers for API requests
headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

def test_api_connection():
    """Test basic API connection"""
    print("Testing GHL API connection...")
    
    # Try to get location info first
    try:
        response = requests.get(f"{BASE_URL}/locations", headers=headers)
        print(f"Location endpoint status: {response.status_code}")
        if response.status_code == 200:
            print("Location data:", json.dumps(response.json(), indent=2))
        else:
            print("Response:", response.text)
    except Exception as e:
        print(f"Error accessing locations: {e}")
    
    print("\n" + "="*50 + "\n")

def get_contacts(limit=10):
    """Fetch contacts from GHL"""
    print(f"Fetching contacts (limit: {limit})...")
    
    params = {
        "limit": limit,
        "offset": 0
    }
    
    try:
        response = requests.get(f"{BASE_URL}/contacts", headers=headers, params=params)
        print(f"Contacts endpoint status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Total contacts: {data.get('total', 'Unknown')}")
            print(f"Contacts retrieved: {len(data.get('contacts', []))}")
            
            # Display first contact as example
            if data.get('contacts'):
                print("\nFirst contact example:")
                print(json.dumps(data['contacts'][0], indent=2))
            
            return data
        else:
            print("Response:", response.text)
            return None
    except Exception as e:
        print(f"Error fetching contacts: {e}")
        return None
    
    print("\n" + "="*50 + "\n")

def get_contacts_with_filters():
    """Test contact filtering capabilities"""
    print("Testing contact filtering...")
    
    # Common filter parameters based on typical CRM filters
    filter_tests = [
        {
            "name": "By tag",
            "params": {"tag": "lead", "limit": 5}
        },
        {
            "name": "By date range",
            "params": {
                "startDate": "2024-01-01",
                "endDate": "2024-12-31",
                "limit": 5
            }
        },
        {
            "name": "By custom field",
            "params": {
                "customField": "status",
                "customValue": "active",
                "limit": 5
            }
        }
    ]
    
    for test in filter_tests:
        print(f"\nTesting filter: {test['name']}")
        try:
            response = requests.get(f"{BASE_URL}/contacts", headers=headers, params=test['params'])
            print(f"Status: {response.status_code}")
            if response.status_code == 200:
                data = response.json()
                print(f"Results found: {len(data.get('contacts', []))}")
            else:
                print(f"Response: {response.text[:200]}...")
        except Exception as e:
            print(f"Error: {e}")
    
    print("\n" + "="*50 + "\n")

def explore_smartlist_endpoints():
    """Explore potential smartlist/views endpoints"""
    print("Exploring potential smartlist endpoints...")
    
    # Potential endpoints based on typical REST patterns
    endpoints_to_test = [
        "/smartlists",
        "/smart-lists",
        "/views",
        "/saved-searches",
        "/contact-lists",
        "/segments",
        "/filters",
        "/custom-views"
    ]
    
    for endpoint in endpoints_to_test:
        try:
            response = requests.get(f"{BASE_URL}{endpoint}", headers=headers)
            print(f"{endpoint}: Status {response.status_code}")
            if response.status_code == 200:
                print(f"  Found valid endpoint! Response preview: {response.text[:100]}...")
        except Exception as e:
            print(f"{endpoint}: Error - {str(e)[:50]}...")
    
    print("\n" + "="*50 + "\n")

def main():
    """Main execution function"""
    print(f"GoHighLevel API Test Script")
    print(f"Started at: {datetime.now()}")
    print("="*50 + "\n")
    
    # Run tests
    test_api_connection()
    get_contacts()
    get_contacts_with_filters()
    explore_smartlist_endpoints()
    
    print(f"\nCompleted at: {datetime.now()}")

if __name__ == "__main__":
    main()