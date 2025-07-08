#!/usr/bin/env python3
"""
Test GHL Smart List API Access
Attempts to access smart lists via various API endpoints
"""

import requests
import json

API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2NhdGlvbl9pZCI6IjZLVEM2S0pNZUNhT25CVkhzdGlzIiwidmVyc2lvbiI6MSwiaWF0IjoxNzUxNDcwNTY1OTA1LCJzdWIiOiJJblFHTUM1MXFLbUkwQzMzVFRZMCJ9.-XT16wR4MwRi7brSOW105H5bezCImedheTbwOPj19HI"
LOCATION_ID = "6KTC6KJMeCaOnBVHstis"
SMART_LIST_ID = "7Jve2sn8cyujOF9AYBIT"

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

def test_endpoints():
    """Test various potential smart list endpoints"""
    
    # Base URLs to try
    base_urls = [
        "https://rest.gohighlevel.com/v1",
        "https://api.gohighlevel.com/v1",
        "https://rest.gohighlevel.com/v2",
        "https://api.gohighlevel.com/v2"
    ]
    
    # Endpoint patterns to try
    endpoint_patterns = [
        f"/smart_lists/{SMART_LIST_ID}",
        f"/smart-lists/{SMART_LIST_ID}",
        f"/smartlists/{SMART_LIST_ID}",
        f"/locations/{LOCATION_ID}/smart_lists/{SMART_LIST_ID}",
        f"/locations/{LOCATION_ID}/smart-lists/{SMART_LIST_ID}",
        f"/locations/{LOCATION_ID}/smartlists/{SMART_LIST_ID}",
        f"/contacts/smart_list/{SMART_LIST_ID}",
        f"/contacts/smart-list/{SMART_LIST_ID}",
        f"/contacts/smartlist/{SMART_LIST_ID}",
        f"/locations/{LOCATION_ID}/contacts/smart_list/{SMART_LIST_ID}",
        f"/locations/{LOCATION_ID}/contacts/smart-list/{SMART_LIST_ID}",
        f"/locations/{LOCATION_ID}/contacts/smartlist/{SMART_LIST_ID}",
        # Also try listing all smart lists
        f"/smart_lists",
        f"/smart-lists",
        f"/smartlists",
        f"/locations/{LOCATION_ID}/smart_lists",
        f"/locations/{LOCATION_ID}/smart-lists",
        f"/locations/{LOCATION_ID}/smartlists"
    ]
    
    print(f"Testing smart list access for ID: {SMART_LIST_ID}")
    print(f"Location ID: {LOCATION_ID}")
    print("="*60)
    
    successful_endpoints = []
    
    for base_url in base_urls:
        print(f"\nTesting base URL: {base_url}")
        print("-"*40)
        
        for endpoint in endpoint_patterns:
            full_url = f"{base_url}{endpoint}"
            
            try:
                response = requests.get(full_url, headers=headers, timeout=5)
                
                if response.status_code == 200:
                    print(f"✓ SUCCESS: {endpoint}")
                    print(f"  Status: {response.status_code}")
                    print(f"  Response preview: {response.text[:200]}...")
                    successful_endpoints.append(full_url)
                    
                    # Try to parse and display data
                    try:
                        data = response.json()
                        print(f"  Data type: {type(data)}")
                        if isinstance(data, dict):
                            print(f"  Keys: {list(data.keys())[:5]}...")
                        elif isinstance(data, list):
                            print(f"  List length: {len(data)}")
                    except:
                        pass
                        
                elif response.status_code == 401:
                    print(f"✗ {endpoint} - Unauthorized (check API key)")
                elif response.status_code == 403:
                    print(f"✗ {endpoint} - Forbidden (no access)")
                elif response.status_code == 404:
                    # Don't print 404s to reduce noise
                    pass
                else:
                    print(f"? {endpoint} - Status: {response.status_code}")
                    
            except requests.exceptions.Timeout:
                print(f"✗ {endpoint} - Timeout")
            except requests.exceptions.ConnectionError:
                print(f"✗ {endpoint} - Connection error")
            except Exception as e:
                print(f"✗ {endpoint} - Error: {str(e)[:50]}")
    
    print("\n" + "="*60)
    print("SUMMARY:")
    if successful_endpoints:
        print(f"Found {len(successful_endpoints)} working endpoints:")
        for url in successful_endpoints:
            print(f"  - {url}")
    else:
        print("No smart list endpoints found via API")
        print("\nThis suggests that GHL does not expose smart lists through their REST API.")
        print("Smart lists appear to be a UI-only feature at this time.")
    
    # Test if we can at least get contact with filters that might match the smart list
    print("\n" + "="*60)
    print("Alternative: Testing contact filtering to simulate smart list...")
    
    try:
        # Get contacts with various filters
        params = {
            "limit": 5,
            "includeCustomFields": "true",
            "includeDetails": "true"
        }
        
        response = requests.get(
            f"https://rest.gohighlevel.com/v1/contacts",
            headers=headers,
            params=params
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Can fetch contacts with filters")
            print(f"  Total contacts available: {data.get('total', 'Unknown')}")
            print(f"  Sample contact fields: {list(data.get('contacts', [{}])[0].keys())[:10]}...")
            print("\nRecommendation: Use contact filters to recreate smart list logic")
        else:
            print(f"✗ Contact fetch failed: {response.status_code}")
            
    except Exception as e:
        print(f"✗ Error testing contacts: {e}")

if __name__ == "__main__":
    test_endpoints()