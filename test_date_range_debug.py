#!/usr/bin/env python3
"""Debug date range calculation"""
import requests

# Make request and check server logs
print("Testing thisMonth - check server logs for date range...")
url = "http://localhost:3001/api/dashboard?dateRange=thisMonth"
response = requests.get(url)

# Also test July explicitly
print("\nTesting July 2025 explicitly...")
url = "http://localhost:3001/api/dashboard?startDate=2025-07-01&endDate=2025-07-31" 
response = requests.get(url)

if response.status_code == 200:
    data = response.json()
    metrics = data.get('data', {})
    print(f"July 2025 full month: Applications={metrics.get('totalApplications')}, MQLs={metrics.get('totalMQLs')}")