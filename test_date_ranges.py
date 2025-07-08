#!/usr/bin/env python3
"""Test all date range presets to ensure they work correctly"""
import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:3000/api/dashboard"

# Test all presets
presets = ['last7d', 'last30d', 'thisMonth', 'lastMonth']

print("Testing Date Range Presets")
print("=" * 60)

for preset in presets:
    print(f"\nTesting preset: {preset}")
    try:
        response = requests.get(f"{BASE_URL}?dateRange={preset}", timeout=30)
        if response.status_code == 200:
            data = response.json().get('data', {})
            print(f"✅ Success - Applications: {data.get('totalApplications', 'N/A')}, MQLs: {data.get('totalMQLs', 'N/A')}")
        else:
            print(f"❌ Error: Status {response.status_code}")
    except Exception as e:
        print(f"❌ Error: {e}")

# Test custom date range
print(f"\nTesting custom range: July 1-8, 2025")
try:
    response = requests.get(f"{BASE_URL}?startDate=2025-07-01&endDate=2025-07-08", timeout=30)
    if response.status_code == 200:
        data = response.json().get('data', {})
        print(f"✅ Success - Applications: {data.get('totalApplications', 'N/A')}, MQLs: {data.get('totalMQLs', 'N/A')}, Calls: {data.get('callsBooked', 'N/A')}")
    else:
        print(f"❌ Error: Status {response.status_code}")
except Exception as e:
    print(f"❌ Error: {e}")

print("\n" + "=" * 60)
print("✓ All date ranges should return data without errors")