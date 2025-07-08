#!/usr/bin/env python3
"""Test specific date range with exact dates"""
import requests
import json

# Test with explicit date range
url = "http://localhost:3001/api/dashboard?startDate=2025-01-01&endDate=2025-01-31"
response = requests.get(url)

if response.status_code == 200:
    data = response.json()
    metrics = data.get('data', {})
    print("JANUARY 2025 (explicit dates):")
    print(f"  Applications: {metrics.get('totalApplications', 'N/A')}")
    print(f"  MQLs: {metrics.get('totalMQLs', 'N/A')}")
    
# Test thisMonth which should be July 2025
url = "http://localhost:3001/api/dashboard?dateRange=thisMonth"
response = requests.get(url)

if response.status_code == 200:
    data = response.json()
    metrics = data.get('data', {})
    print("\nTHIS MONTH (July 2025):")
    print(f"  Applications: {metrics.get('totalApplications', 'N/A')}")
    print(f"  MQLs: {metrics.get('totalMQLs', 'N/A')}")