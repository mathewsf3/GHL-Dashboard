#!/usr/bin/env python3
"""Test dashboard MQL counts for different date ranges"""
import requests
import json

def test_dashboard(date_range):
    """Test dashboard API with specific date range"""
    url = f"http://localhost:3001/api/dashboard?dateRange={date_range}"
    response = requests.get(url)
    
    if response.status_code == 200:
        data = response.json()
        metrics = data.get('data', {})
        print(f"\n{date_range.upper()}:")
        print(f"  Applications: {metrics.get('totalApplications', 'N/A')}")
        print(f"  MQLs: {metrics.get('totalMQLs', 'N/A')}")
        print(f"  Calls Booked: {metrics.get('callsBooked', 'N/A')}")
        print(f"  Intros Taken: {metrics.get('introsTaken', 'N/A')}")
        print(f"  Contracts Sent: {metrics.get('contractsSent', 'N/A')}")
        print(f"  Deals Won: {metrics.get('dealsWon', 'N/A')}")
    else:
        print(f"\nError for {date_range}: {response.status_code}")

if __name__ == "__main__":
    print("DASHBOARD MQL TESTING")
    print("=" * 40)
    
    # Test different date ranges
    test_dashboard("thisWeek")
    test_dashboard("thisMonth")
    test_dashboard("lastMonth")
    test_dashboard("last30Days")
    
    print("\n" + "=" * 40)
    print("Note: MQL count should be ~21 for this month")