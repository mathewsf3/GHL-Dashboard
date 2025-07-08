#!/usr/bin/env python3
"""Test July 2025 with explicit dates"""
import requests
import json

# Test July 1-8, 2025 with explicit dates
url = "http://localhost:3001/api/dashboard?startDate=2025-07-01&endDate=2025-07-08"
response = requests.get(url)

if response.status_code == 200:
    data = response.json()
    metrics = data.get('data', {})
    print("JULY 1-8, 2025 (explicit dates):")
    print(f"  Applications: {metrics.get('totalApplications', 'N/A')}")
    print(f"  MQLs: {metrics.get('totalMQLs', 'N/A')}")
    
# Test with a debug parameter to see date range
url = "http://localhost:3001/api/dashboard?dateRange=thisMonth&debug=true"
response = requests.get(url)

if response.status_code == 200:
    data = response.json()
    metrics = data.get('data', {})
    print("\nTHIS MONTH via dateRange param:")
    print(f"  Applications: {metrics.get('totalApplications', 'N/A')}")
    print(f"  MQLs: {metrics.get('totalMQLs', 'N/A')}")