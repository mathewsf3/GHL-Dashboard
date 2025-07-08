#!/usr/bin/env python3
"""Test creative analysis endpoint to verify it matches dashboard"""
import requests
import json

# Test July 1-8 for both endpoints
date_params = "?startDate=2025-07-01&endDate=2025-07-08"

print("Testing Creative Analysis vs Dashboard for July 1-8, 2025")
print("=" * 60)

# Test dashboard
dashboard_url = f"http://localhost:3000/api/dashboard{date_params}"
try:
    dashboard_response = requests.get(dashboard_url, timeout=30)
    if dashboard_response.status_code == 200:
        dashboard_data = dashboard_response.json().get('data', {})
        print("\nDASHBOARD RESULTS:")
        print(f"  Applications: {dashboard_data.get('totalApplications', 'N/A')}")
        print(f"  MQLs: {dashboard_data.get('totalMQLs', 'N/A')}")
        print(f"  Booked Calls: {dashboard_data.get('callsBooked', 'N/A')}")
        print(f"  Intros Taken: {dashboard_data.get('introsTaken', 'N/A')}")
        print(f"  Contracts Sent: {dashboard_data.get('contractsSent', 'N/A')}")
        print(f"  Deals Won: {dashboard_data.get('dealsWon', 'N/A')}")
except Exception as e:
    print(f"Dashboard error: {e}")

# Test creative analysis
creative_url = f"http://localhost:3000/api/creative-analysis{date_params}"
try:
    creative_response = requests.get(creative_url, timeout=30)
    if creative_response.status_code == 200:
        creative_data = creative_response.json()
        
        # Sum up all metrics from creative data
        total_apps = sum(c.get('applications', 0) for c in creative_data.get('creativeData', []))
        total_mqls = sum(c.get('mqls', 0) for c in creative_data.get('creativeData', []))
        total_calls = sum(c.get('callsBooked', 0) for c in creative_data.get('creativeData', []))
        total_intros = sum(c.get('callsTaken', 0) for c in creative_data.get('creativeData', []))
        total_contracts = sum(c.get('contractsSent', 0) for c in creative_data.get('creativeData', []))
        total_deals = sum(c.get('dealsWon', 0) for c in creative_data.get('creativeData', []))
        
        print("\nCREATIVE ANALYSIS TOTALS:")
        print(f"  Applications: {total_apps}")
        print(f"  MQLs: {total_mqls}")
        print(f"  Booked Calls: {total_calls}")
        print(f"  Intros Taken: {total_intros}")
        print(f"  Contracts Sent: {total_contracts}")
        print(f"  Deals Won: {total_deals}")
        
        # Show top creatives
        print("\nTOP CREATIVES BY MQLs:")
        sorted_creatives = sorted(creative_data.get('creativeData', []), 
                                 key=lambda x: x.get('mqls', 0), 
                                 reverse=True)[:5]
        for i, creative in enumerate(sorted_creatives, 1):
            print(f"  {i}. {creative.get('creative', 'Unknown')}: {creative.get('mqls', 0)} MQLs")
        
except Exception as e:
    print(f"Creative analysis error: {e}")

print("\n" + "=" * 60)
print("✓ Both endpoints should show the same totals for consistency")